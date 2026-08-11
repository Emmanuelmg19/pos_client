<script setup>
import { ref, onMounted } from 'vue'
import { reporteRepository } from '../repositories/reporteRepository'
import { descargarCSV } from '../utils/csv'

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
    reporte.value.ventas.map((v) => [
      v.fecha,
      v.cliente ? v.cliente.nombre : 'Público general',
      v.total,
    ])
  )
}

onMounted(cargarReporte)
</script>

<template>
  <div style="font-family: sans-serif; padding: 24px; max-width: 900px; margin: 0 auto;">
    <h1>Reportes</h1>
    <p v-if="errorMsg" style="color: red;">{{ errorMsg }}</p>
    <p v-if="loading">Generando reporte...</p>

    <template v-if="reporte">
      <div style="display: flex; gap: 24px; margin-bottom: 24px;">
        <div><strong>Ventas totales:</strong> {{ reporte.totalVentas }}</div>
        <div><strong>Unidades vendidas:</strong> {{ reporte.unidadesTotal }}</div>
        <div><strong>Monto total:</strong> ${{ reporte.montoTotal.toFixed(2) }}</div>
      </div>

      <h2>Ventas por producto</h2>
      <button type="button" @click="exportarPorProducto" style="margin-bottom: 12px;">
        Exportar CSV (por producto)
      </button>
      <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
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

      <button type="button" @click="exportarHistorialCompleto">
        Exportar CSV (historial completo de ventas)
      </button>
    </template>
  </div>
</template>
