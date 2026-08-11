<script setup>
import { ref, onMounted } from 'vue'
import { clienteRepository } from '../repositories/clienteRepository'

const clientes = ref([])
const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  nombre: '',
  telefono: '',
  email: '',
})
const editingId = ref(null)

async function cargarClientes() {
  loading.value = true
  errorMsg.value = ''
  try {
    clientes.value = await clienteRepository.getAll()
  } catch (err) {
    errorMsg.value = 'No se pudieron cargar los clientes.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function guardar() {
  try {
    if (editingId.value) {
      await clienteRepository.update(editingId.value, form.value)
    } else {
      await clienteRepository.create(form.value)
    }
    resetForm()
    await cargarClientes()
  } catch (err) {
    errorMsg.value = 'Error al guardar el cliente.'
    console.error(err)
  }
}

function editar(cliente) {
  editingId.value = cliente.id
  form.value = {
    nombre: cliente.nombre,
    telefono: cliente.telefono || '',
    email: cliente.email || '',
  }
}

async function eliminar(id) {
  if (!confirm('¿Eliminar este cliente?')) return
  try {
    await clienteRepository.remove(id)
    await cargarClientes()
  } catch (err) {
    errorMsg.value = 'Error al eliminar el cliente.'
    console.error(err)
  }
}

function resetForm() {
  editingId.value = null
  form.value = { nombre: '', telefono: '', email: '' }
}

onMounted(cargarClientes)
</script>

<template>
  <div style="font-family: sans-serif; padding: 24px; max-width: 800px; margin: 0 auto;">
    <h1>Clientes</h1>
    <p v-if="errorMsg" style="color: red;">{{ errorMsg }}</p>

    <form @submit.prevent="guardar" style="margin-bottom: 24px; display: flex; gap: 8px; flex-wrap: wrap;">
      <input v-model="form.nombre" placeholder="Nombre" required />
      <input v-model="form.telefono" placeholder="Teléfono (opcional)" />
      <input v-model="form.email" type="email" placeholder="Email (opcional)" />
      <button type="submit">{{ editingId ? 'Actualizar' : 'Crear' }}</button>
      <button v-if="editingId" type="button" @click="resetForm">Cancelar</button>
    </form>

    <p v-if="loading">Cargando...</p>
    <table v-else border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in clientes" :key="c.id">
          <td>{{ c.nombre }}</td>
          <td>{{ c.telefono || '—' }}</td>
          <td>{{ c.email || '—' }}</td>
          <td>
            <button @click="editar(c)">Editar</button>
            <button @click="eliminar(c.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
