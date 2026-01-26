import apiClient from '../client'

export const gruposAPI = {
  // Listar grupos
  list: (params = {}) => {
    return apiClient.get('/grupos', { params })
  },

  // Obtener detalle
  getById: (id) => {
    return apiClient.get(`/grupos/${id}`)
  },

  // Crear grupo
  create: (data) => {
    return apiClient.post('/grupos', data)
  },

  // Actualizar grupo
  update: (id, data) => {
    return apiClient.patch(`/grupos/${id}`, data)
  },

  // Activar/Desactivar
  toggleActivo: (id) => {
    return apiClient.patch(`/grupos/${id}/toggle-activo`)
  },

  // ===== MIEMBROS =====

  // Agregar miembro
  addMiembro: (grupoId, data) => {
    return apiClient.post(`/grupos/${grupoId}/miembros`, data)
  },

  // Remover miembro
  removeMiembro: (grupoId, usuarioId) => {
    return apiClient.delete(`/grupos/${grupoId}/miembros/${usuarioId}`)
  },

  // Actualizar rol de miembro
  updateMiembro: (grupoId, usuarioId, data) => {
    return apiClient.patch(`/grupos/${grupoId}/miembros/${usuarioId}`, data)
  }
}