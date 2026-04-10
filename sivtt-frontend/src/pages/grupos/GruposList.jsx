import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom' // ✅ Importamos hook de URL
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@components/ui/select'
import { Search, Plus, Users, SlidersHorizontal } from 'lucide-react'
import { GrupoCard } from './components/GrupoCard'
import { CrearGrupoModal } from './modals/CrearGrupoModal'
import { Pagination } from '@components/common/Pagination'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { EmptyState } from '@components/common/EmptyState'
import { gruposAPI } from '@api/endpoints/grupos'
import { toast } from 'sonner' // ✅ Migrado a Sonner

// ✅ Importación del hook de seguridad
import { useAuth } from '@hooks/useAuth'

export const GruposList = () => {
  const [loading, setLoading]           = useState(true)
  const [grupos, setGrupos]             = useState([])
  const [pagination, setPagination]     = useState(null)
  const [crearModalOpen, setCrearModalOpen] = useState(false)

  // ✅ Conectamos los filtros a la URL
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = {
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    search: searchParams.get('search') || '',
    activo: searchParams.get('activo') || 'Todos',
    lineaInvestigacion: searchParams.get('lineaInvestigacion') || 'Todos'
  }

  // ✅ Validación de Seguridad
  const { can } = useAuth()
  const canManageGrupos = can('gestionar:grupos')

  // ✅ Centralizamos la lógica de actualización de la URL
  const updateURLFilters = (newFilters) => {
    const currentParams = Object.fromEntries(searchParams.entries())
    
    const updatedParams = {
      ...currentParams,
      ...newFilters,
      // Si el filtro no es 'page', reseteamos a la página 1
      page: newFilters.page !== undefined ? newFilters.page : 1
    }

    // Limpiamos los valores vacíos o por defecto de la URL
    Object.keys(updatedParams).forEach(key => {
      if (updatedParams[key] === '' || updatedParams[key] === undefined || updatedParams[key] === 'Todos') {
        delete updatedParams[key]
      }
    })

    setSearchParams(updatedParams, { replace: true })
  }

  // ✅ Usamos useCallback para que React no reconstruya la función en cada render
  const fetchGrupos = useCallback(async () => {
    setLoading(true)
    try {
      const cleanFilters = {
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        activo: filters.activo !== 'Todos' ? filters.activo : undefined,
        lineaInvestigacion: filters.lineaInvestigacion !== 'Todos' ? filters.lineaInvestigacion : undefined
      }

      const { data } = await gruposAPI.list(cleanFilters)
      setGrupos(data.data.grupos || [])
      setPagination(data.data.pagination || null)
    } catch (error) {
      toast.error('Error', { 
        description: error.response?.data?.message || 'Error inesperado' 
      })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.search, filters.activo, filters.lineaInvestigacion])

  useEffect(() => { 
    fetchGrupos() 
  }, [fetchGrupos])

  const handleFilterChange = (field, value) => {
    updateURLFilters({ [field]: value })
  }

  const handlePageChange = (newPage) => {
    updateURLFilters({ page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const hasFilters = filters.search || filters.activo !== 'Todos' || filters.lineaInvestigacion !== 'Todos'

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg shrink-0">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Grupos de Investigación</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona los grupos que postulan a convocatorias</p>
          </div>
        </div>

        {/* ✅ Botón oculto si no tiene permiso */}
        {canManageGrupos && (
          <Button onClick={() => setCrearModalOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Nuevo Grupo
          </Button>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-1">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Filtrar:</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input 
              value={filters.search} 
              onChange={(e) => handleFilterChange('search', e.target.value)} 
              placeholder="Buscar por nombre o código..." 
              className="pl-9 h-9 text-sm w-[220px]" 
            />
          </div>
          <Select 
            value={filters.activo} 
            onValueChange={(value) => handleFilterChange('activo', value)}
          >
            <SelectTrigger className="w-[170px] h-9 text-sm">
              <SelectValue placeholder="Todos los grupos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los grupos</SelectItem>
              <SelectItem value="true">Activos</SelectItem>
              <SelectItem value="false">Inactivos</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.lineaInvestigacion} 
            onValueChange={(value) => handleFilterChange('lineaInvestigacion', value)}
          >
            <SelectTrigger className="w-[190px] h-9 text-sm">
              <SelectValue placeholder="Todas las líneas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todas las líneas</SelectItem>
              <SelectItem value="Inteligencia Artificial">Inteligencia Artificial</SelectItem>
              <SelectItem value="Biotecnología">Biotecnología</SelectItem>
              <SelectItem value="Energías Renovables">Energías Renovables</SelectItem>
              <SelectItem value="Nanotecnología">Nanotecnología</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="py-20"><LoadingSpinner /></div>
      ) : grupos.length === 0 ? (
        <EmptyState
          title="No se encontraron grupos"
          description={hasFilters ? "Intenta ajustar los filtros de búsqueda" : "Aún no hay grupos registrados"}
          action={hasFilters ? handleResetFilters : (canManageGrupos ? () => setCrearModalOpen(true) : undefined)}
          actionLabel={hasFilters ? "Limpiar filtros" : "Crear primer grupo"}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grupos.map((grupo) => (
              <GrupoCard
                key={grupo.id}
                grupo={grupo}
                onUpdate={fetchGrupos}
                canManage={canManageGrupos}
              />
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}

      {/* ✅ Modal protegido en el DOM */}
      {canManageGrupos && (
        <CrearGrupoModal
          open={crearModalOpen}
          onOpenChange={setCrearModalOpen}
          onSuccess={() => { setCrearModalOpen(false); fetchGrupos() }}
        />
      )}
    </div>
  )
}