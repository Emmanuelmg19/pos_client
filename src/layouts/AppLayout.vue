<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import apiLaravel from '../api/apiLaravel'
import apiNode from '../api/apiNode'

const authStore = useAuthStore()
const router = useRouter()

const laravelStatus = ref('checking') // 'ok' | 'down' | 'checking'
const nodeStatus = ref('checking')

async function checkStatus() {
  try {
    await apiLaravel.get('/inventario')
    laravelStatus.value = 'ok'
  } catch (err) {
    // 401 significa que el servicio respondió (solo falta auth) -> sigue "online"
    laravelStatus.value = err.response ? 'ok' : 'down'
  }
  try {
    await apiNode.get('/productos')
    nodeStatus.value = 'ok'
  } catch (err) {
    nodeStatus.value = err.response ? 'ok' : 'down'
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}

onMounted(checkStatus)
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-brand">POS · AOS</div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/productos">Productos</router-link>
        <router-link to="/inventario">Inventario</router-link>
        <router-link to="/clientes">Clientes</router-link>
        <router-link to="/ventas">Ventas</router-link>
        <router-link to="/reportes">Reportes</router-link>
      </nav>
      <button class="sidebar-logout" @click="handleLogout">Cerrar sesión</button>
      <div class="sidebar-status">
        <div><span class="status-dot" :class="laravelStatus === 'checking' ? 'checking' : laravelStatus"></span>Laravel</div>
        <div><span class="status-dot" :class="nodeStatus === 'checking' ? 'checking' : nodeStatus"></span>Node</div>
      </div>
    </aside>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>
