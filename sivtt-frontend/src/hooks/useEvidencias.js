import { useState, useEffect, useCallback } from 'react'
import { evidenciasAPI } from '@api/endpoints/evidencias'
import { toast } from '@components/ui/use-toast'

export const useEvidencias = (procesoId, initialFilters = {}) => {
  const [evidencias, setEvidencias] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    fase: '',
    tipo: '',
    estado: '',
    actividadId: '',
    ...initialFilters
  })

  const fetchEvidencias = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      )

      const { data } = await evidenciasAPI.listByProceso(procesoId, cleanFilters)
      
      setEvidencias(data.data.evidencias || [])
      setPagination(data.data.pagination || null)
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar evidencias",
        description: err.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }, [procesoId, filters])

  useEffect(() => {
    fetchEvidencias()
  }, [fetchEvidencias])

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1
    }))
  }

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      fase: '',
      tipo: '',
      estado: '',
      actividadId: ''
    })
  }

  // Agrupar evidencias por fase
  const evidenciasPorFase = evidencias.reduce((acc, evidencia) => {
    const fase = evidencia.actividad?.fase || 'SIN_FASE'
    if (!acc[fase]) {
      acc[fase] = []
    }
    acc[fase].push(evidencia)
    return acc
  }, {})

  return {
    evidencias,
    evidenciasPorFase,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchEvidencias
  }
}