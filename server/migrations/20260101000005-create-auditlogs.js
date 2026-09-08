'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AuditLogs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Profissionals', key: 'id' },
      },
      acao: {
        type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN', 'CANCEL', 'CONFIRM'),
        allowNull: false,
      },
      entidade: { type: Sequelize.STRING, allowNull: false },
      entidadeId: { type: Sequelize.INTEGER, allowNull: true },
      dataHora: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      detalhes: { type: Sequelize.TEXT, allowNull: true },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('AuditLogs')
  },
}
