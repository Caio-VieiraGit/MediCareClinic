// server/seed.js
// Recria o banco do zero e popula com os dados de exemplo da seção 16 do
// documento da situação de aprendizagem, mais algumas consultas futuras
// (relativas à data de hoje) só pra a agenda/dashboard não ficarem vazias
// numa demonstração.
//
// Uso: node server/seed.js
// ATENÇÃO: isso apaga todos os dados existentes no banco configurado em DB_PATH.

require('dotenv').config()
const bcrypt = require('bcrypt')
const { sequelize, Profissional, Paciente, Consulta, Atendimento } = require('./models')

const SALT_ROUNDS = 10

function dataFutura(diasAPartirDeHoje, hora) {
  const d = new Date()
  d.setDate(d.getDate() + diasAPartirDeHoje)
  return { data: d.toISOString().split('T')[0], hora }
}

async function seed() {
  console.log('Recriando o banco em', process.env.DB_PATH)
  await sequelize.sync({ force: true })

  const [admin, carlos, ana, recepcionista] = await Promise.all([
    Profissional.create({
      nome: 'Admin',
      email: 'admin@medicare.com',
      senha: await bcrypt.hash('Admin@123', SALT_ROUNDS),
      crm: null,
      especialidade: null,
      perfil: 'admin',
      status: true,
    }),
    Profissional.create({
      nome: 'Dr. Carlos Silva',
      email: 'carlos@medicare.com',
      senha: await bcrypt.hash('Med@123', SALT_ROUNDS),
      crm: '12345-SP',
      especialidade: 'Cardiologia',
      perfil: 'medico',
      status: true,
    }),
    Profissional.create({
      nome: 'Dra. Ana Santos',
      email: 'ana@medicare.com',
      senha: await bcrypt.hash('Med@123', SALT_ROUNDS),
      crm: '67890-SP',
      especialidade: 'Pediatria',
      perfil: 'medico',
      status: true,
    }),
    Profissional.create({
      nome: 'Recepcionista',
      email: 'recepcao@medicare.com',
      senha: await bcrypt.hash('Recep@123', SALT_ROUNDS),
      crm: null,
      especialidade: null,
      perfil: 'recepcionista',
      status: true,
    }),
  ])

  const [maria, joao, paula, roberto] = await Promise.all([
    Paciente.create({
      nome: 'Maria Oliveira', cpf: '111.222.333-44', data_nascimento: '1985-03-15',
      convenio: 'Unimed', ativo: true, createdBy: recepcionista.id, updatedBy: recepcionista.id,
    }),
    Paciente.create({
      nome: 'João Santos', cpf: '222.333.444-55', data_nascimento: '1990-07-22',
      convenio: 'Bradesco Saúde', ativo: true, createdBy: recepcionista.id, updatedBy: recepcionista.id,
    }),
    Paciente.create({
      nome: 'Paula Costa', cpf: '333.444.555-66', data_nascimento: '1978-11-10',
      convenio: 'Particular', ativo: true, createdBy: recepcionista.id, updatedBy: recepcionista.id,
    }),
    Paciente.create({
      nome: 'Roberto Lima', cpf: '444.555.666-77', data_nascimento: '1995-01-05',
      convenio: 'SulAmérica', ativo: true, createdBy: recepcionista.id, updatedBy: recepcionista.id,
    }),
  ])

  // Consultas de exemplo do documento (datas originais, histórico) ------------
  const c1 = await Consulta.create({
    protocolo: '0001', pacienteId: maria.id, medicoId: carlos.id,
    data_consulta: '2025-10-25', hora_consulta: '14:00',
    tipo: 'primeira_consulta', status: 'confirmada',
    data_confirmacao: new Date('2025-10-24'), agendadoPor: recepcionista.id,
  })
  const c2 = await Consulta.create({
    protocolo: '0002', pacienteId: joao.id, medicoId: ana.id,
    data_consulta: '2025-10-25', hora_consulta: '10:00',
    tipo: 'retorno', status: 'realizada', agendadoPor: recepcionista.id,
  })
  await Consulta.create({
    protocolo: '0003', pacienteId: paula.id, medicoId: carlos.id,
    data_consulta: '2025-10-26', hora_consulta: '15:30',
    tipo: 'emergencia', status: 'agendada', agendadoPor: recepcionista.id,
  })
  await Consulta.create({
    protocolo: '0004', pacienteId: roberto.id, medicoId: ana.id,
    data_consulta: '2025-10-23', hora_consulta: '09:00',
    tipo: 'primeira_consulta', status: 'faltou', agendadoPor: recepcionista.id,
  })

  await Atendimento.create({
    consultaId: c2.id,
    medicoId: ana.id,
    data_atendimento: new Date('2025-10-25T10:30:00'),
    anamnese: 'Paciente retorna com melhora dos sintomas relatados na consulta anterior.',
    diagnostico: 'Gripe viral',
    prescricao: 'Paracetamol 500mg 8/8h',
    retorno_dias: 7,
  })

  // Consultas extras com data relativa a hoje, só pra Agenda/Dashboard/Relatórios
  // não ficarem vazios numa demonstração ao vivo -----------------------------
  const proxima1 = dataFutura(1, '09:00')
  const proxima2 = dataFutura(1, '11:00')
  const proxima3 = dataFutura(3, '16:00')
  await Consulta.bulkCreate([
    {
      protocolo: '0005', pacienteId: maria.id, medicoId: ana.id,
      data_consulta: proxima1.data, hora_consulta: proxima1.hora,
      tipo: 'retorno', status: 'agendada', agendadoPor: recepcionista.id,
    },
    {
      protocolo: '0006', pacienteId: roberto.id, medicoId: carlos.id,
      data_consulta: proxima2.data, hora_consulta: proxima2.hora,
      tipo: 'primeira_consulta', status: 'confirmada', agendadoPor: recepcionista.id,
    },
    {
      protocolo: '0007', pacienteId: paula.id, medicoId: ana.id,
      data_consulta: proxima3.data, hora_consulta: proxima3.hora,
      tipo: 'retorno', status: 'agendada', agendadoPor: recepcionista.id,
    },
  ])

  console.log('Seed concluído: 4 profissionais, 4 pacientes, 7 consultas, 1 atendimento.')
  await sequelize.close()
}

seed().catch((err) => {
  console.error('Erro ao rodar o seed:', err)
  process.exit(1)
})
