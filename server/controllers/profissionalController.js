const Profissional = require('../models/profissionalModel')
const { Consulta } = require('../models')
const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const { registrarAuditoria } = require('../helpers/auditoria')

const SALT_ROUNDS = 10

// GET /profissionais
exports.listar = async (req, res) => {
  try {
    const profissionais = await Profissional.findAll({
      attributes: { exclude: ['senha'] } // não expõe senha
    })
    res.json(profissionais)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar profissionais.' })
  }
}

// GET /profissionais/:id
exports.buscarPorId = async (req, res) => {
  try {
    const profissional = await Profissional.findByPk(req.params.id, {
      attributes: { exclude: ['senha'] }
    })
    if (!profissional) return res.status(404).json({ erro: 'Profissional não encontrado.' })
    res.json(profissional)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar profissional.' })
  }
}

// GET /profissionais/medicos e GET /api/medicos
exports.listarMedicos = async (req, res) => {
  try {
    const medicos = await Profissional.findAll({
      where: { perfil: 'medico', status: true },
      attributes: ['id', 'nome', 'especialidade', 'crm', 'email', 'horario_inicio', 'horario_fim', 'dias_disponiveis']
    })
    res.json(medicos)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar médicos.' })
  }
}

// GET /api/medicos/:id/agenda?data=YYYY-MM-DD — RF08: horários livres/ocupados
exports.disponibilidade = async (req, res) => {
  try {
    const medico = await Profissional.findByPk(req.params.id)
    if (!medico || medico.perfil !== 'medico') {
      return res.status(404).json({ erro: 'Médico não encontrado.' })
    }

    const data = req.query.data || new Date().toISOString().split('T')[0]

    if (!medico.horario_inicio || !medico.horario_fim) {
      return res.json({
        data,
        atende: null,
        aviso: 'Este médico ainda não tem horário de atendimento configurado.',
        horarios: [],
      })
    }

    const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
    const diaSemana = DIAS_SEMANA[new Date(`${data}T00:00:00`).getDay()]
    const dias = (medico.dias_disponiveis || '').split(',').map((d) => d.trim()).filter(Boolean)
    const atende = dias.length === 0 || dias.includes(diaSemana)

    if (!atende) {
      return res.json({ data, diaSemana, atende: false, horarios: [] })
    }

    // Gera os horários em intervalos de 30min (RN06) entre início e fim
    const [hi, mi] = medico.horario_inicio.split(':').map(Number)
    const [hf, mf] = medico.horario_fim.split(':').map(Number)
    const slots = []
    for (let min = hi * 60 + mi; min < hf * 60 + mf; min += 30) {
      const h = String(Math.floor(min / 60)).padStart(2, '0')
      const m = String(min % 60).padStart(2, '0')
      slots.push(`${h}:${m}`)
    }

    const consultasDoDia = await Consulta.findAll({
      where: {
        medicoId: medico.id,
        data_consulta: data,
        status: { [Op.notIn]: ['cancelada', 'faltou'] },
      },
    })

    const horarios = slots.map((hora) => {
      const [h, m] = hora.split(':').map(Number)
      const minutos = h * 60 + m
      const ocupado = consultasDoDia.some((c) => {
        const [ch, cm] = c.hora_consulta.split(':').map(Number)
        return Math.abs((ch * 60 + cm) - minutos) < 30
      })
      return { hora, disponivel: !ocupado }
    })

    res.json({ data, diaSemana, atende: true, horarios })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar disponibilidade do médico.', detalhe: error.message })
  }
}

// POST /profissionais
exports.criar = async (req, res) => {
  try {
    const { senha, ...dados } = req.body
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS)

    const novo = await Profissional.create({
      ...dados,
      senha: senhaHash,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    })
    const { senha: _, ...semSenha } = novo.toJSON()
    res.status(201).json(semSenha)

    registrarAuditoria({
      usuarioId: req.user.id,
      acao: 'CREATE',
      entidade: 'Profissional',
      entidadeId: novo.id,
      detalhes: { perfil: novo.perfil },
    })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar profissional.', detalhe: error.message })
  }
}

// PUT/PATCH /profissionais/:id
exports.atualizar = async (req, res) => {
  try {
    const profissional = await Profissional.findByPk(req.params.id)
    if (!profissional) return res.status(404).json({ erro: 'Profissional não encontrado!' })

    const dados = { ...req.body, updatedBy: req.user.id }

    // Se veio senha nova, hashear antes de salvar — nunca gravar em texto plano.
    if (dados.senha) {
      dados.senha = await bcrypt.hash(dados.senha, SALT_ROUNDS)
    } else {
      delete dados.senha
    }

    await profissional.update(dados)
    const { senha, ...semSenha } = profissional.toJSON()
    res.json(semSenha)

    registrarAuditoria({
      usuarioId: req.user.id,
      acao: 'UPDATE',
      entidade: 'Profissional',
      entidadeId: profissional.id,
      detalhes: { camposAlterados: Object.keys(req.body).filter((c) => c !== 'senha') },
    })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar profissional.', detalhe: error.message })
  }
}

// DELETE /profissionais/:id — desativa (soft delete), não apaga o registro.
// Preserva a integridade referencial com consultas/atendimentos já existentes
// e mantém o histórico de auditoria (RF13).
exports.deletar = async (req, res) => {
  try {
    const profissional = await Profissional.findByPk(req.params.id)
    if (!profissional) return res.status(404).json({ erro: 'Profissional não encontrado!' })

    // RN10: não permite desativar se houver consultas futuras ativas vinculadas
    const hoje = new Date().toISOString().split('T')[0]
    const consultaFutura = await Consulta.findOne({
      where: {
        medicoId: profissional.id,
        data_consulta: { [Op.gte]: hoje },
        status: { [Op.notIn]: ['cancelada', 'faltou', 'realizada'] }
      }
    })
    if (consultaFutura) {
      return res.status(400).json({ erro: 'Não é possível desativar: existem consultas futuras vinculadas a este profissional.' })
    }

    await profissional.update({ status: false, updatedBy: req.user.id })
    res.json({ mensagem: 'Profissional desativado com sucesso.' })

    registrarAuditoria({
      usuarioId: req.user.id,
      acao: 'DELETE',
      entidade: 'Profissional',
      entidadeId: profissional.id,
      detalhes: { tipo: 'desativação (soft delete)' },
    })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao desativar profissional.' })
  }
}
