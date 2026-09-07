const express = require('express')
const router = express.Router()
const pacienteController = require('../controllers/pacienteController')
const authMiddleware = require('../middlewares/authMiddleware')
const validate = require('../middlewares/validate')
const pacienteValidator = require('../validators/pacienteValidator')

router.use(authMiddleware)

router.get('/', pacienteController.listar)
router.get('/:id', pacienteController.buscarPorId)
router.get('/:id/historico', pacienteController.buscarHistorico)
router.post('/', validate(pacienteValidator.criar), pacienteController.criar)
router.put('/:id', validate(pacienteValidator.atualizar), pacienteController.atualizar)
router.patch('/:id', validate(pacienteValidator.atualizar), pacienteController.atualizar)
router.delete('/:id', pacienteController.deletar)

module.exports = router
