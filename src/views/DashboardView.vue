<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div style="font-family: sans-serif; padding: 24px;">
    <h1>Dashboard POS AOS</h1>
    <p>Bienvenido, sesión iniciada correctamente.</p>
    <router-link to="/productos">Ver Productos</router-link>
    <router-link to="/inventario">Ver Inventario</router-link>
    <button @click="handleLogout">Cerrar sesión</button>
  </div>
</template>
