import apiClient from '../client'

export const empresasAPI = {
  // Listar empresas globales
  list: (params = {}) => {
    return apiClient.get('/empresas', { params })
  },

  // Obtener detalle
  getById: (id) => {
    return apiClient.get(`/empresas/${id}`)
  },

  // Crear empresa
  create: (data) => {
    return apiClient.post('/empresas', data)
  },

  // Actualizar empresa
  update: (id, data) => {
    return apiClient.patch(`/empresas/${id}`, data)
  },

  // Verificar empresa
  verify: (id) => {
    return apiClient.patch(`/empresas/${id}/verificar`, {verificada: true})
  },

  // ===== VINCULACIÓN CON PROCESOS =====

  // Listar empresas vinculadas a un proceso
  listByProceso: (procesoId) => {
    return apiClient.get(`/procesos/${procesoId}/empresas`)
  },

  // Listar empresas disponibles para vincular
  listDisponibles: (procesoId) => {
    return apiClient.get(`/procesos/${procesoId}/empresas/disponibles`)
  },

  // Vincular empresa a proceso
  vincular: (procesoId, data) => {
    return apiClient.post(`/procesos/${procesoId}/empresas`, data)
  },

  // Actualizar vinculación
  updateVinculacion: (procesoId, empresaId, data) => {
    return apiClient.patch(`/procesos/${procesoId}/empresas/${empresaId}`, data)
  },

  // Retirar empresa
  retirar: (procesoId, empresaId) => {
    return apiClient.patch(`/procesos/${procesoId}/empresas/${empresaId}/retirar`)
  },

  // Reactivar empresa
  reactivar: (procesoId, empresaId) => {
    return apiClient.patch(`/procesos/${procesoId}/empresas/${empresaId}/reactivar`)
  }
}