// atendimentoController.js
const { Atendimento, Consulta, Paciente, Profissional } = require('../models');

// GET /api/atendimentos — médico vê os seus; admin vê todos
exports.listar = async (req, res) => {
  try {
    const where = req.user.perfil === 'medico' ? { medicoId: req.user.id } : {};
    const atendimentos = await Atendimento.findAll({
      where,
      include: [{
        model: Consulta, as: 'consulta',
        include: [
          { model: Paciente, as: 'paciente' },
          { model: Profissional, as: 'medico' }
        ]
      }],
      order: [['data_atendimento', 'DESC']],
    })
    res.json(atendimentos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar atendimentos.' });
  }
};

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
        { model: Atendimento }
      ]
    })

    const pendentes = consultas.filter(c => !c.Atendimento)
    res.json(pendentes)
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar consultas pendentes.' })
  }
}

// GET /api/atendimentos/:id
exports.buscarPorId = async (req, res) => {
  try {
    const atendimento = await Atendimento.findByPk(req.params.id, {
      include: [{
        model: Consulta, as: 'consulta',
        include: [
          { model: Paciente, as: 'paciente' },
          { model: Profissional, as: 'medico' }
        ]
      }]
    });
    if (!atendimento) return res.status(404).json({ erro: 'Atendimento não encontrado.' });
    res.json(atendimento);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar atendimento.' });
  }
};

// GET /api/consultas/:id/atendimento
exports.buscarPorConsulta = async (req, res) => {
  try {
    const atendimento = await Atendimento.findOne({
      where: { consultaId: req.params.id }
    });
    if (!atendimento) return res.status(404).json({ erro: 'Atendimento não encontrado para esta consulta.' });
    res.json(atendimento);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar atendimento.' });
  }
};

// POST /api/atendimentos
exports.criar = async (req, res) => {
  try {
    const {
      consultaId,
      anamnese,
      diagnostico,
      prescricao,
      observacoes,
      exames_solicitados,
      retorno_dias
    } = req.body

    if (!diagnostico || !diagnostico.trim()) {
      return res.status(400).json({ erro: 'O diagnóstico é obrigatório para registrar o atendimento.' })
    }

    const consulta = await Consulta.findByPk(consultaId)
    if (!consulta) {
      return res.status(404).json({ erro: 'Consulta não encontrada.' })
    }

    const atendimentoExistente = await Atendimento.findOne({ where: { consultaId } })
    if (atendimentoExistente) {
      return res.status(400).json({ erro: 'Já existe um atendimento para esta consulta.' })
    }

    // RN08: apenas o médico responsável pela consulta pode registrar o atendimento
    if (consulta.medicoId !== req.user.id) {
      return res.status(403).json({ erro: 'Apenas o médico responsável por esta consulta pode registrar o atendimento.' })
    }

    // RN12: atendimento só pode ser registrado com a consulta em_atendimento ou já realizada
    if (!['em_atendimento', 'realizada'].includes(consulta.status)) {
      return res.status(400).json({ erro: 'A consulta precisa estar em atendimento (ou já realizada) para registrar o atendimento.' })
    }

    const atendimento = await Atendimento.create({
      consultaId,
      medicoId: req.user.id,
      data_atendimento: new Date(),
      anamnese,
      diagnostico,
      prescricao,
      observacoes,
      exames_solicitados,
      retorno_dias,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    })

    if (consulta.status !== 'realizada') {
      await consulta.update({ status: 'realizada', updatedBy: req.user.id })
    }

    res.status(201).json(atendimento)
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao criar atendimento.',
      detalhe: error.message
    })
  }
}

// PUT /api/atendimentos/:id
exports.atualizar = async (req, res) => {
  try {
    const atendimento = await Atendimento.findByPk(req.params.id);
    if (!atendimento) return res.status(404).json({ erro: 'Atendimento não encontrado.' });

    // RN08 (por extensão): só quem registrou o atendimento pode editá-lo
    if (atendimento.medicoId !== req.user.id) {
      return res.status(403).json({ erro: 'Você não pode editar este atendimento.' });
    }

    const { consultaId, medicoId, createdBy, ...camposEditaveis } = req.body;
    await atendimento.update({ ...camposEditaveis, updatedBy: req.user.id });
    res.json(atendimento);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar atendimento.' });
  }
};

// DELETE /api/atendimentos/:id
exports.deletar = async (req, res) => {
  try {
    const atendimento = await Atendimento.findByPk(req.params.id)
    if (!atendimento) {
      return res.status(404).json({ erro: 'Atendimento não encontrado.' })
    }

    if (atendimento.medicoId !== req.user.id) {
      return res.status(403).json({ erro: 'Você não pode excluir este atendimento.' })
    }

    const consulta = await Consulta.findByPk(atendimento.consultaId)

    await atendimento.destroy()

    // Reverte a consulta pro status anterior ao "realizada", já que o
    // atendimento que a fechou deixou de existir.
    if (consulta && consulta.status === 'realizada') {
      await consulta.update({ status: 'em_atendimento', updatedBy: req.user.id })
    }

    res.json({ mensagem: 'Atendimento excluído e consulta revertida para em_atendimento.' })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir atendimento.' })
  }
}
