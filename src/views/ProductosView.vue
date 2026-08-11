<script setup>
import { ref, onMounted, computed } from 'vue'
import { productoRepository } from '../repositories/productoRepository'
import AppLayout from '../layouts/AppLayout.vue'

const productos = ref([])
const loading = ref(false)
const errorMsg = ref('')

const form = ref({ nombre: '', descripcion: '', categoria: '', precio: null })
const editingId = ref(null)
const categoriaFiltro = ref('')
const busqueda = ref('')

const categoriasDisponibles = computed(() => {
  const set = new Set(productos.value.map((p) => p.categoria).filter(Boolean))
  return Array.from(set).sort()
})

const productosFiltrados = computed(() => {
  let resultado = productos.value

  if (categoriaFiltro.value) {
    resultado = resultado.filter((p) => p.categoria === categoriaFiltro.value)
  }

  const termino = busqueda.value.trim().toLowerCase()
  if (termino) {
    resultado = resultado.filter((p) =>
      p.nombre?.toLowerCase().includes(termino) ||
      p.descripcion?.toLowerCase().includes(termino)
    )
  }

  return resultado
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
  <AppLayout>
    <div class="page-header">
      <h1>Productos</h1>
      <p style="color: var(--ink-muted);">Catálogo — Backend Node / MongoDB</p>
    </div>
    <p v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</p>

    <div class="card">
      <h2>{{ editingId ? 'Editar producto' : 'Nuevo producto' }}</h2>
      <form @submit.prevent="guardar" class="form-row">
        <input v-model="form.nombre" placeholder="Nombre" required />
        <input v-model="form.categoria" placeholder="Categoría" />
        <input v-model.number="form.precio" type="number" step="0.01" placeholder="Precio" required />
        <input v-model="form.descripcion" placeholder="Descripción (opcional)" />
        <button type="submit" class="btn btn-primary">{{ editingId ? 'Actualizar' : 'Crear' }}</button>
        <button v-if="editingId" type="button" class="btn" @click="resetForm">Cancelar</button>
      </form>
    </div>

    <div class="card">
      <div class="form-row" style="margin-bottom: 12px;">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre o descripción..."
          style="flex: 1; min-width: 220px;"
        />
        <label style="align-self: center; font-size: 14px; color: var(--ink-muted);">Filtrar por categoría</label>
        <select v-model="categoriaFiltro">
          <option value="">Todas</option>
          <option v-for="cat in categoriasDisponibles" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <span style="align-self: center; font-size: 13px; color: var(--ink-muted);">
          {{ productosFiltrados.length }} de {{ productos.length }} productos
        </span>
      </div>

      <p v-if="loading">Cargando...</p>
      <table v-else>
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
              <button class="btn" @click="editar(p)">Editar</button>
              <button class="btn" @click="desactivar(p._id)">Desactivar</button>
            </td>
          </tr>
          <tr v-if="productosFiltrados.length === 0">
            <td colspan="5" style="text-align: center; color: var(--ink-muted);">No hay productos que coincidan con la búsqueda.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppLayout>
</template>
