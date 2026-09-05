const express = require('express')
const router = express.Router()
const atendimentoController = require('../controllers/atendimentoController')
const authMiddleware = require('../middlewares/authMiddleware')
const checkPerfil = require('../middlewares/checkPerfil')

router.use(authMiddleware)

router.get('/', atendimentoController.listar)
router.get('/consultas/:id/atendimento', atendimentoController.buscarPorConsulta)
router.get('/:id', atendimentoController.buscarPorId)
router.post('/', checkPerfil('medico'), atendimentoController.criar)
router.put('/:id', checkPerfil('medico'), atendimentoController.atualizar)
router.delete('/:id', checkPerfil('medico'), atendimentoController.deletar)

module.exports = router