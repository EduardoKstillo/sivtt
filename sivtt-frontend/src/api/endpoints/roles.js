import apiClient from '../client'

export const rolesAPI = {
  // Listar todos los roles
  list: (params = {}) => {
    return apiClient.get('/roles', { params })
  },

  // Listar roles por ámbito (SISTEMA, PROCESO, ACTIVIDAD, EMPRESA)
  listByAmbito: (ambito) => {
    return apiClient.get('/roles', { params: { ambito } })
  },

  // Obtener detalle de un rol con sus permisos
  getById: (id) => {
    return apiClient.get(`/roles/${id}`)
  },

  // Crear rol
  create: (data) => {
    return apiClient.post('/roles', data)
  },

  // Actualizar rol
  update: (id, data) => {
    return apiClient.patch(`/roles/${id}`, data)
  },

  // Asignar permiso a rol
  assignPermiso: (id, permisoId) => {
    return apiClient.post(`/roles/${id}/permisos`, { permisoId })
  },

  // Remover permiso de rol
  removePermiso: (id, permisoId) => {
    return apiClient.delete(`/roles/${id}/permisos/${permisoId}`)
  }
}