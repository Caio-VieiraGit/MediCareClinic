const { Paciente, Consulta, Atendimento } = require('../models')

// GET /pacientes — por padrão só lista os ativos (soft-delete)
exports.listar = async (req, res) => {
  try {
    const apenasAtivos = req.query.incluirInativos !== 'true'
    const pacientes = await Paciente.findAll({
      where: apenasAtivos ? { ativo: true } : {},
    })
    res.json(pacientes)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar pacientes.' })
  }
}

// GET /pacientes/:id
exports.buscarPorId = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id)
    if (paciente) res.json(paciente)
    else res.status(404).json({ erro: 'Paciente não encontrado.' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar paciente.' })
  }
}

// GET /pacientes/:id/historico
// RNF06/dica do documento: recepcionista não deve ver conteúdo clínico
// (anamnese/diagnóstico/prescrição) — só admin e médico têm acesso completo.
exports.buscarHistorico = async (req, res) => {
  try {
    const podeVerClinico = ['admin', 'medico'].includes(req.user.perfil)

    const paciente = await Paciente.findByPk(req.params.id, {
      include: [{
        model: Consulta,
        include: [{
          model: Atendimento,
          attributes: podeVerClinico
            ? undefined
            : ['id', 'consultaId', 'data_atendimento'], // esconde anamnese/diagnostico/prescricao/observacoes/exames
        }],
      }],
    })

    if (!paciente) {
      return res.status(404).json({ erro: 'Paciente não encontrado.' })
    }
    return res.json(paciente)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar consultas do paciente.' })
  }
}

// POST /pacientes
exports.criar = async (req, res) => {
  try {
    const novo = await Paciente.create({
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    })
    res.status(201).json(novo)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar paciente.', detalhe: error.message })
  }
}

// PUT/PATCH /pacientes/:id
exports.atualizar = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id)
    if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado!' })
    await paciente.update({ ...req.body, updatedBy: req.user.id })
    res.json(paciente)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar paciente.', detalhe: error.message })
  }
}

// DELETE /pacientes/:id — desativa (soft delete), preservando o histórico
// clínico (consultas/atendimentos) já vinculado a este paciente.
exports.deletar = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id)
    if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado!' })
    await paciente.update({ ativo: false, updatedBy: req.user.id })
    res.json({ mensagem: 'Paciente desativado com sucesso.' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao desativar paciente.' })
  }
}
