'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profissionals', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: true, unique: true },
      crm: { type: Sequelize.STRING, allowNull: true, unique: true },
      especialidade: { type: Sequelize.STRING, allowNull: true },
      perfil: { type: Sequelize.ENUM('admin', 'medico', 'recepcionista'), allowNull: false },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      dias_disponiveis: { type: Sequelize.STRING, allowNull: true },
      horario_inicio: { type: Sequelize.STRING, allowNull: true },
      horario_fim: { type: Sequelize.STRING, allowNull: true },
      createdBy: { type: Sequelize.INTEGER, allowNull: true },
      updatedBy: { type: Sequelize.INTEGER, allowNull: true },
      senha: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Profissionals')
  },
}
