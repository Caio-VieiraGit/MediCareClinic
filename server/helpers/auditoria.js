const { AuditLog } = require('../models')

/**
 * Registra uma operação de auditoria (RF13).
 * Uso: registrarAuditoria({ usuarioId: req.user.id, acao: 'UPDATE', entidade: 'Paciente', entidadeId: paciente.id, detalhes: {...} })
 *
 * - `detalhes` deve conter só um resumo não sensível (ex.: quais campos mudaram),
 *   NUNCA senha, hash de senha, ou conteúdo clínico completo (anamnese/diagnóstico/prescrição).
 * - Nunca lança erro: uma falha ao gravar o log de auditoria não pode derrubar a
 *   operação principal que está sendo auditada.
 */
async function registrarAuditoria({ usuarioId, acao, entidade, entidadeId, detalhes }) {
  try {
    await AuditLog.create({
      usuarioId: usuarioId ?? null,
      acao,
      entidade,
      entidadeId: entidadeId ?? null,
      detalhes: detalhes ? JSON.stringify(detalhes) : null,
    })
  } catch (error) {
    console.error('Falha ao registrar auditoria (operação principal não foi afetada):', error.message)
  }
}

module.exports = { registrarAuditoria }
