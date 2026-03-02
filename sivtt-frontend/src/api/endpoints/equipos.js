import apiClient from '../client'

export const equiposAPI = {
  /**
   * GET /procesos/:id/usuarios
   * Retorna el equipo del proceso sin traer todo el proceso.
   * Si el backend no tiene este endpoint dedicado, usar procesosAPI.getById
   * y extraer data.data.usuarios desde el hook.
   */
  getEquipo: (procesoId) => {
    return apiClient.get(`/procesos/${procesoId}/usuarios`)
  },

  /**
   * POST /procesos/:id/usuarios
   * Body: { usuarioId, rolId }  ← rolId integer, NO rolProceso string
   */
  addMiembro: (procesoId, data) => {
    return apiClient.post(`/procesos/${procesoId}/usuarios`, data)
  },

  /**
   * DELETE /procesos/:id/usuarios/:usuarioId
   */
  removeMiembro: (procesoId, usuarioId) => {
    return apiClient.delete(`/procesos/${procesoId}/usuarios/${usuarioId}`)
  }
}