import apiClient from '../client'

export const fasesAPI = {
  // Listar todas las fases de un proceso
  listByProceso: (procesoId) => {
    return apiClient.get(`/fases/procesos/${procesoId}/fases`)
  },

  // Obtener detalle de fase específica
  getByFase: (procesoId, fase) => {
    return apiClient.get(`/fases/procesos/${procesoId}/fases/${fase}`)
  },

  // Actualizar fase
  update: (id, data) => {
    return apiClient.patch(`/fases/fases/${id}`, data)
  },

  // Cerrar fase
  close: (id, data) => {
    return apiClient.post(`/fases/fases/${id}/cerrar`, data)
  }
}