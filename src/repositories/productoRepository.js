import apiNode from '../api/apiNode'

// Repositorio del dominio Productos -> Backend Node (dueño exclusivo del catálogo).
// Nota: el STOCK no vive aquí, vive en el módulo Inventario de Laravel,
// que referencia el producto por su _id de Mongo (string). Ver inventarioRepository.
export const productoRepository = {
  async getAll() {
    const { data } = await apiNode.get('/productos')
    return data
  },
  async getById(id) {
    const { data } = await apiNode.get(`/productos/${id}`)
    return data
  },
  async create(producto) {
    const { data } = await apiNode.post('/productos', producto)
    return data
  },
  async update(id, producto) {
    const { data } = await apiNode.put(`/productos/${id}`, producto)
    return data
  },
  async deactivate(id) {
    // DELETE en tu backend Node hace borrado lógico (activo: false), no borrado físico
    const { data } = await apiNode.delete(`/productos/${id}`)
    return data
  },
}
