const { body } = require('express-validator')

exports.criar = [
  body('consultaId').isInt().withMessage('Consulta é obrigatória.'),
  body('diagnostico').trim().notEmpty().withMessage('O diagnóstico é obrigatório para registrar o atendimento.'),
  body('retorno_dias').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Dias de retorno inválido.'),
]

// Update parcial (PUT /:id): os campos não são obrigatórios, mas se vierem
// precisam ser válidos. consultaId/medicoId/createdBy não são validados aqui
// de propósito — o controller já os ignora (nunca são atualizáveis).
exports.atualizar = [
  body('diagnostico').optional().trim().notEmpty().withMessage('O diagnóstico não pode ficar vazio.'),
  body('retorno_dias').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Dias de retorno inválido.'),
]
