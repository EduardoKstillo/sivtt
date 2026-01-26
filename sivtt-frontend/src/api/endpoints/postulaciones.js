import apiClient from '../client'

export const postulacionesAPI = {
  // Listar postulaciones de una convocatoria
  listByConvocatoria: (convocatoriaId) => {
    return apiClient.get(`/convocatorias/${convocatoriaId}/postulaciones`)
  },

  // Obtener detalle
  getById: (id) => {
    return apiClient.get(`/postulaciones/${id}`)
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