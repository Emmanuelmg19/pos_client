import { defineStore } from 'pinia'
import { authRepository } from '../repositories/authRepository'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('pos_token') || null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email, password) {
      const { token, user } = await authRepository.login(email, password)
      this.token = token
      this.user = user
      localStorage.setItem('pos_token', token)
    },
    async logout() {
      try {
        await authRepository.logout()
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem('pos_token')
      }
    },
  },
})
