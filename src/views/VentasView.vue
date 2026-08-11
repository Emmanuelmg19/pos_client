<script setup>
import { ref, onMounted, computed } from 'vue'
import { ventaRepository } from '../repositories/ventaRepository'
import { clienteRepository } from '../repositories/clienteRepository'
import { productoRepository } from '../repositories/productoRepository'
import { inventarioRepository } from '../repositories/inventarioRepository'
import AppLayout from '../layouts/AppLayout.vue'

const ventas = ref([])
const clientes = ref([])
const productos = ref([])
const inventario = ref([])
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const clienteSeleccionado = ref('')
const carrito = ref([])
const productoParaAgregar = ref('')
const cantidadParaAgregar = ref(1)

const stockPorProducto = computed(() => {
  const mapa = {}
  for (const inv of inventario.value) mapa[inv.producto_id] = inv.cantidad_disponible
  return mapa
})

const nombrePorProductoId = computed(() => {
  const mapa = {}
  for (const p of productos.value) mapa[p._id] = p.nombre
  return mapa
})

const totalCarrito = computed(() =>
  carrito.value.reduce((acc, item) => acc + item.cantidad * item.precio_unitario, 0)
)

async function cargarTodo() {
  loading.value = true
  errorMsg.value = ''
  try {
    const [v, c, p, inv] = await Promise.all([
      ventaRepository.getAll(),
      clienteRepository.getAll(),
      productoRepository.getAll(),
      inventarioRepository.getAll(),
    ])
    ventas.value = v
    clientes.value = c
    productos.value = p
    inventario.value = inv
  } catch (err) {
    errorMsg.value = 'No se pudo cargar la información de ventas.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function agregarAlCarrito() {
  if (!productoParaAgregar.value || cantidadParaAgregar.value < 1) return
  const producto = productos.value.find((p) => p._id === productoParaAgregar.value)
  if (!producto) return
  const existente = carrito.value.find((item) => item.producto_id === producto._id)
  if (existente) {
    existente.cantidad += cantidadParaAgregar.value
  } else {
    carrito.value.push({
      producto_id: producto._id,
      nombre: producto.nombre,
      cantidad: cantidadParaAgregar.value,
      precio_unitario: producto.precio,
    })
  }
  productoParaAgregar.value = ''
  cantidadParaAgregar.value = 1
}

function quitarDelCarrito(producto_id) {
  carrito.value = carrito.value.filter((item) => item.producto_id !== producto_id)
}

async function confirmarVenta() {
  errorMsg.value = ''
  successMsg.value = ''
  if (carrito.value.length === 0) {
    errorMsg.value = 'Agrega al menos un producto al carrito.'
    return
  }
  try {
    await ventaRepository.create({
      cliente_id: clienteSeleccionado.value || null,
      items: carrito.value.map(({ producto_id, cantidad, precio_unitario }) => ({
        producto_id,
        cantidad,
        precio_unitario,
      })),
    })
    successMsg.value = 'Venta registrada correctamente. Stock actualizado.'
    carrito.value = []
    clienteSeleccionado.value = ''
    await cargarTodo()
  } catch (err) {
    let mensaje = err.response?.data?.message || 'Error al registrar la venta.'
    for (const p of productos.value) {
      if (mensaje.includes(p._id)) {
        mensaje = mensaje.replace(p._id, `"${p.nombre}"`)
        break
      }
    }
    errorMsg.value = mensaje
    console.error(err)
  }
}

async function cancelarVenta(id) {
  if (!confirm('¿Cancelar esta venta? El stock se restaurará.')) return
  try {
    await ventaRepository.remove(id)
    await cargarTodo()
  } catch (err) {
    errorMsg.value = 'Error al cancelar la venta.'
    console.error(err)
  }
}

function nombreCliente(cliente) {
  return cliente ? cliente.nombre : 'Público general'
}

function totalUnidades(venta) {
  return venta.detalles?.reduce((acc, d) => acc + d.cantidad, 0) || 0
}

function resumenProductos(venta) {
  if (!venta.detalles?.length) return '—'
  return venta.detalles
    .map((d) => `${nombrePorProductoId.value[d.producto_id] || d.producto_id} x${d.cantidad}`)
    .join(', ')
}

onMounted(cargarTodo)
</script>

<template>
  <AppLayout>
    <div class="page-header">
      <h1>Ventas</h1>
      <p style="color: var(--ink-muted);">Backend Laravel — transacción atómica con validación de stock</p>
    </div>
    <p v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</p>
    <p v-if="successMsg" class="alert alert-success">{{ successMsg }}</p>

    <div class="card">
      <h2>Nueva venta</h2>
      <div class="form-row" style="margin-bottom: 8px;">
        <label style="align-self: center; font-size: 14px; color: var(--ink-muted);">Cliente</label>
        <select v-model="clienteSeleccionado">
          <option value="">Público general</option>
          <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
      </div>

      <div class="form-row">
        <select v-model="productoParaAgregar">
          <option value="" disabled>Selecciona un producto</option>
          <option v-for="p in productos" :key="p._id" :value="p._id">
            {{ p.nombre }} — ${{ p.precio }} (stock: {{ stockPorProducto[p._id] ?? 0 }})
          </option>
        </select>
        <input v-model.number="cantidadParaAgregar" type="number" min="1" style="width: 70px;" />
        <button type="button" class="btn" @click="agregarAlCarrito">Agregar al carrito</button>
      </div>

      <table v-if="carrito.length" style="margin-top: 12px; margin-bottom: 12px;">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio unitario</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in carrito" :key="item.producto_id">
            <td>{{ item.nombre }}</td>
            <td>{{ item.cantidad }}</td>
            <td>${{ item.precio_unitario }}</td>
            <td>${{ (item.cantidad * item.precio_unitario).toFixed(2) }}</td>
            <td><button type="button" class="btn" @click="quitarDelCarrito(item.producto_id)">Quitar</button></td>
          </tr>
        </tbody>
      </table>
      <p v-if="carrito.length" style="font-family: var(--font-display); font-weight: 600;">
        Total: ${{ totalCarrito.toFixed(2) }}
      </p>

      <button type="button" class="btn btn-primary" :disabled="carrito.length === 0" @click="confirmarVenta">
        Confirmar venta
      </button>
    </div>

    <div class="card">
      <h2>Historial de ventas</h2>
      <p v-if="loading">Cargando...</p>
      <table v-else>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Productos vendidos</th>
            <th>Unidades totales</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in ventas" :key="v.id">
            <td>{{ v.fecha }}</td>
            <td>{{ nombreCliente(v.cliente) }}</td>
            <td>{{ resumenProductos(v) }}</td>
            <td>{{ totalUnidades(v) }}</td>
            <td>${{ v.total }}</td>
            <td><button type="button" class="btn" @click="cancelarVenta(v.id)">Cancelar</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppLayout>
</template>
