const { Consulta, Paciente, Profissional, Atendimento } = require('../models')
const { Op } = require('sequelize');

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

        // Se mudou médico/data/hora, revalida conflito (RN06) e duplicidade (RN09)
        if (medicoId && data_consulta && hora_consulta) {
            if (await existeConflitoHorario({ medicoId, data_consulta, hora_consulta, ignorarId: consulta.id })) {
                return res.status(400).json({ erro: 'Horário indisponível para este médico (intervalo mínimo de 30 minutos entre consultas).' });
            }
            if (await existeConsultaDuplicadaNoDia({ pacienteId: pacienteId || consulta.pacienteId, medicoId, data_consulta, ignorarId: consulta.id })) {
                return res.status(400).json({ erro: 'Este paciente já tem uma consulta agendada com este médico neste dia.' });
            }
        }

        await consulta.update({ pacienteId, medicoId, data_consulta, hora_consulta, tipo, motivo, observacoes });
        res.json(consulta);
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

        // RN11: consulta já realizada não pode ser editada (nem trocar de status)
        if (consulta.status === 'realizada') {
            return res.status(400).json({ erro: 'Consulta já realizada não pode ser editada.' });
        }

        await consulta.update({ status });
        res.json(consulta);
    } catch (error) {
        res.status(500).json({erro: 'Erro ao atualizar status.'})
    }
}

//PATCH /consultas/:id/cancelar
exports.cancelar = async (req, res) => {
  try {
    const { motivo_cancelamento } = req.body;
    const consulta = await Consulta.findByPk(req.params.id);

    if (!consulta) return res.status(404).json({ erro: 'Consulta não encontrada.' });

    // RN07: cancelamento só é permitido com no mínimo 4h de antecedência
    const dataHoraConsulta = combinarDataHora(consulta.data_consulta, consulta.hora_consulta);
    const horasRestantes = (dataHoraConsulta - new Date()) / (1000 * 60 * 60);
    if (horasRestantes < 4) {
      return res.status(400).json({ erro: 'Cancelamento só é permitido com no mínimo 4 horas de antecedência.' });
    }

    await consulta.update({
      status: 'cancelada',
      motivo_cancelamento,
      data_cancelamento: new Date()
    });
    res.json({ mensagem: 'Consulta cancelada com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cancelar consulta.', detalhe: error.message });
  }
}

// DELETE /consultas/:id
exports.excluir = async (req, res) => {
  try {
    const consulta = await Consulta.findByPk(req.params.id);

    if (!consulta) {
      return res.status(404).json({ erro: 'Consulta não encontrada.' });
    }

    await consulta.destroy();   // remove do banco
    res.json({ mensagem: 'Consulta excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir consulta.', detalhe: error.message });
  }
};
