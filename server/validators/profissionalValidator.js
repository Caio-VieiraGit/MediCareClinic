const { body } = require('express-validator')

const PERFIS_VALIDOS = ['admin', 'medico', 'recepcionista']

exports.criar = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório.'),
  body('email').trim().isEmail().withMessage('E-mail inválido.'),
  body('senha').isLength({ min: 6 }).withMessage('Senha precisa ter ao menos 6 caracteres.'),
  body('perfil').isIn(PERFIS_VALIDOS).withMessage(`Perfil precisa ser um de: ${PERFIS_VALIDOS.join(', ')}.`),
  // RF01/modelo: crm e especialidade só fazem sentido (e são exigidos) pra médico
  body('crm').if(body('perfil').equals('medico')).trim().notEmpty().withMessage('CRM é obrigatório para médicos.'),
  body('especialidade').if(body('perfil').equals('medico')).trim().notEmpty().withMessage('Especialidade é obrigatória para médicos.'),
  body('horario_inicio').optional({ values: 'falsy' }).matches(/^\d{2}:\d{2}$/).withMessage('Horário inicial inválido (use HH:mm).'),
  body('horario_fim').optional({ values: 'falsy' }).matches(/^\d{2}:\d{2}$/).withMessage('Horário final inválido (use HH:mm).'),
]

exports.atualizar = [
  body('email').optional().trim().isEmail().withMessage('E-mail inválido.'),
  body('senha').optional().isLength({ min: 6 }).withMessage('Senha precisa ter ao menos 6 caracteres.'),
  body('perfil').optional().isIn(PERFIS_VALIDOS).withMessage(`Perfil precisa ser um de: ${PERFIS_VALIDOS.join(', ')}.`),
  body('horario_inicio').optional({ values: 'falsy' }).matches(/^\d{2}:\d{2}$/).withMessage('Horário inicial inválido (use HH:mm).'),
  body('horario_fim').optional({ values: 'falsy' }).matches(/^\d{2}:\d{2}$/).withMessage('Horário final inválido (use HH:mm).'),
]
