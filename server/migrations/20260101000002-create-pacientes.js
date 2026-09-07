'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pacientes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING, allowNull: false },
      cpf: { type: Sequelize.STRING, allowNull: false, unique: true },
      data_nascimento: { type: Sequelize.STRING, allowNull: false },
      telefone: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: true },
      endereco: { type: Sequelize.STRING, allowNull: true },
      cidade: { type: Sequelize.STRING, allowNull: true },
      estado: { type: Sequelize.STRING, allowNull: true },
      cep: { type: Sequelize.STRING, allowNull: true },
      convenio: { type: Sequelize.STRING, allowNull: true },
      numero_convenio: { type: Sequelize.STRING, allowNull: true },
      ativo: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Profissionals', key: 'id' },
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Profissionals', key: 'id' },
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Pacientes')
  },
}
