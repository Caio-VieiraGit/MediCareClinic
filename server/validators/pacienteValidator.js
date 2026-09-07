const { body, param } = require('express-validator')

const CPF_REGEX = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/

const camposComuns = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório.').isLength({ min: 2 }).withMessage('Nome muito curto.'),
  body('cpf').trim().notEmpty().withMessage('CPF é obrigatório.').matches(CPF_REGEX).withMessage('CPF inválido (use XXX.XXX.XXX-XX ou só números).'),
  body('data_nascimento').trim().notEmpty().withMessage('Data de nascimento é obrigatória.'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('E-mail inválido.'),
  body('telefone').optional({ values: 'falsy' }).isLength({ min: 8 }).withMessage('Telefone inválido.'),
]

exports.criar = camposComuns

// Na edição os campos são opcionais individualmente (PATCH parcial), mas se
// vierem, têm que ser válidos.
exports.atualizar = [
  body('nome').optional().trim().isLength({ min: 2 }).withMessage('Nome muito curto.'),
  body('cpf').optional().trim().matches(CPF_REGEX).withMessage('CPF inválido (use XXX.XXX.XXX-XX ou só números).'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('E-mail inválido.'),
  body('telefone').optional({ values: 'falsy' }).isLength({ min: 8 }).withMessage('Telefone inválido.'),
]

exports.idParam = [param('id').isInt().withMessage('Id inválido.')]
