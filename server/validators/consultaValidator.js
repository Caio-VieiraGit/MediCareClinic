const { body } = require('express-validator')

const TIPOS_VALIDOS = ['primeira_consulta', 'retorno', 'emergencia']

exports.criar = [
  body('pacienteId').isInt().withMessage('Paciente é obrigatório.'),
  body('medicoId').isInt().withMessage('Médico é obrigatório.'),
  body('data_consulta').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data inválida (use AAAA-MM-DD).'),
  body('hora_consulta').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Hora inválida (use HH:mm).'),
  body('tipo').isIn(TIPOS_VALIDOS).withMessage(`Tipo precisa ser um de: ${TIPOS_VALIDOS.join(', ')}.`),
]

exports.atualizar = [
  body('pacienteId').optional().isInt().withMessage('Paciente inválido.'),
  body('medicoId').optional().isInt().withMessage('Médico inválido.'),
  body('data_consulta').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data inválida (use AAAA-MM-DD).'),
  body('hora_consulta').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Hora inválida (use HH:mm).'),
  body('tipo').optional().isIn(TIPOS_VALIDOS).withMessage(`Tipo precisa ser um de: ${TIPOS_VALIDOS.join(', ')}.`),
]
