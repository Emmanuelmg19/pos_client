import apiLaravel from '../api/apiLaravel'

// Repositorio del dominio Ventas -> Backend Laravel.
// Cada item requiere producto_id (string, _id de Mongo), cantidad, precio_unitario.
// El backend valida stock por transacción atómica antes de descontar.
export const ventaRepository = {
  async getAll() {
    const { data } = await apiLaravel.get('/ventas')
    return data
  },
  async create({ cliente_id, items }) {
    const { data } = await apiLaravel.post('/ventas', { cliente_id, items })
    return data
  },
  async remove(id) {
    const { data } = await apiLaravel.delete(`/ventas/${id}`)
    return data
  },
}
