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

  listByProceso: (procesoId) => {
    return apiClient.get(`/procesos/${procesoId}/empresas`)
  },

  listDisponibles: (procesoId) => {
    return apiClient.get(`/procesos/${procesoId}/empresas/disponibles`)
  },

  vincular: (procesoId, data) => {
    return apiClient.post(`/procesos/${procesoId}/empresas`, data)
  },

  // ✅ ACTUALIZADO: Soporte para archivos (FormData)
  updateVinculacion: (procesoId, vinculacionId, data) => {
    const isFormData = data instanceof FormData;
    return apiClient.patch(
      `/procesos/${procesoId}/empresas/${vinculacionId}`, 
      data,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    )
  },

  retirar: (procesoId, vinculacionId) => {
    return apiClient.patch(`/procesos/${procesoId}/empresas/${vinculacionId}/retirar`)
  },

  reactivar: (procesoId, vinculacionId) => {
    return apiClient.patch(`/procesos/${procesoId}/empresas/${vinculacionId}/reactivar`)
  }
}