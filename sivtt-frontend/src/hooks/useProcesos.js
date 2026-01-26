import { useState, useEffect, useCallback } from 'react'
import { procesosAPI } from '@api/endpoints/procesos'
import { toast } from '@components/ui/use-toast'

export const useProcesos = (initialFilters = {}) => {
  const [procesos, setProcesos] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    tipoActivo: '',
    estado: '',
    faseActual: '',
    ...initialFilters
  })

  const fetchProcesos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Limpiar filtros vacíos
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      )

      const { data } = await procesosAPI.list(cleanFilters)
      
      setProcesos(data.data.procesos || [])
      setPagination(data.data.pagination || null)
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar procesos",
        description: err.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProcesos()
  }, [fetchProcesos])

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1 // Reset page si cambian otros filtros
    }))
  }

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      search: '',
      tipoActivo: '',
      estado: '',
      faseActual: ''
    })
  }

  return {
    procesos,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchProcesos
  }
}