<script setup>
import { ref, onMounted, computed } from 'vue'
import { productoRepository } from '../repositories/productoRepository'

const productos = ref([])
const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  nombre: '',
  descripcion: '',
  categoria: '',
  precio: null,
})
const editingId = ref(null)

const categoriaFiltro = ref('')

const categoriasDisponibles = computed(() => {
  const set = new Set(productos.value.map((p) => p.categoria).filter(Boolean))
  return Array.from(set).sort()
})

const productosFiltrados = computed(() => {
  if (!categoriaFiltro.value) return productos.value
  return productos.value.filter((p) => p.categoria === categoriaFiltro.value)
})

async function cargarProductos() {
  loading.value = true
  errorMsg.value = ''
  try {
    productos.value = await productoRepository.getAll()
  } catch (err) {
    errorMsg.value = 'No se pudieron cargar los productos.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function guardar() {
  try {
    if (editingId.value) {
      await productoRepository.update(editingId.value, form.value)
    } else {
      await productoRepository.create(form.value)
    }
    resetForm()
    await cargarProductos()
  } catch (err) {
    errorMsg.value = 'Error al guardar el producto.'
    console.error(err)
  }
}

function editar(producto) {
  editingId.value = producto._id
  form.value = {
    nombre: producto.nombre,
    descripcion: producto.descripcion || '',
    categoria: producto.categoria || '',
    precio: producto.precio,
  }
}

async function desactivar(id) {
  if (!confirm('¿Desactivar este producto? (borrado lógico, activo: false)')) return
  try {
    await productoRepository.deactivate(id)
    await cargarProductos()
  } catch (err) {
    errorMsg.value = 'Error al desactivar el producto.'
    console.error(err)
  }
}

function resetForm() {
  editingId.value = null
  form.value = { nombre: '', descripcion: '', categoria: '', precio: null }
}

onMounted(cargarProductos)
</script>

<template>
  <div style="font-family: sans-serif; padding: 24px; max-width: 800px; margin: 0 auto;">
    <h1>Productos</h1>
    <p v-if="errorMsg" style="color: red;">{{ errorMsg }}</p>

    <form @submit.prevent="guardar" style="margin-bottom: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
      <input v-model="form.nombre" placeholder="Nombre" required />
      <input v-model="form.categoria" placeholder="Categoría" />
      <input v-model.number="form.precio" type="number" step="0.01" placeholder="Precio" required />
      <input v-model="form.descripcion" placeholder="Descripción (opcional)" />
      <button type="submit">{{ editingId ? 'Actualizar' : 'Crear' }}</button>
      <button v-if="editingId" type="button" @click="resetForm">Cancelar</button>
    </form>

    <div style="margin-bottom: 16px;">
      <label>Filtrar por categoría: </label>
      <select v-model="categoriaFiltro">
        <option value="">Todas</option>
        <option v-for="cat in categoriasDisponibles" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <p v-if="loading">Cargando...</p>
    <table v-else border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in productosFiltrados" :key="p._id">
          <td>{{ p.nombre }}</td>
          <td>{{ p.categoria }}</td>
          <td>${{ p.precio }}</td>
          <td>{{ p.activo ? 'Activo' : 'Inactivo' }}</td>
          <td>
            <button @click="editar(p)">Editar</button>
            <button @click="desactivar(p._id)">Desactivar</button>
          </td>
        </tr>
        <tr v-if="productosFiltrados.length === 0">
          <td colspan="5" style="text-align: center; color: #888;">No hay productos en esta categoría.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
