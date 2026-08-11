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
  <div class="login-container">
    <h1>POS AOS — Iniciar sesión</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label>Correo</label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>Contraseña</label>
        <input v-model="password" type="password" required />
      </div>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 320px;
  margin: 80px auto;
  font-family: sans-serif;
}
form div {
  margin-bottom: 12px;
}
input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.error {
  color: red;
}
button {
  width: 100%;
  padding: 10px;
}
</style>
