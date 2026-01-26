import apiClient from '../client'

export const authAPI = {
  // Login
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials)
  },

  // Refresh token
  refresh: (refreshToken) => {
    return apiClient.post('/auth/refresh', { refreshToken })
  },

  // Logout
  logout: () => {
    return apiClient.post('/auth/logout')
  }
}