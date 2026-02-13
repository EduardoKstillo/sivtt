import apiClient from '../client'

export const convocatoriasAPI = {
  // ===== LISTADO GLOBAL =====
  
  list: (params = {}) => {
    return apiClient.get('/convocatorias', { params })
  },

  getById: (id) => {
    return apiClient.get(`/convocatorias/${id}`)
  },

  // ===== GESTIÓN DE CONVOCATORIAS =====

  // 🔥 CAMBIO: ahora es /convocatorias/:retoId/convocatorias
  create: (retoId, data) => {
    return apiClient.post(`/convocatorias/retos/${retoId}/convocatorias`, data)
  },

  update: (id, data) => {
    return apiClient.patch(`/convocatorias/${id}`, data)
  },

  // ===== CAMBIOS DE ESTADO =====

  publicar: (id) => {
    return apiClient.patch(`/convocatorias/${id}/publicar`)
  },

  cerrar: (id) => {
    return apiClient.patch(`/convocatorias/${id}/cerrar`)
  },

  relanzar: (id, data) => {
    return apiClient.post(`/convocatorias/${id}/relanzar`, data)
  }
}