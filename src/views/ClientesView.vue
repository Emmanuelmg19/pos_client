<script setup>
import { ref, onMounted } from 'vue'
import { clienteRepository } from '../repositories/clienteRepository'
import AppLayout from '../layouts/AppLayout.vue'

const clientes = ref([])
const loading = ref(false)
const errorMsg = ref('')

const form = ref({ nombre: '', telefono: '', email: '' })
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
  <AppLayout>
    <div class="page-header">
      <h1>Clientes</h1>
      <p style="color: var(--ink-muted);">Backend Laravel / PostgreSQL</p>
    </div>
    <p v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</p>

    <div class="card">
      <h2>{{ editingId ? 'Editar cliente' : 'Nuevo cliente' }}</h2>
      <form @submit.prevent="guardar" class="form-row">
        <input v-model="form.nombre" placeholder="Nombre" required />
        <input v-model="form.telefono" placeholder="Teléfono (opcional)" />
        <input v-model="form.email" type="email" placeholder="Email (opcional)" />
        <button type="submit" class="btn btn-primary">{{ editingId ? 'Actualizar' : 'Crear' }}</button>
        <button v-if="editingId" type="button" class="btn" @click="resetForm">Cancelar</button>
      </form>
    </div>

    <div class="card">
      <p v-if="loading">Cargando...</p>
      <table v-else>
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
              <button class="btn" @click="editar(c)">Editar</button>
              <button class="btn" @click="eliminar(c.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppLayout>
</template>
