<template>
    <aside class="sidebar">
        <div class="brand">
            <div class="icon">+</div>
            <div>
                <h2>MediCare</h2>
                <span>Clínica</span>
            </div>
        </div>

        <div class="user-box">
            <div class="avatar">{{ username.charAt(0).toUpperCase()}}</div>
            <div>
                <p class="username">{{ username }}</p>
                <span class="role">{{ userRole }}</span>
            </div>
        </div>

        <nav class="menu">
          <a
          v-for="item in rotasPermitidas"
          :key="item.name"
          href="#"
          class="item"
          :class="{ active: rotaAtual === item.path }"
          @click.prevent="$emit('navigate', item.path)">
            {{ item.label }}
          </a>
        </nav>

        <button class="logout" @click="$emit('logout')">
            <span class="icon"><img src="../assets/logout.png"></span>
            <span>Sair</span>
        </button>
    </aside>

</template>
<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  const props = defineProps({
  userRole: {
    type: String,
    required: true,
    default: ''
  },
  username: {
    type: String,
    required: true,
    default: ''
  }
})

const route = useRoute()
const rotaAtual = computed(() => route.name)

const rotasPorCargo = {
    admin: [
        {name: 'dashboard', path: 'dashboard', label: 'Dashboard'},
        {name: 'agenda', path: 'agenda', label: 'Agenda'},
         {name: 'atendimento', path: 'atendimento', label: 'Atendimento'},
        {name: 'consultas', path: 'consultas', label: 'Consultas'},
        {name: 'pacientes', path: 'pacientes', label: 'Pacientes'},
        {name: 'medicos', path: 'medicos', label: 'Médicos'},
        {name: 'relatorios', path: 'relatorios', label: 'Relatórios'}
    ],
    medico: [
        {name: 'agenda', path: 'agenda', label: 'Agenda'},
        {name: 'atendimento', path: 'atendimento', label: 'Atendimento'},      
    ],
    recepcionista: [
        {name: 'consultas', path: 'consultas', label: 'Consultas'},
        {name: 'pacientes', path: 'pacientes', label: 'Pacientes'}
    ]
}

const rotasPermitidas = computed(() => rotasPorCargo[props.userRole] || [])
</script>
<style>

.sidebar {
    width: 240px;
    background: var(--surface);
    padding: 24px 18px;
    border-right: 1px solid var(--border);
    height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: var(--font-sans);
}

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 32px;
    padding: 0 6px;
}

.brand .icon {
    background: var(--clay);
    color: #fff;
    width: 36px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--radius-sm);
    font-size: 22px;
    line-height: 1;
    flex-shrink: 0;
}

.brand h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: var(--ink);
}

.brand span {
    font-size: 12px;
    color: var(--ink-soft);
}

.user-box {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
    padding: 10px;
    background: var(--surface-sunken);
    border-radius: var(--radius-md);
}

.user-box .avatar {
    background: var(--clay-soft);
    color: var(--clay-strong);
    width: 38px;
    height: 38px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    font-weight: 700;
    flex-shrink: 0;
}

.username {
    font-weight: 600;
    color: var(--ink);
    margin: 0;
    font-size: 14px;
}

.role {
    font-size: 12px;
    color: var(--ink-soft);
    text-transform: capitalize;
}

.menu {
    display: flex;
    flex-direction: column;
}

.menu .item {
    display: block;
    padding: 11px 12px;
    border-radius: var(--radius-sm);
    color: var(--ink-soft);
    text-decoration: none;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.menu .item:hover {
    background: var(--surface-sunken);
    color: var(--ink);
}

.menu .item.active {
    background: var(--clay-soft);
    color: var(--clay-strong);
    font-weight: 600;
}

.logout {
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
    background: transparent;
    padding: 12px;
    font-size: 14px;
    font-weight: 500;
    font-family: var(--font-sans);
    color: var(--ink-soft);
    cursor: pointer;
    margin-top: auto;
    border-radius: var(--radius-sm);
    transition: background-color 0.15s ease;
}

.logout img {
    width: 16px;
    height: 16px;
    opacity: 0.7;
}

.logout:hover {
    background-color: var(--danger-soft);
}

.logout:hover span {
    color: var(--danger);
}

</style>
