import apiClient from '../client'

export const equiposAPI = {
  // Listar miembros del equipo
  listByProceso: (procesoId) => {
    return apiClient.get(`/procesos/${procesoId}/equipo`)
  },

  // Agregar miembro
  addMiembro: (procesoId, data) => {
    return apiClient.post(`/procesos/${procesoId}/equipo`, data)
  },

  // Actualizar miembro
  updateMiembro: (procesoId, usuarioId, data) => {
    return apiClient.patch(`/procesos/${procesoId}/equipo/${usuarioId}`, data)
  },

  // Remover miembro
  removeMiembro: (procesoId, usuarioId) => {
    return apiClient.delete(`/procesos/${procesoId}/equipo/${usuarioId}`)
  }
}