<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const authStore = useAuthStore()
const router = useRouter()

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (err) {
    errorMsg.value = 'Credenciales inválidas o error de conexión.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>POS · AOS</h1>
      <p style="color: var(--ink-muted); font-size: 13px; margin: 0 0 24px;">Iniciar sesión</p>
      <form @submit.prevent="handleLogin">
        <label>Correo</label>
        <input v-model="email" type="email" required />
        <label>Contraseña</label>
        <input v-model="password" type="password" required />
        <p v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</p>
        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
    </div>
  </div>
</template>
