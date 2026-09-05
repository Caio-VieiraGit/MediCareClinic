const { Paciente, Consulta, Atendimento } = require('../models')

// GET /pacientes
exports.listar = async (req, res) => {
  const pacientes = await Paciente.findAll()
  res.json(pacientes)
}
// GET /pacientes/:id
exports.buscarPorId = async (req, res) => {
  const paciente = await Paciente.findByPk(req.params.id)
  if (paciente) res.json(paciente)
  else res.status(404).json({ erro: 'Paciente não encontrado.' })
}
// GET /pacientes/:id/historico
exports.buscarHistorico = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id, {
      include: [{ model: Consulta, include: [Atendimento] }],
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
    console.log('Payload recebido:', req.body)
    const novo = await Paciente.create({
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    })
    res.status(201).json(novo)
  } catch (error) {
    console.error('Erro ao criar paciente:', error)
    res.status(500).json({ erro: 'Erro ao criar paciente.' })
  }
}

// PUT /pacientes/:id
exports.atualizar = async (req, res) => {
  const paciente = await Paciente.findByPk(req.params.id)
  if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado!' })
  await paciente.update({ ...req.body, updatedBy: req.user.id })
  res.json(paciente)
}

//DELETE /pacientes/:id
exports.deletar = async (req, res) => {
  const paciente = await Paciente.findByPk(req.params.id)
  if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado!' })
  await paciente.destroy()
  res.sendStatus(200)
}
