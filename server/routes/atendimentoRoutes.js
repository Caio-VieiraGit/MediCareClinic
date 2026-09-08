const express = require('express')
const router = express.Router()
const atendimentoController = require('../controllers/atendimentoController')
const authMiddleware = require('../middlewares/authMiddleware')
const checkPerfil = require('../middlewares/checkPerfil')
const validate = require('../middlewares/validate')
const atendimentoValidator = require('../validators/atendimentoValidator')

router.use(authMiddleware)

router.get('/', checkPerfil('admin', 'medico'), atendimentoController.listar)
router.get('/consultas/:id/atendimento', checkPerfil('admin', 'medico'), atendimentoController.buscarPorConsulta)
router.get('/:id', checkPerfil('admin', 'medico'), atendimentoController.buscarPorId)
router.post('/', checkPerfil('medico'), validate(atendimentoValidator.criar), atendimentoController.criar)
router.put('/:id', checkPerfil('medico'), validate(atendimentoValidator.atualizar), atendimentoController.atualizar)
router.delete('/:id', checkPerfil('medico'), atendimentoController.deletar)

module.exports = router