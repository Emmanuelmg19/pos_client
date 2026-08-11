// No hay un endpoint dedicado de reportes en el backend todavía;
// este repositorio compone el reporte en el cliente a partir de
// los datos ya expuestos por ventaRepository y productoRepository.
// Si en el futuro se agrega GET /reports/sales_summary en Laravel,
// solo se reemplaza la implementación interna sin tocar los consumidores.
import { ventaRepository } from './ventaRepository'
import { productoRepository } from './productoRepository'

export const reporteRepository = {
  async getReporteVentas() {
    const [ventas, productos] = await Promise.all([
      ventaRepository.getAll(),
      productoRepository.getAll(),
    ])

    const nombrePorId = {}
    for (const p of productos) {
      nombrePorId[p._id] = p.nombre
    }

    const porProducto = {}
    let montoTotal = 0
    let unidadesTotal = 0

    for (const venta of ventas) {
      montoTotal += Number(venta.total || 0)
      for (const d of venta.detalles || []) {
        const nombre = nombrePorId[d.producto_id] || d.producto_id
        if (!porProducto[nombre]) {
          porProducto[nombre] = { producto: nombre, unidades: 0, monto: 0 }
        }
        porProducto[nombre].unidades += d.cantidad
        porProducto[nombre].monto += d.cantidad * d.precio_unitario
        unidadesTotal += d.cantidad
      }
    }

    return {
      totalVentas: ventas.length,
      montoTotal,
      unidadesTotal,
      porProducto: Object.values(porProducto).sort((a, b) => b.unidades - a.unidades),
      ventas,
    }
  },
}
