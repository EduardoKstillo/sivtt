import apiClient from '../client'

export const retosAPI = {
  // Obtener reto por proceso
  getByProceso: (procesoId) => {
    return apiClient.get(`/procesos/${procesoId}/reto`)
  },

  // Listar convocatorias del reto
  listConvocatorias: (retoId) => {
    return apiClient.get(`/retos/${retoId}/convocatorias`)
  },

  // Crear reto
  create: (procesoId, data) => {
    return apiClient.post(`/procesos/${procesoId}/reto`, data)
  },

  // Actualizar reto
  update: (procesoId, retoId, data) => {
    return apiClient.patch(`/procesos/${procesoId}/reto/${retoId}`, data)
  }
}