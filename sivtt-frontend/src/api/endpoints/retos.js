import apiClient from '../client'

export const retosAPI = {
  // Obtener reto del proceso
  getByProceso: (procesoId) => {
    return apiClient.get(`/procesos/${procesoId}/reto`)
  },

  // Actualizar reto
  update: (procesoId, data) => {
    return apiClient.patch(`/procesos/${procesoId}/reto`, data)
  }
}