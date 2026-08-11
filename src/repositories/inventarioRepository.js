import apiLaravel from '../api/apiLaravel'

// Repositorio del dominio Inventario -> Backend Laravel.
// producto_id es un string (el _id de Mongo del catálogo Node), no una FK real,
// por eso se resuelve manualmente cruzando con productoRepository en la vista.
export const inventarioRepository = {
  async getAll() {
    const { data } = await apiLaravel.get('/inventario')
    return data
  },
  async create({ producto_id, cantidad_disponible, ubicacion }) {
    const { data } = await apiLaravel.post('/inventario', {
      producto_id,
      cantidad_disponible,
      ubicacion,
    })
    return data
  },
  async update(id, { producto_id, cantidad_disponible, ubicacion }) {
    const { data } = await apiLaravel.put(`/inventario/${id}`, {
      producto_id,
      cantidad_disponible,
      ubicacion,
    })
    return data
  },
  async remove(id) {
    const { data } = await apiLaravel.delete(`/inventario/${id}`)
    return data
  },
  async ajustarStock(id, cantidad) {
    // cantidad positiva suma, negativa resta; el backend valida que no quede negativo
    const { data } = await apiLaravel.patch(`/inventario/${id}/ajustar-stock`, { cantidad })
    return data
  },
}
