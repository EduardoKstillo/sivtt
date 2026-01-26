import apiClient from '../client'

export const convocatoriasAPI = {
  // Listar convocatorias del proceso
  listByProceso: (procesoId) => {
    return apiClient.get(`/procesos/${procesoId}/convocatorias`)
  },

  // Obtener detalle
  getById: (id) => {
    return apiClient.get(`/convocatorias/${id}`)
  },

  // Crear convocatoria
  create: (procesoId, data) => {
    return apiClient.post(`/procesos/${procesoId}/convocatorias`, data)
  },

  // Actualizar convocatoria
  update: (id, data) => {
    return apiClient.patch(`/convocatorias/${id}`, data)
  },

  // Cerrar convocatoria
  close: (id) => {
    return apiClient.patch(`/convocatorias/${id}/cerrar`)
  }
}