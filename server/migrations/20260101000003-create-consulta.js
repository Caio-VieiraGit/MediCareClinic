'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Consulta', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      protocolo: { type: Sequelize.STRING, allowNull: false, unique: true },
      pacienteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Pacientes', key: 'id' },
      },
      medicoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Profissionals', key: 'id' },
      },
      data_consulta: { type: Sequelize.DATEONLY, allowNull: false },
      hora_consulta: { type: Sequelize.TIME, allowNull: false },
      tipo: {
        type: Sequelize.ENUM('primeira_consulta', 'retorno', 'emergencia'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('agendada', 'confirmada', 'em_atendimento', 'realizada', 'cancelada', 'faltou'),
        defaultValue: 'agendada',
      },
      motivo: { type: Sequelize.STRING, allowNull: true },
      observacoes: { type: Sequelize.TEXT, allowNull: true },
      data_confirmacao: { type: Sequelize.DATE, allowNull: true },
      data_cancelamento: { type: Sequelize.DATE, allowNull: true },
      motivo_cancelamento: { type: Sequelize.STRING, allowNull: true },
      agendadoPor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Profissionals', key: 'id' },
      },
      updatedBy: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Consulta')
  },
}
