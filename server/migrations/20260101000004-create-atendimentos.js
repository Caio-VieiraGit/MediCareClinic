'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Atendimentos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      consultaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'Consulta', key: 'id' },
      },
      anamnese: { type: Sequelize.TEXT, allowNull: true },
      diagnostico: { type: Sequelize.TEXT, allowNull: true },
      prescricao: { type: Sequelize.TEXT, allowNull: true },
      observacoes: { type: Sequelize.TEXT, allowNull: true },
      exames_solicitados: { type: Sequelize.TEXT, allowNull: true },
      retorno_dias: { type: Sequelize.INTEGER, allowNull: true },
      medicoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Profissionals', key: 'id' },
      },
      data_atendimento: { type: Sequelize.DATE, allowNull: false },
      createdBy: { type: Sequelize.INTEGER, allowNull: true },
      updatedBy: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Atendimentos')
  },
}
