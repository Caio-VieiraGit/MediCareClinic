import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Agenda from '@/views/Agenda.vue'
import Consultas from '@/views/Consultas.vue'
import Pacientes from '@/views/Pacientes.vue'
import Medicos from '@/views/Medicos.vue'
import Atendimento from '@/views/Atendimento.vue'
import Relatorios from '@/views/Relatorios.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {requiresAuth: true}
  },
  {
    path: '/atendimento',
    name: 'Atendimento',
    component: Atendimento,
    meta: {requiresAuth: true}
  },
  {
    path: '/agenda',
    name: 'Agenda',
    component: Agenda,
    meta: {requiresAuth: true}
  },
  {
    path: '/consultas',
    name: 'Consultas',
    component: Consultas,
    meta: {requiresAuth: true}
  },
  // Reaproveitam o Consultas.vue existente — a view lê o :id/rota pra abrir
  // o modal de nova consulta ou selecionar a consulta certa automaticamente.
  {
    path: '/consultas/novo',
    name: 'ConsultaNova',
    component: Consultas,
    meta: {requiresAuth: true}
  },
  {
    path: '/consultas/:id',
    name: 'ConsultaDetalhe',
    component: Consultas,
    meta: {requiresAuth: true}
  },
  {
    path: '/consultas/:id/atendimento',
    name: 'ConsultaAtendimento',
    component: Atendimento,
    meta: {requiresAuth: true}
  },
  {
    path: '/pacientes',
    name: 'Pacientes',
    component: Pacientes,
    meta: {requiresAuth: true}
  },
  // Idem: reaproveitam o Pacientes.vue existente
  {
    path: '/pacientes/novo',
    name: 'PacienteNovo',
    component: Pacientes,
    meta: {requiresAuth: true}
  },
  {
    path: '/pacientes/:id',
    name: 'PacienteDetalhe',
    component: Pacientes,
    meta: {requiresAuth: true}
  },
  {
    path: '/medicos',
    name: 'Medicos',
    component: Medicos,
    meta: {requiresAuth: true, requiresAdmin: true}
  },
  {
    path: '/relatorios',
    name: 'Relatorios',
    component: Relatorios,
    meta: {requiresAuth: true, allowedRoles: ['admin', 'medico']}
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next)=>{
  const perfil = store.getters['auth/user']?.perfil
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const perfilRoutes = {
  admin: '/dashboard',
  medico: '/agenda',
  recepcionista: '/consultas'
}

  


  // 1. Rotas que exigem login
  if (to.meta.requiresAuth && !isAuthenticated) {
    if (to.path !== '/login') {
      return next('/login')
    }
  }

  // 2. Rotas que exigem admin
  if (to.meta.requiresAdmin && perfil !== 'admin') {
    if (!perfil) {
      store.dispatch('auth/logout')
      if (to.path !== '/login') {
        return next('/login')
      }
    }
    return next(perfilRoutes[perfil] || '/login')
  }

  // 2b. Rotas que exigem um perfil específico dentre uma lista (ex.: admin OU médico)
  if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(perfil)) {
    if (!perfil) {
      store.dispatch('auth/logout')
      if (to.path !== '/login') {
        return next('/login')
      }
    }
    return next(perfilRoutes[perfil] || '/login')
  }

  // 3. Rotas guest (login)
  if (to.meta.requiresGuest && isAuthenticated) {
    const destino = perfilRoutes[perfil] || '/login'
    if (to.path !== destino) {
      return next(destino)
    }
  }

  // 4. Caso padrão
  next()
})

export default router