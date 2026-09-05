const { Consulta, Paciente, Profissional, Atendimento, sequelize } = require('../models')
const { Op, fn, col } = require('sequelize')

// GET /api/relatorios/estatisticas (admin/médico)
exports.estatisticas = async (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0]

    const [porStatus, totalPacientesAtivos, totalProfissionaisAtivos, atendimentosNoMes, consultasHoje] =
      await Promise.all([
        Consulta.findAll({
          attributes: ['status', [fn('COUNT', col('id')), 'total']],
          group: ['status'],
        }),
        Paciente.count({ where: { ativo: true } }),
        Profissional.count({ where: { status: true } }),
        Atendimento.count({
          where: {
            data_atendimento: {
              [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        Consulta.count({ where: { data_consulta: hoje } }),
      ])

    const consultasPorStatus = {}
    porStatus.forEach((linha) => {
      consultasPorStatus[linha.status] = Number(linha.get('total'))
    })

    res.json({
      consultasPorStatus,
      totalPacientesAtivos,
      totalProfissionaisAtivos,
      atendimentosNoMes,
      consultasHoje,
    })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar estatísticas.', detalhe: error.message })
  }
}

// GET /api/relatorios/pacientes-frequentes (admin/médico)
exports.pacientesFrequentes = async (req, res) => {
  try {
    const limite = Number(req.query.limite) || 10

    const resultado = await Consulta.findAll({
      attributes: ['pacienteId', [fn('COUNT', col('Consulta.id')), 'totalConsultas']],
      include: [{ model: Paciente, as: 'paciente', attributes: ['id', 'nome', 'cpf'] }],
      group: ['pacienteId'],
      order: [[fn('COUNT', col('Consulta.id')), 'DESC']],
      limit: limite,
    })

    const pacientes = resultado.map((linha) => ({
      paciente: linha.paciente,
      totalConsultas: Number(linha.get('totalConsultas')),
    }))

    res.json(pacientes)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar pacientes frequentes.', detalhe: error.message })
  }
}

// GET /api/relatorios/atendimentos (admin vê todos, médico vê só os próprios)
exports.atendimentosPorPeriodo = async (req, res) => {
  try {
    const { inicio, fim } = req.query
    const where = {}

    if (req.user.perfil === 'medico') {
      where.medicoId = req.user.id
    }
    if (inicio || fim) {
      where.data_atendimento = {}
      if (inicio) where.data_atendimento[Op.gte] = new Date(inicio)
      if (fim) where.data_atendimento[Op.lte] = new Date(fim)
    }

    const atendimentos = await Atendimento.findAll({
      where,
      include: [
        {
          model: Consulta,
          include: [
            { model: Paciente, as: 'paciente', attributes: ['id', 'nome'] },
          ],
        },
        { model: Profissional, as: 'medico', attributes: ['id', 'nome', 'especialidade'] },
      ],
      order: [['data_atendimento', 'DESC']],
    })

    res.json(atendimentos)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar atendimentos.', detalhe: error.message })
  }
}
