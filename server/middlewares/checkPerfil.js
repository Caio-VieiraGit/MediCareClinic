// Middleware de autorização por perfil.
// Uso: router.post('/', checkPerfil('admin'), controller.criar)
// Precisa rodar depois do authMiddleware (que preenche req.user).
module.exports = (...perfisPermitidos) => (req, res, next) => {
  if (!req.user || !perfisPermitidos.includes(req.user.perfil)) {
    return res.status(403).json({ erro: 'Você não tem permissão para acessar este recurso.' })
  }
  next()
}
