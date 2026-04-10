import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom' // ✅ Importamos hook de React Router
import { procesosAPI } from '@api/endpoints/procesos'
import { toast } from 'sonner' // ✅ Migrado a Sonner

export const useProcesos = (initialFilters = {}) => {
  const [procesos, setProcesos] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ✅ Obtenemos los parámetros de la URL
  const [searchParams, setSearchParams] = useSearchParams()

  // ✅ Estado derivado: Leemos de la URL o usamos valores por defecto
  const filters = {
    page: parseInt(searchParams.get('page')) || initialFilters.page || 1,
    limit: parseInt(searchParams.get('limit')) || initialFilters.limit || 12,
    search: searchParams.get('search') || initialFilters.search || '',
    tipoActivo: searchParams.get('tipoActivo') || initialFilters.tipoActivo || '',
    estado: searchParams.get('estado') || initialFilters.estado || '',
    faseActual: searchParams.get('faseActual') || initialFilters.faseActual || ''
  }

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
      toast.error("Error al cargar procesos", { // ✅ Sintaxis Sonner
        description: err.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page, 
    filters.limit, 
    filters.search, 
    filters.tipoActivo, 
    filters.estado, 
    filters.faseActual
  ])

  useEffect(() => {
    fetchProcesos()
  }, [fetchProcesos])

  // ✅ Actualizar la URL en lugar del estado local
  const updateFilters = (newFilters) => {
    const currentParams = Object.fromEntries(searchParams.entries())
    
    const updatedParams = {
      ...currentParams,
      ...newFilters,
      // Si cambian otros filtros, reseteamos a la página 1
      page: newFilters.page !== undefined ? newFilters.page : 1
    }

    // Eliminamos las llaves vacías para mantener la URL limpia
    Object.keys(updatedParams).forEach(key => {
      if (updatedParams[key] === '' || updatedParams[key] === undefined || updatedParams[key] === null) {
        delete updatedParams[key]
      }
    })

    setSearchParams(updatedParams, { replace: true })
  }

  // ✅ Resetear la URL elimina todos los parámetros de búsqueda
  const resetFilters = () => {
    setSearchParams({}, { replace: true })
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