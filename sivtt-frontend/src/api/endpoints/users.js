import apiClient from '../client'

export const usersAPI = {
  // Listar usuarios
  list: (params = {}) => {
    return apiClient.get('/usuarios', { params })
  },

  // Obtener detalle
  getById: (id) => {
    return apiClient.get(`/usuarios/${id}`)
  },

  // Crear usuario
  create: (data) => {
    return apiClient.post('/usuarios', data)
  },

  // Actualizar usuario
  update: (id, data) => {
    return apiClient.patch(`/usuarios/${id}`, data)
  },

  // Cambiar contraseña
  changePassword: (id, data) => {
    return apiClient.patch(`/usuarios/${id}/password`, data)
  },

  // Toggle estado
  toggleEstado: (id, data) => {
    return apiClient.patch(`/usuarios/${id}/toggle-estado`, data)
  },

  // Gestionar roles
  assignRole: (id, rolId) => {
    return apiClient.post(`/usuarios/${id}/roles`, { rolId })
  },

  removeRole: (id, rolId) => {
    return apiClient.delete(`/usuarios/${id}/roles/${rolId}`)
  },

  // Obtener roles disponibles
  getRoles: () => {
    return apiClient.get('/usuarios/roles')
  }
}