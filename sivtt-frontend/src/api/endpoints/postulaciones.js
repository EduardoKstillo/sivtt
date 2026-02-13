import apiClient from '../client'

export const postulacionesAPI = {
  // Listar postulaciones por convocatoria
  listByConvocatoria: (convocatoriaId, params = {}) => {
    return apiClient.get(`/postulaciones/convocatorias/${convocatoriaId}/postulaciones`, { params })
  },

  // Obtener detalle de postulación
  getById: (id) => {
    return apiClient.get(`/postulaciones/${id}`)
  },

  // Crear postulación (desde un grupo)
  create: (retoId, data) => {
    return apiClient.post(`/postulaciones/retos/${retoId}/postulaciones`, data)
  },

  // Evaluar postulación
  evaluar: (id, data) => {
    return apiClient.patch(`/postulaciones/${id}/evaluar`, data)
  },

  // Seleccionar ganador
  seleccionar: (id) => {
    return apiClient.patch(`/postulaciones/${id}/seleccionar`)
  },

  // Rechazar postulación
  rechazar: (id, data) => {
    return apiClient.patch(`/postulaciones/${id}/rechazar`, data)
  }
}