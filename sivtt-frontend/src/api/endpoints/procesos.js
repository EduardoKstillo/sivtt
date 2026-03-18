import apiClient from '../client'

export const procesosAPI = {
  // Listar procesos con paginación y filtros
  list: (params = {}) => {
    return apiClient.get('/procesos', { params })
  },

  // Obtener detalle de un proceso
  getById: (id) => {
    return apiClient.get(`/procesos/${id}`)
  },

  // Crear nuevo proceso
  create: (data) => {
    return apiClient.post('/procesos', data)
  },

  // Actualizar proceso (título, descripción)
  update: (id, data) => {
    return apiClient.patch(`/procesos/${id}`, data)
  },

  changeEstado: (id, data) => {
    return apiClient.patch(`/procesos/${id}/estado`, data)
  },

  // Actualizar TRL
  updateTRL: (id, data) => {
    return apiClient.patch(`/procesos/${id}/trl`, data)
  },

  // Gestión de equipo
  assignUser: (id, data) => {
    return apiClient.post(`/procesos/${id}/usuarios`, data)
  },

  removeUser: (id, usuarioId) => {
    return apiClient.delete(`/procesos/${id}/usuarios/${usuarioId}`)
  },

  delete: (id) => {
    return apiClient.delete(`/procesos/${id}`)
  }
}