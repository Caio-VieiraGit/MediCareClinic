const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Profissional = sequelize.define('Profissional', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    },
  },
  crm: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  especialidade: {
    type: DataTypes.STRING,
    allowNull: true
  },
  perfil: {
    type: DataTypes.ENUM('admin', 'medico', 'recepcionista'),
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // RF05/RF08: disponibilidade do médico (nullable — recepcionista/admin não usam)
  dias_disponiveis: {
    type: DataTypes.STRING, // ex.: "seg,ter,qua,qui,sex"
    allowNull: true
  },
  horario_inicio: {
    type: DataTypes.STRING, // "08:00"
    allowNull: true
  },
  horario_fim: {
    type: DataTypes.STRING, // "18:00"
    allowNull: true
  },
  // RF13: auditoria — quem criou/alterou este registro
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true, // o 1º admin do sistema não tem quem o crie
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
{
  tableName: 'Profissionals', // <-- força o nome certo
  timestamps: true
});

module.exports = Profissional
