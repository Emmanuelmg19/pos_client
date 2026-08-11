<script setup>
import { ref, onMounted } from 'vue'
import { reporteRepository } from '../repositories/reporteRepository'
import { descargarCSV } from '../utils/csv'
import AppLayout from '../layouts/AppLayout.vue'

const reporte = ref(null)
const loading = ref(false)
const errorMsg = ref('')

async function cargarReporte() {
  loading.value = true
  errorMsg.value = ''
  try {
    reporte.value = await reporteRepository.getReporteVentas()
  } catch (err) {
    errorMsg.value = 'No se pudo generar el reporte.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function exportarPorProducto() {
  if (!reporte.value) return
  descargarCSV(
    `reporte_ventas_por_producto_${new Date().toISOString().slice(0, 10)}.csv`,
    ['Producto', 'Unidades vendidas', 'Monto generado'],
    reporte.value.porProducto.map((p) => [p.producto, p.unidades, p.monto.toFixed(2)])
  )
}

function exportarHistorialCompleto() {
  if (!reporte.value) return
  descargarCSV(
    `historial_ventas_${new Date().toISOString().slice(0, 10)}.csv`,
    ['Fecha', 'Cliente', 'Total'],
    reporte.value.ventas.map((v) => [v.fecha, v.cliente ? v.cliente.nombre : 'Público general', v.total])
  )
}

onMounted(cargarReporte)
</script>

<template>
  <AppLayout>
    <div class="page-header">
      <h1>Reportes</h1>
      <p style="color: var(--ink-muted);">Compuesto en el cliente a partir de ambos servicios</p>
    </div>
    <p v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</p>
    <p v-if="loading">Generando reporte...</p>

    <template v-if="reporte">
      <div class="card" style="display: flex; gap: 32px;">
        <div>
          <h2>Ventas totales</h2>
          <p style="font-family: var(--font-display); font-size: 20px; font-weight: 600; margin: 0;">{{ reporte.totalVentas }}</p>
        </div>
        <div>
          <h2>Unidades vendidas</h2>
          <p style="font-family: var(--font-display); font-size: 20px; font-weight: 600; margin: 0;">{{ reporte.unidadesTotal }}</p>
        </div>
        <div>
          <h2>Monto total</h2>
          <p style="font-family: var(--font-display); font-size: 20px; font-weight: 600; margin: 0;">${{ reporte.montoTotal.toFixed(2) }}</p>
        </div>
      </div>

      <div class="card">
        <h2>Ventas por producto</h2>
        <button type="button" class="btn" style="margin: 8px 0 16px;" @click="exportarPorProducto">
          Exportar CSV (por producto)
        </button>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Unidades vendidas</th>
              <th>Monto generado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in reporte.porProducto" :key="p.producto">
              <td>{{ p.producto }}</td>
              <td>{{ p.unidades }}</td>
              <td>${{ p.monto.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button type="button" class="btn btn-primary" @click="exportarHistorialCompleto">
        Exportar CSV (historial completo de ventas)
      </button>
    </template>
  </AppLayout>
</template>
