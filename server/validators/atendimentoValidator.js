const { body } = require('express-validator')

exports.criar = [
  body('consultaId').isInt().withMessage('Consulta é obrigatória.'),
  body('diagnostico').trim().notEmpty().withMessage('O diagnóstico é obrigatório para registrar o atendimento.'),
  body('retorno_dias').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Dias de retorno inválido.'),
]
