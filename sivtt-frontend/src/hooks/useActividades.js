import { useState, useEffect, useCallback } from 'react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from '@components/ui/use-toast'

export const useActividades = (procesoId, initialFilters = {}) => {
  const [actividades, setActividades] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    fase: '',
    estado: '',
    tipo: '',
    responsableId: '',
    ...initialFilters
  })

  const fetchActividades = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // ✅ Limpieza robusta de filtros para el backend
      const params = {
        page: filters.page,
        limit: filters.limit,
        // Convertir strings vacíos o "Todos" a undefined
        fase: (filters.fase && filters.fase !== 'Todas') ? filters.fase : undefined,
        estado: (filters.estado && filters.estado !== 'Todos') ? filters.estado : undefined,
        tipo: (filters.tipo && filters.tipo !== 'Todos') ? filters.tipo : undefined,
        responsableId: filters.responsableId || undefined
      }

      const { data } = await actividadesAPI.listByProceso(procesoId, params)
      
      setActividades(data.data.actividades || [])
      setPagination(data.data.pagination || null)
    } catch (err) {
      console.error(err)
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar actividades",
        description: err.response?.data?.message || "Error de conexión"
      })
    } finally {
      setLoading(false)
    }
  }, [procesoId, filters])

  useEffect(() => {
    fetchActividades()
  }, [fetchActividades])

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Si cambia un filtro que no es paginación, volver a página 1
      page: (newFilters.page !== undefined) ? newFilters.page : 1
    }))
  }

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      fase: '',
      estado: '',
      tipo: '',
      responsableId: ''
    })
  }

  return {
    actividades,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchActividades
  }
}