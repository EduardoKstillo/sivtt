import apiClient from '../client'

export const decisionesAPI = {
  // Listar decisiones históricas de un proceso
  listByProceso: (procesoId, params = {}) => {
    return apiClient.get(`/decisiones/procesos/${procesoId}/decisiones`, { params })
  },

  // Crear una nueva decisión (Continuar, Retroceder, Pausar, etc.)
  // Backend espera: POST /procesos/:procesoId/fases/:faseId/decisiones
  create: (procesoId, faseId, data) => {
    return apiClient.post(`/decisiones/procesos/${procesoId}/fases/${faseId}/decisiones`, data)
  }
} 