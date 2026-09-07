require('dotenv').config()

// Config no formato exigido pelo Sequelize CLI (usado só pelos comandos
// `sequelize-cli db:migrate` / `db:migrate:undo`). A aplicação em si continua
// usando server/config/database.js — os dois apontam pro mesmo arquivo SQLite.
module.exports = {
  development: {
    dialect: 'sqlite',
    storage: process.env.DB_PATH || './server/medicare.db',
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
  },
  production: {
    dialect: 'sqlite',
    storage: process.env.DB_PATH || './server/medicare.db',
  },
}
