import apiClient from '../client'

export const historialAPI = {
  // Obtener historial unificado
  getHistorial: (procesoId, params = {}) => {
    return apiClient.get(`/historial/procesos/${procesoId}/historial`, { params })
  },

  // Obtener historial de TRL
  getTRL: (procesoId) => {
    return apiClient.get(`/historial/procesos/${procesoId}/historial/trl`)
  },

  // Obtener historial de estados
  getEstados: (procesoId) => {
    return apiClient.get(`/historial/procesos/${procesoId}/historial/estados`)
  },

  // Obtener historial de fases
  getFases: (procesoId) => {
    return apiClient.get(`/historial/procesos/${procesoId}/historial/fases`)
  },

  // Obtener historial de empresas
  getEmpresas: (procesoId) => {
    return apiClient.get(`/historial/procesos/${procesoId}/historial/empresas`)
  }
}