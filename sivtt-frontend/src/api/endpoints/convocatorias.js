import apiClient from '../client'

export const convocatoriasAPI = {
  // ===== LISTADO GLOBAL =====
  
  // Listar todas las convocatorias (página global)
  list: (params = {}) => {
    return apiClient.get('/convocatorias', { params })
  },

  // Obtener detalle de convocatoria
  getById: (id) => {
    return apiClient.get(`/convocatorias/${id}`)
  },

  // ===== GESTIÓN DE CONVOCATORIAS =====

  // Crear convocatoria (desde un reto)
  create: (retoId, data) => {
    return apiClient.post(`/retos/${retoId}/convocatorias`, data)
  },

  // Actualizar convocatoria (solo BORRADOR)
  update: (id, data) => {
    return apiClient.patch(`/convocatorias/${id}`, data)
  },

  // ===== CAMBIOS DE ESTADO =====

  // Publicar convocatoria
  publicar: (id) => {
    return apiClient.patch(`/convocatorias/${id}/publicar`)
  },

  // Cerrar convocatoria
  cerrar: (id) => {
    return apiClient.patch(`/convocatorias/${id}/cerrar`)
  },

  // Relanzar convocatoria
  relanzar: (id, data) => {
    return apiClient.post(`/convocatorias/${id}/relanzar`, data)
  }
}