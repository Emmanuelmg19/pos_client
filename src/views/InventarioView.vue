<script setup>
import { ref, onMounted, computed } from 'vue'
import { inventarioRepository } from '../repositories/inventarioRepository'
import { productoRepository } from '../repositories/productoRepository'
import AppLayout from '../layouts/AppLayout.vue'

const inventario = ref([])
const productos = ref([])
const loading = ref(false)
const errorMsg = ref('')

const form = ref({ producto_id: '', cantidad_disponible: null, ubicacion: '' })
const editingId = ref(null)
const ajusteCantidad = ref({})

const productoNombrePorId = computed(() => {
  const mapa = {}
  for (const p of productos.value) mapa[p._id] = p.nombre
  return mapa
})

async function cargarTodo() {
  loading.value = true
  errorMsg.value = ''
  try {
    const [inv, prods] = await Promise.all([inventarioRepository.getAll(), productoRepository.getAll()])
    inventario.value = inv
    productos.value = prods
  } catch (err) {
    errorMsg.value = 'No se pudo cargar el inventario o el catálogo de productos.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function guardar() {
  try {
    if (editingId.value) {
      await inventarioRepository.update(editingId.value, form.value)
    } else {
      await inventarioRepository.create(form.value)
    }
    resetForm()
    await cargarTodo()
  } catch (err) {
    errorMsg.value = 'Error al guardar el registro de inventario.'
    console.error(err)
  }
}

function editar(item) {
  editingId.value = item.id
  form.value = {
    producto_id: item.producto_id,
    cantidad_disponible: item.cantidad_disponible,
    ubicacion: item.ubicacion || '',
  }
}

async function eliminar(id) {
  if (!confirm('¿Eliminar este registro de inventario?')) return
  try {
    await inventarioRepository.remove(id)
    await cargarTodo()
  } catch (err) {
    errorMsg.value = 'Error al eliminar el registro.'
    console.error(err)
  }
}

async function ajustar(id) {
  const cantidad = Number(ajusteCantidad.value[id])
  if (!cantidad) return
  try {
    await inventarioRepository.ajustarStock(id, cantidad)
    ajusteCantidad.value[id] = null
    await cargarTodo()
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Error al ajustar stock.'
    console.error(err)
  }
}

function resetForm() {
  editingId.value = null
  form.value = { producto_id: '', cantidad_disponible: null, ubicacion: '' }
}

onMounted(cargarTodo)
</script>

<template>
  <AppLayout>
    <div class="page-header">
      <h1>Inventario</h1>
      <p style="color: var(--ink-muted);">Stock por producto — Backend Laravel / PostgreSQL</p>
    </div>
    <p v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</p>

    <div class="card">
      <h2>{{ editingId ? 'Editar registro' : 'Nuevo registro' }}</h2>
      <form @submit.prevent="guardar" class="form-row">
        <select v-model="form.producto_id" required>
          <option value="" disabled>Selecciona un producto</option>
          <option v-for="p in productos" :key="p._id" :value="p._id">{{ p.nombre }}</option>
        </select>
        <input v-model.number="form.cantidad_disponible" type="number" min="0" placeholder="Cantidad" required />
        <input v-model="form.ubicacion" placeholder="Ubicación (opcional)" />
        <button type="submit" class="btn btn-primary">{{ editingId ? 'Actualizar' : 'Crear' }}</button>
        <button v-if="editingId" type="button" class="btn" @click="resetForm">Cancelar</button>
      </form>
    </div>

    <div class="card">
      <p v-if="loading">Cargando...</p>
      <table v-else>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Stock disponible</th>
            <th>Ubicación</th>
            <th>Ajustar stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in inventario" :key="item.id">
            <td>{{ productoNombrePorId[item.producto_id] || item.producto_id }}</td>
            <td>{{ item.cantidad_disponible }}</td>
            <td>{{ item.ubicacion || '—' }}</td>
            <td>
              <input v-model="ajusteCantidad[item.id]" type="number" placeholder="+5 / -3" style="width: 70px;" />
              <button class="btn" @click="ajustar(item.id)">Aplicar</button>
            </td>
            <td>
              <button class="btn" @click="editar(item)">Editar</button>
              <button class="btn" @click="eliminar(item.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppLayout>
</template>
