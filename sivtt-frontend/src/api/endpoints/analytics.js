import apiClient from '../client'

export const analyticsAPI = {
  // KPIs generales
  getKPIs: () => {
    return apiClient.get('/analytics/kpis')
  },

  // Procesos por estado
  getProcesosPorEstado: (params = {}) => {
    return apiClient.get('/analytics/procesos-por-estado', { params })
  },

  // Procesos por fase
  getProcesosPorFase: (params = {}) => {
    return apiClient.get('/analytics/procesos-por-fase', { params })
  },

  // Distribución de TRL
  getTRLDistribution: () => {
    return apiClient.get('/analytics/trl-distribution')
  },

  // Actividades por estado
  getActividadesPorEstado: (params = {}) => {
    return apiClient.get('/analytics/actividades-por-estado', { params })
  },

  // Timeline de creación
  getTimeline: (params = {}) => {
    return apiClient.get('/analytics/timeline', { params })
  },

  // Top empresas
  getTopEmpresas: (params = {}) => {
    return apiClient.get('/analytics/top-empresas', { params })
  },

  // Actividad reciente
  getRecentActivity: (params = {}) => {
    return apiClient.get('/analytics/recent-activity', { params })
  },

  // Métricas por tipo de proceso
  getMetricasPorTipo: () => {
    return apiClient.get('/analytics/metricas-por-tipo')
  }
}