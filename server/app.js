require('dotenv').config();
const cors = require('cors')
const express = require('express')
const rotasPaciente = require('./routes/pacienteRoutes')
const rotasAuth = require('./routes/authRoutes')
const rotasConsultas = require('./routes/consultaRoutes')
const rotasProfissionais = require('./routes/profissionalRoutes')
const rotasAtendimentos = require('./routes/atendimentoRoutes')
const rotasRelatorios = require('./routes/relatorioRoutes')
const authMiddleware = require('./middlewares/authMiddleware')
const profissionalController = require('./controllers/profissionalController')

const app = express()
const sequelize = require('./config/database')
const PORT = process.env.PORT || 3000

console.log('Caminho do DB sendo usado:', process.env.DB_PATH); 

app.use(express.json())
app.use(cors({
  origin:  'http://localhost:5173'
}))


app.use((req, res, next) => {
  console.log(`Recebendo requisição: ${req.method} para URL: ${req.url}`);
  next();
});

app.use('/api/pacientes', rotasPaciente)
app.use('/api/auth', rotasAuth)
app.use('/api/profissionais', rotasProfissionais)
app.use('/api/atendimentos', rotasAtendimentos)
app.use('/api/consultas', rotasConsultas)
app.use('/api/relatorios', rotasRelatorios)

// Alias no nível raiz — o documento da situação de aprendizagem pede GET /api/medicos
// além de GET /api/profissionais/medicos (mantido por compatibilidade com o front atual)
app.get('/api/medicos', authMiddleware, profissionalController.listarMedicos)



sequelize.sync({}).then(() => {
  console.log('Banco de dados sincronizado.')
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://127.0.0.1:${PORT}`)
  })
})
