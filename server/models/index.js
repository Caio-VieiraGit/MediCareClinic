const { Sequelize } = require('sequelize')
const sequelize = require('../config/database')
const Paciente = require('./pacienteModel')
const Profissional = require('./profissionalModel')
const Consulta = require('./consultaModel')
const Atendimento = require('./atendimentoModel')
const AuditLog = require('./auditLogModel')

Paciente.hasMany(Consulta, { foreignKey: 'pacienteId' })
Consulta.belongsTo(Paciente, { as: 'paciente', foreignKey: 'pacienteId' })

Profissional.hasMany(Consulta, { foreignKey: 'medicoId' })
Consulta.belongsTo(Profissional, { as: 'medico', foreignKey: 'medicoId' })

Consulta.hasOne(Atendimento, { foreignKey: 'consultaId' })
Atendimento.belongsTo(Consulta, { as: 'consulta', foreignKey: 'consultaId' })

Profissional.hasMany(Atendimento, { foreignKey: 'medicoId' })
Atendimento.belongsTo(Profissional, { as: 'medico', foreignKey: 'medicoId' })

Profissional.hasMany(Consulta, { foreignKey: 'agendadoPor' })
Consulta.belongsTo(Profissional, { as: 'recepcionista', foreignKey: 'agendadoPor' })

Profissional.hasMany(AuditLog, { foreignKey: 'usuarioId' })
AuditLog.belongsTo(Profissional, { as: 'usuario', foreignKey: 'usuarioId' })


module.exports = {
  sequelize,
  Paciente,
  Profissional,
  Consulta,
  Atendimento,
  AuditLog,
}
