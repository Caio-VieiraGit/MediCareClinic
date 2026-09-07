const { validationResult } = require('express-validator')

// Roda depois de uma lista de validation chains do express-validator.
// Uso: router.post('/', validate(validators.criarPaciente), controller.criar)
module.exports = function validate(validations) {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req)
    }
    const erros = validationResult(req)
    if (erros.isEmpty()) return next()

    return res.status(400).json({
      erro: 'Dados inválidos.',
      detalhes: erros.array().map((e) => ({ campo: e.path, mensagem: e.msg })),
    })
  }
}
