import apiLaravel from '../api/apiLaravel'

// El repositorio es la única puerta de entrada a este dominio.
// Los componentes nunca conocen la URL ni el shape crudo de la respuesta.
export const authRepository = {
  async login(email, password) {
    const { data } = await apiLaravel.post('/login', { email, password })
    return data // { token, user } -- ajustar si tu backend devuelve otra forma
  },
  async logout() {
    await apiLaravel.post('/logout')
  },
  async me() {
    const { data } = await apiLaravel.get('/me')
    return data
  },
}
