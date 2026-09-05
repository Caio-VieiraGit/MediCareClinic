const express = require('express')
const router = express.Router()
const profissionalController = require('../controllers/profissionalController')
const authMiddleware = require('../middlewares/authMiddleware')
const checkPerfil = require('../middlewares/checkPerfil')

router.use(authMiddleware)

// Aberta a qualquer perfil autenticado — usada pra selecionar médico ao agendar consulta
router.get('/medicos', profissionalController.listarMedicos)

// Gestão de profissionais (RN04): apenas admin
router.get('/', checkPerfil('admin'), profissionalController.listar)
router.get('/:id', checkPerfil('admin'), profissionalController.buscarPorId)
router.post('/', checkPerfil('admin'), profissionalController.criar)
router.put('/:id', checkPerfil('admin'), profissionalController.atualizar)
router.patch('/:id', checkPerfil('admin'), profissionalController.atualizar)
router.delete('/:id', checkPerfil('admin'), profissionalController.deletar)

module.exports = router
