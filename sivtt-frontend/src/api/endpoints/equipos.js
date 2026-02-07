import apiClient from '../client'

export const equiposAPI = {
  // En tu ProcesoService.getById ya vienen los usuarios, así que listByProceso
  // podría no ser necesario si usamos el dato del proceso padre. 
  // Pero si quieres refrescar solo el equipo:
  // Backend no tiene un endpoint dedicado "GET /equipo", usa el del proceso.
  // Opción A: Reusar getById del proceso (más pesado pero seguro)
  listByProceso: (procesoId) => {
    return apiClient.get(`/procesos/${procesoId}`) 
  },

  // Backend: ProcesoService.assignUsuario
  // Endpoint esperado: POST /procesos/:id/usuarios
  addMiembro: (procesoId, data) => {
    return apiClient.post(`/procesos/${procesoId}/usuarios`, data)
  },

  // Backend: ProcesoService.removeUsuario
  // Endpoint esperado: DELETE /procesos/:id/usuarios/:usuarioId
  removeMiembro: (procesoId, usuarioId) => {
    return apiClient.delete(`/procesos/${procesoId}/usuarios/${usuarioId}`)
  }
}