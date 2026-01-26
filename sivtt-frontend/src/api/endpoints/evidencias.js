import apiClient from '../client'

export const evidenciasAPI = {
  // Listar evidencias de un proceso
  listByProceso: (procesoId, params = {}) => {
    return apiClient.get(`/evidencias/procesos/${procesoId}/evidencias`, { params })
  },

  // Subir evidencia
  upload: (actividadId, formData) => {
    return apiClient.post(`/evidencias/actividades/${actividadId}/evidencias`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Revisar evidencia
  review: (id, data) => {
    return apiClient.patch(`/evidencias/${id}/revisar`, data)
  },

  // Obtener detalle
  getById: (id) => {
    return apiClient.get(`/evidencias/${id}`)
  },

  // Eliminar evidencia
  delete: (id) => {
    return apiClient.delete(`/evidencias/${id}`)
  }
}