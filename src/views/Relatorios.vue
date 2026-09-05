<template>
  <div class="container">
    <BarraLateral
      :username="store.state.auth.user?.nome"
      :userRole="store.state.auth.user?.perfil"
      @navigate="handleNavigate"
      @logout="handleLogout"
    />

    <main>
      <h2 class="title">Relatórios</h2>
      <p class="subtitle">Estatísticas gerais da clínica</p>

      <div v-if="carregando" class="estado">Carregando...</div>
      <div v-else-if="erro" class="estado erro">{{ erro }}</div>

      <template v-else>
        <section class="stat-grid">
          <div class="stat-card">
            <span class="stat-label">Pacientes ativos</span>
            <span class="stat-value">{{ estatisticas.totalPacientesAtivos }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Profissionais ativos</span>
            <span class="stat-value">{{ estatisticas.totalProfissionaisAtivos }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Consultas hoje</span>
            <span class="stat-value">{{ estatisticas.consultasHoje }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Atendimentos no mês</span>
            <span class="stat-value">{{ estatisticas.atendimentosNoMes }}</span>
          </div>
        </section>

        <section class="painel">
          <h3>Consultas por status</h3>
          <div class="status-bars">
            <div v-for="(total, status) in estatisticas.consultasPorStatus" :key="status" class="status-linha">
              <span class="status-nome" :class="`status-${status}`">{{ formatarStatus(status) }}</span>
              <div class="status-barra-fundo">
                <div class="status-barra" :class="`status-${status}`" :style="{ width: barraLargura(total) }"></div>
              </div>
              <span class="status-total">{{ total }}</span>
            </div>
            <p v-if="!Object.keys(estatisticas.consultasPorStatus || {}).length" class="vazio">
              Nenhuma consulta registrada ainda.
            </p>
          </div>
        </section>

        <section class="painel">
          <h3>Pacientes mais frequentes</h3>
          <ol class="lista-frequentes" v-if="pacientesFrequentes.length">
            <li v-for="item in pacientesFrequentes" :key="item.paciente?.id">
              <span class="nome">{{ item.paciente?.nome || 'Paciente removido' }}</span>
              <span class="qtd">{{ item.totalConsultas }} consulta{{ item.totalConsultas === 1 ? '' : 's' }}</span>
            </li>
          </ol>
          <p v-else class="vazio">Sem dados suficientes ainda.</p>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import BarraLateral from '@/components/barraLateral.vue'
import api from '@/services/api'

const store = useStore()
const router = useRouter()

const carregando = ref(true)
const erro = ref('')
const estatisticas = ref({ consultasPorStatus: {} })
const pacientesFrequentes = ref([])

const maiorValor = computed(() => {
  const valores = Object.values(estatisticas.value.consultasPorStatus || {})
  return valores.length ? Math.max(...valores) : 1
})

function barraLargura(total) {
  const proporcao = maiorValor.value ? (total / maiorValor.value) * 100 : 0
  return `${Math.max(proporcao, 6)}%`
}

const rotulosStatus = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  em_atendimento: 'Em atendimento',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  faltou: 'Faltou',
}
function formatarStatus(status) {
  return rotulosStatus[status] || status
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const [resEstatisticas, resFrequentes] = await Promise.all([
      api.get('/api/relatorios/estatisticas'),
      api.get('/api/relatorios/pacientes-frequentes?limite=5'),
    ])
    estatisticas.value = resEstatisticas.data
    pacientesFrequentes.value = resFrequentes.data
  } catch (err) {
    console.error('Erro ao carregar relatórios:', err.response?.data || err)
    erro.value = 'Não foi possível carregar os relatórios.'
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

const handleNavigate = (routeName) => {
  router.push(`/${routeName}`)
}
const handleLogout = () => {
  store.dispatch('auth/logout')
  router.push('/login')
}
</script>

<style scoped>
.container {
  display: flex;
}

main {
  padding: 40px;
  flex-grow: 1;
}

.title {
  font-size: 26px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}

.subtitle {
  color: var(--ink-soft);
  margin: 4px 0 28px;
}

.estado {
  color: var(--ink-soft);
  padding: 20px 0;
}
.estado.erro {
  color: var(--danger);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: var(--shadow-sm);
}

.stat-label {
  font-size: 13px;
  color: var(--ink-soft);
  font-weight: 500;
}

.stat-value {
  font-size: 30px;
  font-weight: 800;
  color: var(--clay);
}

.painel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 22px 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.painel h3 {
  margin: 0 0 16px;
  font-size: 16px;
  color: var(--ink);
}

.status-linha {
  display: grid;
  grid-template-columns: 140px 1fr 40px;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 13px;
}

.status-nome {
  font-weight: 600;
  color: var(--ink-soft);
}

.status-barra-fundo {
  background: var(--surface-sunken);
  border-radius: var(--radius-pill);
  height: 10px;
  overflow: hidden;
}

.status-barra {
  height: 100%;
  border-radius: var(--radius-pill);
  background: var(--clay);
}

.status-total {
  text-align: right;
  color: var(--ink-soft);
  font-weight: 600;
}

.status-agendada { color: var(--honey-strong); }
.status-confirmada, .status-realizada { color: var(--sage-strong); }
.status-cancelada, .status-faltou { color: var(--danger); }

.status-barra.status-agendada { background: var(--honey); }
.status-barra.status-confirmada, .status-barra.status-realizada { background: var(--sage); }
.status-barra.status-em_atendimento { background: var(--clay); }
.status-barra.status-cancelada, .status-barra.status-faltou { background: var(--danger); }

.lista-frequentes {
  list-style: none;
  margin: 0;
  padding: 0;
}

.lista-frequentes li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
.lista-frequentes li:last-child {
  border-bottom: none;
}
.lista-frequentes .nome {
  color: var(--ink);
  font-weight: 500;
}
.lista-frequentes .qtd {
  color: var(--ink-soft);
}

.vazio {
  color: var(--ink-faint);
  font-size: 14px;
}
</style>
