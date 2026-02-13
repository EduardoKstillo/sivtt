import { useState, useEffect } from 'react'
import { analyticsAPI } from '@api/endpoints/analytics'
import { toast } from '@components/ui/use-toast'

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    kpis: null,
    procesosPorEstado: [],
    procesosPorFase: [],
    trlDistribution: [],
    actividadesPorEstado: [],
    timeline: [],
    topEmpresas: [],
    recentActivity: [],
    metricasPorTipo: null
  })
  const [error, setError] = useState(null)

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [
        kpisRes,
        estadosRes,
        fasesRes,
        trlRes,
        actividadesRes,
        timelineRes,
        empresasRes,
        activityRes,
        metricasRes
      ] = await Promise.all([
        analyticsAPI.getKPIs(),
        analyticsAPI.getProcesosPorEstado(),
        analyticsAPI.getProcesosPorFase(),
        analyticsAPI.getTRLDistribution(),
        analyticsAPI.getActividadesPorEstado(),
        analyticsAPI.getTimeline({ periodo: 'ultimo_ano' }),
        analyticsAPI.getTopEmpresas({ limit: 5 }),
        analyticsAPI.getRecentActivity({ limit: 10 }),
        analyticsAPI.getMetricasPorTipo()
      ])

      setData({
        kpis: kpisRes.data.data,
        procesosPorEstado: estadosRes.data.data,
        procesosPorFase: fasesRes.data.data,
        trlDistribution: trlRes.data.data,
        actividadesPorEstado: actividadesRes.data.data,
        timeline: timelineRes.data.data,
        topEmpresas: empresasRes.data.data,
        recentActivity: activityRes.data.data,
        metricasPorTipo: metricasRes.data.data
      })
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar dashboard",
        description: err.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  }
}