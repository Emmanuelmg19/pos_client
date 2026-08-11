import axios from 'axios'

// Singleton: una sola instancia configurada, reutilizada en toda la app
const apiLaravel = axios.create({
  baseURL: import.meta.env.VITE_API_LARAVEL,
})

apiLaravel.interceptors.request.use((config) => {
  const token = localStorage.getItem('pos_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiLaravel
