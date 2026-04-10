import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom' // ✅ Importamos useSearchParams
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from 'sonner' // ✅ Migrado a Sonner

export const useMisActividades = () => {
  const [actividades, setActividades] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  // ✅ Conectamos los filtros a la URL
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = {
    estado:    searchParams.get('estado') || 'all',
    tipo:      searchParams.get('tipo') || 'all',
    fase:      searchParams.get('fase') || 'all',
    rolCodigo: searchParams.get('rolCodigo') || 'all',
    search:    searchParams.get('search') || '',
  }

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchActividades = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filters.estado    && filters.estado    !== 'all') params.estado    = filters.estado
      if (filters.tipo      && filters.tipo      !== 'all') params.tipo      = filters.tipo
      if (filters.fase      && filters.fase      !== 'all') params.fase      = filters.fase
      if (filters.rolCodigo && filters.rolCodigo !== 'all') params.rolCodigo = filters.rolCodigo

      const { data } = await actividadesAPI.getMisAsignaciones(params)
      setActividades(data.data.actividades || [])
    } catch (err) {
      setError(err)
      toast.error('Error al cargar actividades', { // ✅ Sintaxis Sonner
        description: err.response?.data?.message || 'Error inesperado',
      })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.estado, filters.tipo, filters.fase, filters.rolCodigo]) // Search es local, no requiere refetch

  useEffect(() => { fetchActividades() }, [fetchActividades])

  // ── Filtro local por búsqueda ─────────────────────────────────────────────
  const actividadesFiltradas = useMemo(() => {
    if (!filters.search.trim()) return actividades
    const term = filters.search.toLowerCase()
    return actividades.filter(a =>
      a.nombre.toLowerCase().includes(term) ||
      a.proceso?.titulo?.toLowerCase().includes(term) ||
      a.proceso?.codigo?.toLowerCase().includes(term),
    )
  }, [actividades, filters.search])

  // ── Agrupación en secciones ───────────────────────────────────────────────
  const grupos = useMemo(() => ({
    requierenAtencion: actividadesFiltradas.filter(
      a => a.requiereAccion && a.estado !== 'APROBADA',
    ),
    enCurso: actividadesFiltradas.filter(
      a => !a.requiereAccion && a.estado !== 'APROBADA',
    ),
    finalizadas: actividadesFiltradas.filter(
      a => a.estado === 'APROBADA',
    ),
  }), [actividadesFiltradas])

  const agruparPorProceso = useCallback((lista = []) => {
    const map = new Map()
    lista.forEach(act => {
      const key = act.proceso?.id ?? 'sin-proceso'
      if (!map.has(key)) map.set(key, { proceso: act.proceso, actividades: [] })
      map.get(key).actividades.push(act)
    })
    return [...map.values()]
  }, [])

  // ── Filtros a la URL ───────────────────────────────────────────────────────
  const updateFilter = useCallback((key, value) => {
    const currentParams = Object.fromEntries(searchParams.entries())
    
    if (value === 'all' || value === '') {
      delete currentParams[key]
    } else {
      currentParams[key] = value
    }
    
    setSearchParams(currentParams, { replace: true })
  }, [searchParams, setSearchParams])

  const resetFilters = useCallback(() => {
    // Mantenemos el tab actual si existe, borramos el resto
    const tab = searchParams.get('tab')
    setSearchParams(tab ? { tab } : {}, { replace: true })
  }, [searchParams, setSearchParams])

  const activeFilterCount = useMemo(() =>
    Object.entries(filters).filter(([key, v]) =>
      key === 'search' ? v !== '' : v !== 'all',
    ).length
  , [filters])

  const conteoUrgente = grupos.requierenAtencion.length

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
    total:   actividadesFiltradas.length,
  }
}