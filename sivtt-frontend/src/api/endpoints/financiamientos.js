import apiClient from '../client'

export const financiamientosAPI = {
  // Listar financiamientos de un proceso
  listByProceso: (procesoId) => {
    return apiClient.get(`/procesos/${procesoId}/financiamientos`)
  },

  // Obtener detalle
  getById: (id) => {
    return apiClient.get(`/financiamientos/${id}`)
  },

  // Registrar financiamiento
  create: (procesoId, data) => {
    return apiClient.post(`/procesos/${procesoId}/financiamientos`, data)
  },

  // Actualizar financiamiento
  update: (id, data) => {
    return apiClient.patch(`/financiamientos/${id}`, data)
  },

  // Eliminar financiamiento
  delete: (id) => {
    return apiClient.delete(`/financiamientos/${id}`)
  }
}