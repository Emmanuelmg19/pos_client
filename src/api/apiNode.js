import axios from 'axios'

const apiNode = axios.create({
  baseURL: import.meta.env.VITE_API_NODE,
})

export default apiNode
