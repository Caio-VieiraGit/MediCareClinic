const { Consulta, Paciente, Profissional, Atendimento } = require('../models')
const { Op } = require('sequelize');
const { registrarAuditoria } = require('../helpers/auditoria')

// Diferença em minutos entre dois horários "HH:mm" ou "HH:mm:ss"
function minutosEntre(hora1, hora2) {
  const [h1, m1] = hora1.split(':').map(Number)
  const [h2, m2] = hora2.split(':').map(Number)
  return Math.abs((h1 * 60 + m1) - (h2 * 60 + m2))
}

// Junta data (YYYY-MM-DD) + hora (HH:mm[:ss]) num Date
function combinarDataHora(data_consulta, hora_consulta) {
  return new Date(`${data_consulta}T${hora_consulta}`)
}

// RN03 + RN06: nenhuma outra consulta ativa do mesmo médico pode cair a menos
// de 30 minutos do horário informado, no mesmo dia. Passe ignorarId ao editar
// uma consulta existente, pra ela não conflitar consigo mesma.
async function existeConflitoHorario({ medicoId, data_consulta, hora_consulta, ignorarId }) {
  const where = {
    medicoId,
    data_consulta,
    status: { [Op.notIn]: ['cancelada', 'faltou'] }
  }
  if (ignorarId) where.id = { [Op.ne]: ignorarId }

  const consultasDoDia = await Consulta.findAll({ where })
  return consultasDoDia.some(c => minutosEntre(c.hora_consulta, hora_consulta) < 30)
}

// RN09: paciente não pode ter mais de uma consulta ativa com o mesmo médico no mesmo dia
async function existeConsultaDuplicadaNoDia({ pacienteId, medicoId, data_consulta, ignorarId }) {
  const where = {
    pacienteId,
    medicoId,
    data_consulta,
    status: { [Op.notIn]: ['cancelada', 'faltou'] }
  }
  if (ignorarId) where.id = { [Op.ne]: ignorarId }

  const existente = await Consulta.findOne({ where })
  return !!existente
}

// RN11 + fluxo do documento: transições de status permitidas.
// Um status ausente do mapa (realizada, cancelada, faltou) é terminal —
// nenhuma transição a partir dele é permitida.
const TRANSICOES_VALIDAS = {
  agendada: ['confirmada', 'em_atendimento', 'cancelada', 'faltou'],
  confirmada: ['em_atendimento', 'cancelada', 'faltou'],
  em_atendimento: ['realizada', 'cancelada'],
}

function transicaoPermitida(statusAtual, novoStatus) {
  if (statusAtual === novoStatus) return true // no-op, não é uma transição de fato
  return (TRANSICOES_VALIDAS[statusAtual] || []).includes(novoStatus)
}

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']

// RN05: a consulta deve respeitar o dia/horário de atendimento do médico.
// Se o médico não tiver disponibilidade configurada (horario_inicio/fim),
// não bloqueia — mantém retrocompatibilidade com cadastros antigos.
async function validarDisponibilidadeMedico({ medicoId, data_consulta, hora_consulta }) {
  const medico = await Profissional.findByPk(medicoId)
  if (!medico) return { ok: false, erro: 'Médico não encontrado.' }
  if (!medico.horario_inicio || !medico.horario_fim) return { ok: true }

  const diaSemana = DIAS_SEMANA[new Date(`${data_consulta}T00:00:00`).getDay()]
  if (medico.dias_disponiveis) {
    const dias = medico.dias_disponiveis.split(',').map((d) => d.trim())
    if (!dias.includes(diaSemana)) {
      return { ok: false, erro: `O médico não atende nesse dia da semana (${diaSemana}).` }
    }
  }

  const [hi, mi] = medico.horario_inicio.split(':').map(Number)
  const [hf, mf] = medico.horario_fim.split(':').map(Number)
  const [h, m] = hora_consulta.split(':').map(Number)
  const minutosSolicitado = h * 60 + m
  if (minutosSolicitado < hi * 60 + mi || minutosSolicitado >= hf * 60 + mf) {
    return { ok: false, erro: `Fora do horário de atendimento do médico (${medico.horario_inicio} às ${medico.horario_fim}).` }
  }
  return { ok: true }
}


//GET /consultas
exports.listar = async (req, res) => {
    try{
        const { data, medicoId, pacienteId, status } = req.query;
        const where = {}

        //Aplica filtros se existirem na requisição
        if (data) where.data_consulta = data;
        if (medicoId) where.medicoId = medicoId;
        if (pacienteId) where.pacienteId = pacienteId;
        if (status) where.status = status;

        const consultas = await Consulta.findAll({
            where,
            include:[
                { model: Paciente, as: 'paciente', attributes: ['id', 'nome', 'cpf'] },
                { model: Profissional, as: 'medico', attributes: ['id', 'nome', 'especialidade'] }
            ],
            order: [['data_consulta', 'ASC'], ['hora_consulta', 'ASC']]
        });
        res.json(consultas);
    } catch (error){
        res.status(500).json({erro: 'Erro ao listar consultar.', detalhe: error.message})
    }
}

exports.totalAgendadas = async (req, res) => {
  try {
    const total = await Consulta.count({
      where: { status: 'agendada' }
    })
    res.json({ totalAgendadas: total })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao contar consultas agendadas.' })
  }
}

exports.consultasPendentes = async (req, res) => {
  try {
    const consultas = await Consulta.findAll({
      where: {
        status: ['agendada', 'confirmada', 'em_atendimento']
      },
      include: [
        { model: Paciente, as: 'paciente' },
        { model: Profissional, as: 'medico' },
         { model: Profissional, as: 'recepcionista' },
        { model: Atendimento } // sem alias porque não definiu
      ]
    })

    // filtra apenas as que ainda não têm atendimento
    const pendentes = consultas.filter(c => !c.Atendimento)
    res.json(pendentes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Erro ao buscar consultas pendentes.' })
  }
}

//GET /consultas/:id
exports.buscarPorId = async (req, res) =>{
    try{
        const consulta = await Consulta.findByPk(req.params.id, {
            include:[
                { model: Paciente, as: 'paciente' },
                { model: Profissional, as: 'medico' }
            ]
        });
        if(!consulta) return res.status(404).json({erro: 'Consulta não encontrada.'});
        res.json(consulta);
    } catch (error) {
        res.status(500).json({erro: 'Erro ao buscar consulta'})
    }
}

//POST /consultas
exports.criar = async (req, res) => {
  try {
    const { pacienteId, medicoId, data_consulta, hora_consulta, tipo, motivo } = req.body;

    const disponibilidade = await validarDisponibilidadeMedico({ medicoId, data_consulta, hora_consulta });
    if (!disponibilidade.ok) {
      return res.status(400).json({ erro: disponibilidade.erro });
    }

    if (await existeConflitoHorario({ medicoId, data_consulta, hora_consulta })) {
      return res.status(400).json({ erro: 'Horário indisponível para este médico (intervalo mínimo de 30 minutos entre consultas).' });
    }

    if (await existeConsultaDuplicadaNoDia({ pacienteId, medicoId, data_consulta })) {
      return res.status(400).json({ erro: 'Este paciente já tem uma consulta agendada com este médico neste dia.' });
    }

    const protocolo = `${new Date().getFullYear()}${Math.floor(Math.random() * 10000)}`;

    const novaConsulta = await Consulta.create({
  protocolo,
  pacienteId,
  medicoId,
  data_consulta,
  hora_consulta,
  tipo,
  motivo,
  status: 'agendada',
  agendadoPor: req.user.id   // ✅ quem agendou
})
    res.status(201).json(novaConsulta);

    registrarAuditoria({
      usuarioId: req.user.id,
      acao: 'CREATE',
      entidade: 'Consulta',
      entidadeId: novaConsulta.id,
      detalhes: { protocolo, status: 'agendada' },
    })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao agendar consulta.', detalhe: error.message });
  }
};

//PATCH /consultas/:id (Atualizar dados gerais da consulta)
exports.atualizar = async (req, res) => {
    try {
        const consulta = await Consulta.findByPk(req.params.id);
        if (!consulta) return res.status(404).json({ erro: 'Consulta não encontrada.' });

        // RN11: consulta já realizada não pode ser editada
        if (consulta.status === 'realizada') {
            return res.status(400).json({ erro: 'Consulta já realizada não pode ser editada.' });
        }

        const { pacienteId, medicoId, data_consulta, hora_consulta, tipo, motivo, observacoes } = req.body;

        // Valores efetivos: o que veio no PATCH, com fallback pro que já está salvo —
        // assim a validação roda mesmo quando só um dos três campos muda (ex.: só a hora).
        const efetivo = {
            pacienteId: pacienteId ?? consulta.pacienteId,
            medicoId: medicoId ?? consulta.medicoId,
            data_consulta: data_consulta ?? consulta.data_consulta,
            hora_consulta: hora_consulta ?? consulta.hora_consulta,
        }

        const mudouHorarioOuMedico =
            (medicoId && medicoId !== consulta.medicoId) ||
            (data_consulta && data_consulta !== consulta.data_consulta) ||
            (hora_consulta && hora_consulta !== consulta.hora_consulta)

        if (mudouHorarioOuMedico) {
            const disponibilidade = await validarDisponibilidadeMedico(efetivo);
            if (!disponibilidade.ok) {
                return res.status(400).json({ erro: disponibilidade.erro });
            }
            if (await existeConflitoHorario({ ...efetivo, ignorarId: consulta.id })) {
                return res.status(400).json({ erro: 'Horário indisponível para este médico (intervalo mínimo de 30 minutos entre consultas).' });
            }
            if (await existeConsultaDuplicadaNoDia({ ...efetivo, ignorarId: consulta.id })) {
                return res.status(400).json({ erro: 'Este paciente já tem uma consulta agendada com este médico neste dia.' });
            }
        }

        // Só aplica os campos realmente enviados — um PATCH parcial não deve
        // apagar os demais campos da consulta.
        const dadosParaAtualizar = { updatedBy: req.user.id };
        for (const [chave, valor] of Object.entries({ pacienteId, medicoId, data_consulta, hora_consulta, tipo, motivo, observacoes })) {
            if (valor !== undefined) dadosParaAtualizar[chave] = valor;
        }

        await consulta.update(dadosParaAtualizar);
        res.json(consulta);

        registrarAuditoria({
            usuarioId: req.user.id,
            acao: 'UPDATE',
            entidade: 'Consulta',
            entidadeId: consulta.id,
            detalhes: { camposAlterados: Object.keys(dadosParaAtualizar).filter((c) => c !== 'updatedBy') },
        })
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar consulta.', detalhe: error.message });
    }
}

//PATCH /consultas/:id/status (Atualizar o status)
exports.atualizarStatus = async (req, res) => {
    try{
        const { status } = req.body;
        const consulta = await Consulta.findByPk(req.params.id);

        if(!consulta) return res.status(404).json({erro: 'Consulta não encontrada.'});

        if (!transicaoPermitida(consulta.status, status)) {
            return res.status(400).json({
                erro: `Não é possível mudar o status de "${consulta.status}" para "${status}".`
            });
        }

        const dadosExtra = { status, updatedBy: req.user.id };
        if (status === 'confirmada') dadosExtra.data_confirmacao = new Date();

        const statusAnterior = consulta.status;
        await consulta.update(dadosExtra);
        res.json(consulta);

        registrarAuditoria({
            usuarioId: req.user.id,
            acao: 'STATUS_CHANGE',
            entidade: 'Consulta',
            entidadeId: consulta.id,
            detalhes: { de: statusAnterior, para: status },
        })
    } catch (error) {
        res.status(500).json({erro: 'Erro ao atualizar status.'})
    }
}

// PATCH /consultas/:id/confirmar — alias dedicado (RF09 / rota citada no documento)
exports.confirmar = async (req, res) => {
    try {
        const consulta = await Consulta.findByPk(req.params.id);
        if (!consulta) return res.status(404).json({ erro: 'Consulta não encontrada.' });

        if (!transicaoPermitida(consulta.status, 'confirmada')) {
            return res.status(400).json({
                erro: `Não é possível confirmar uma consulta com status "${consulta.status}".`
            });
        }

        await consulta.update({ status: 'confirmada', data_confirmacao: new Date(), updatedBy: req.user.id });
        res.json(consulta);

        registrarAuditoria({
            usuarioId: req.user.id,
            acao: 'CONFIRM',
            entidade: 'Consulta',
            entidadeId: consulta.id,
        })
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao confirmar consulta.' });
    }
}

//PATCH /consultas/:id/cancelar
exports.cancelar = async (req, res) => {
  try {
    const { motivo_cancelamento } = req.body;
    const consulta = await Consulta.findByPk(req.params.id);

    if (!consulta) return res.status(404).json({ erro: 'Consulta não encontrada.' });

    if (!transicaoPermitida(consulta.status, 'cancelada')) {
      return res.status(400).json({ erro: `Não é possível cancelar uma consulta com status "${consulta.status}".` });
    }

    // RN07: cancelamento só é permitido com no mínimo 4h de antecedência
    const dataHoraConsulta = combinarDataHora(consulta.data_consulta, consulta.hora_consulta);
    const horasRestantes = (dataHoraConsulta - new Date()) / (1000 * 60 * 60);
    if (horasRestantes < 4) {
      return res.status(400).json({ erro: 'Cancelamento só é permitido com no mínimo 4 horas de antecedência.' });
    }

    await consulta.update({
      status: 'cancelada',
      motivo_cancelamento,
      data_cancelamento: new Date(),
      updatedBy: req.user.id
    });
    res.json({ mensagem: 'Consulta cancelada com sucesso.' });

    registrarAuditoria({
      usuarioId: req.user.id,
      acao: 'CANCEL',
      entidade: 'Consulta',
      entidadeId: consulta.id,
      detalhes: { motivo_cancelamento: motivo_cancelamento || null },
    })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cancelar consulta.', detalhe: error.message });
  }
}

// GET /api/agenda — visão geral da agenda do dia (todas as consultas de uma data)
exports.agendaDoDia = async (req, res) => {
  try {
    const data = req.query.data || new Date().toISOString().split('T')[0];
    const consultas = await Consulta.findAll({
      where: { data_consulta: data },
      include: [
        { model: Paciente, as: 'paciente', attributes: ['id', 'nome', 'cpf'] },
        { model: Profissional, as: 'medico', attributes: ['id', 'nome', 'especialidade'] },
      ],
      order: [['hora_consulta', 'ASC']],
    });
    res.json({ data, consultas });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar agenda do dia.' });
  }
};

// GET /api/medicos/:id/consultas — consultas de um médico específico
exports.consultasPorMedico = async (req, res) => {
  try {
    const { data, status } = req.query;
    const where = { medicoId: req.params.id };
    if (data) where.data_consulta = data;
    if (status) where.status = status;

    const consultas = await Consulta.findAll({
      where,
      include: [{ model: Paciente, as: 'paciente', attributes: ['id', 'nome', 'cpf'] }],
      order: [['data_consulta', 'ASC'], ['hora_consulta', 'ASC']],
    });
    res.json(consultas);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar consultas do médico.' });
  }
};
exports.excluir = async (req, res) => {
  try {
    const consulta = await Consulta.findByPk(req.params.id);

    if (!consulta) {
      return res.status(404).json({ erro: 'Consulta não encontrada.' });
    }

    // Preserva o histórico clínico: uma consulta já realizada não pode ser
    // apagada (ela deve ficar visível no prontuário do paciente). Para os
    // demais status, a exclusão definitiva continua permitida (ex.: engano
    // no agendamento).
    if (consulta.status === 'realizada') {
      return res.status(400).json({ erro: 'Consulta já realizada não pode ser excluída — cancele-a caso precise removê-la da agenda ativa.' });
    }

    await consulta.destroy();   // remove do banco
    res.json({ mensagem: 'Consulta excluída com sucesso.' });

    registrarAuditoria({
      usuarioId: req.user.id,
      acao: 'DELETE',
      entidade: 'Consulta',
      entidadeId: consulta.id,
    })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir consulta.', detalhe: error.message });
  }
};
