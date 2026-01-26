import apiClient from '../client'

export const reunionesAPI = {
  // Listar reuniones de un proceso
  listByProceso: (procesoId, params = {}) => {
    return apiClient.get(`/reuniones/procesos/${procesoId}/reuniones`, { params })
  },

  // Obtener detalle
  getById: (id) => {
    return apiClient.get(`/reuniones/${id}`)
  },

  // Crear reunión
  create: (actividadId, data) => {
    return apiClient.post(`/reuniones/actividades/${actividadId}/reunion`, data)
  },

  // Actualizar reunión
  update: (id, data) => {
    return apiClient.patch(`/reuniones/${id}`, data)
  },

  // Completar reunión
  complete: (id, data) => {
    return apiClient.patch(`/reuniones/${id}/completar`, data)
  },

  // Gestionar participantes
  addParticipante: (id, data) => {
    return apiClient.post(`/reuniones/${id}/participantes`, data)
  },

  removeParticipante: (id, participanteId) => {
    return apiClient.delete(`/reuniones/${id}/participantes/${participanteId}`)
  }
}