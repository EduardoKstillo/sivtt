import { useState, useEffect, useCallback, useMemo } from 'react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from '@components/ui/use-toast'

/**
 * Hook para la página "Mis Actividades".
 *
 * Agrupa las actividades en tres secciones:
 *  1. requierenAtencion — requiereAccion === true (acción urgente del usuario)
 *  2. enCurso           — activas pero sin acción urgente (LISTA_PARA_CIERRE, EN_PROGRESO sin urgencia)
 *  3. finalizadas       — APROBADA o con fechaCierre
 *
 * También agrupa por proceso dentro de cada sección para dar contexto visual.
 */
export const useMisActividades = () => {
  const [actividades, setActividades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtros
  const [filters, setFilters] = useState({
    estado: 'all',
    tipo: 'all',
    fase: 'all',
    rolCodigo: 'all',
    search: ''
  })

  const fetchActividades = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      // Solo enviamos a la API si el valor no es 'all' y no está vacío
      if (filters.estado && filters.estado !== 'all')    params.estado = filters.estado
      if (filters.tipo && filters.tipo !== 'all')        params.tipo = filters.tipo
      if (filters.fase && filters.fase !== 'all')        params.fase = filters.fase
      if (filters.rolCodigo && filters.rolCodigo !== 'all') params.rolCodigo = filters.rolCodigo

      const { data } = await actividadesAPI.getMisAsignaciones(params)
      setActividades(data.data.actividades || [])
    } catch (err) {
      setError(err)
      toast({
        variant: 'destructive',
        title: 'Error al cargar actividades',
        description: err.response?.data?.message || 'Error inesperado'
      })
    } finally {
      setLoading(false)
    }
  }, [filters.estado, filters.tipo, filters.fase, filters.rolCodigo])

  useEffect(() => { fetchActividades() }, [fetchActividades])

  // Filtro local de búsqueda (sobre el resultado ya cargado)
  const actividadesFiltradas = useMemo(() => {
    if (!filters.search.trim()) return actividades
    const term = filters.search.toLowerCase()
    return actividades.filter(a =>
      a.nombre.toLowerCase().includes(term) ||
      a.proceso?.titulo?.toLowerCase().includes(term) ||
      a.proceso?.codigo?.toLowerCase().includes(term)
    )
  }, [actividades, filters.search])

  // Separar en grupos
  const grupos = useMemo(() => {
    const requierenAtencion = actividadesFiltradas.filter(
      a => a.requiereAccion && a.estado !== 'APROBADA'
    )
    const enCurso = actividadesFiltradas.filter(
      a => !a.requiereAccion && a.estado !== 'APROBADA'
    )
    const finalizadas = actividadesFiltradas.filter(
      a => a.estado === 'APROBADA'
    )
    return { requierenAtencion, enCurso, finalizadas }
  }, [actividadesFiltradas])

  // Conteo para el badge del sidebar
  const conteoUrgente = grupos.requierenAtencion.length

  // Agrupar por proceso dentro de una sección
  const agruparPorProceso = useCallback((lista) => {
    const map = new Map()
    lista.forEach(act => {
      const key = act.proceso?.id ?? 'sin-proceso'
      if (!map.has(key)) {
        map.set(key, { proceso: act.proceso, actividades: [] })
      }
      map.get(key).actividades.push(act)
    })
    return [...map.values()]
  }, [])

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // El reset ahora debe volver a 'all'
  const resetFilters = useCallback(() => {
    setFilters({ 
      estado: 'all', 
      tipo: 'all', 
      fase: 'all', 
      rolCodigo: 'all', 
      search: '' 
    })
  }, [])

  // El contador ahora ignora los valores 'all'
  const activeFilterCount = Object.entries(filters).filter(([key, v]) => {
    if (key === 'search') return v !== ''
    return v !== 'all'
  }).length

  return {
    loading,
    error,
    grupos,
    conteoUrgente,
    agruparPorProceso,
    filters,
    updateFilter,
    resetFilters,
    activeFilterCount,
    refetch: fetchActividades,
    total: actividadesFiltradas.length
  }
}