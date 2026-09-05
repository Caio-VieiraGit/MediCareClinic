const express = require('express')
const router = express.Router()
const relatorioController = require('../controllers/relatorioController')
const authMiddleware = require('../middlewares/authMiddleware')
const checkPerfil = require('../middlewares/checkPerfil')

router.use(authMiddleware)
router.use(checkPerfil('admin', 'medico'))

router.get('/estatisticas', relatorioController.estatisticas)
router.get('/pacientes-frequentes', relatorioController.pacientesFrequentes)
router.get('/atendimentos', relatorioController.atendimentosPorPeriodo)

module.exports = router
