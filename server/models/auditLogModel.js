const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const AuditLog = sequelize.define('AuditLog', {
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null em ações do sistema sem usuário autenticado (ex.: falha de login)
  },
  acao: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN', 'CANCEL', 'CONFIRM'),
    allowNull: false,
  },
  entidade: {
    type: DataTypes.STRING, // ex.: 'Paciente', 'Consulta', 'Profissional', 'Atendimento'
    allowNull: false,
  },
  entidadeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  dataHora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  // Resumo não sensível da operação (nunca senha, nunca conteúdo clínico completo)
  detalhes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'AuditLogs',
  timestamps: false, // já tem dataHora — não precisa de createdAt/updatedAt duplicados
})

module.exports = AuditLog
