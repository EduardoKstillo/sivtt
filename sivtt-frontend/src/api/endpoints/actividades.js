import apiClient from '../client'

export const actividadesAPI = {
  // Listar actividades de un proceso
  listByProceso: (procesoId, params = {}) => {
    return apiClient.get(`/actividades/procesos/${procesoId}/actividades`, { params })
  },

  // Obtener detalle de actividad
  getById: (id) => {
    return apiClient.get(`/actividades/${id}`)
  },

  // Crear actividad
  create: (procesoId, data) => {
    return apiClient.post(`/actividades/procesos/${procesoId}/actividades`, data)
  },

  // Cambiar estado
  changeEstado: (id, data) => {
    return apiClient.patch(`/actividades/${id}/estado`, data)
  },

  // Aprobar actividad
  aprobar: (id) => {
    return apiClient.post(`/actividades/${id}/aprobar`)
  },

  // Gestionar asignaciones
  assignUser: (id, data) => {
    return apiClient.post(`/actividades/${id}/asignaciones`, data)
  },

  removeUser: (id, usuarioId) => {
    return apiClient.delete(`/actividades/${id}/asignaciones/${usuarioId}`)
  },

  update: (id, data) => {
    return apiClient.patch(`/actividades/${id}`, data)
  },

  // Eliminar actividad
  delete: (id) => {
    return apiClient.delete(`/actividades/${id}`)
  }
}