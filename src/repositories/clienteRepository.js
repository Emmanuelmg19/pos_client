import apiLaravel from '../api/apiLaravel'

// Repositorio del dominio Clientes -> Backend Laravel.
export const clienteRepository = {
  async getAll() {
    const { data } = await apiLaravel.get('/clientes')
    return data
  },
  async create({ nombre, telefono, email }) {
    const { data } = await apiLaravel.post('/clientes', { nombre, telefono, email })
    return data
  },
  async update(id, { nombre, telefono, email }) {
    const { data } = await apiLaravel.put(`/clientes/${id}`, { nombre, telefono, email })
    return data
  },
  async remove(id) {
    const { data } = await apiLaravel.delete(`/clientes/${id}`)
    return data
  },
}
