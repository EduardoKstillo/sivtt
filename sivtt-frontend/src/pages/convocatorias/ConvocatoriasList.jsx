import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom' // ✅ Importamos useSearchParams
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Search, Megaphone, SlidersHorizontal } from 'lucide-react'
import { ConvocatoriaCard } from './components/ConvocatoriaCard'
import { Pagination } from '@components/common/Pagination'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { EmptyState } from '@components/common/EmptyState'
import { convocatoriasAPI } from '@api/endpoints/convocatorias'
import { toast } from 'sonner' // ✅ Migrado a Sonner

export const ConvocatoriasList = () => {
  const navigate = useNavigate()
  const [loading, setLoading]             = useState(true)
  const [convocatorias, setConvocatorias] = useState([])
  const [pagination, setPagination]       = useState(null)

  // ✅ Conectamos los filtros a la URL
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = {
    page:    parseInt(searchParams.get('page')) || 1,
    limit:   12,
    search:  searchParams.get('search') || '',
    estatus: searchParams.get('estatus') || 'Todos'
  }

  // ✅ Usamos useCallback para evitar renderizados infinitos
  const fetchConvocatorias = useCallback(async () => {
    setLoading(true)
    try {
      const cleanFilters = {
        page:    filters.page,
        limit:   filters.limit,
        search:  filters.search || undefined, // ✅ Agregado el parámetro de búsqueda a la API
        estatus: filters.estatus !== 'Todos' ? filters.estatus : undefined
      }
      const { data } = await convocatoriasAPI.list(cleanFilters)
      setConvocatorias(data.data.convocatorias || [])
      setPagination(data.data.pagination || null)
    } catch (error) {
      toast.error('Error al cargar convocatorias', { // ✅ Sintaxis Sonner
        description: error.response?.data?.message || 'Error inesperado'
      })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.search, filters.estatus]) // ✅ Dependencias correctas

  useEffect(() => {
    fetchConvocatorias()
  }, [fetchConvocatorias])

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

  const handleFilterChange = (field, value) => {
    updateURLFilters({ [field]: value })
  }

  const handlePageChange = (newPage) => {
    updateURLFilters({ page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' }) // ✅ Subir el scroll suavemente al cambiar de página
  }

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="space-y-6 fade-in animate-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg shrink-0">
          <Megaphone className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Convocatorias</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión centralizada de todas las convocatorias del sistema.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">

          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-1">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Filtrar:</span>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar por código..."
              className="pl-9 h-9 text-sm w-[220px]"
            />
          </div>

          {/* Estatus */}
          <Select
            value={filters.estatus}
            onValueChange={(value) => handleFilterChange('estatus', value)}
          >
            <SelectTrigger className="w-[170px] h-9 text-sm">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los estados</SelectItem>
              <SelectItem value="BORRADOR">Borrador</SelectItem>
              <SelectItem value="PUBLICADA">Publicada</SelectItem>
              <SelectItem value="CERRADA">Cerrada</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20"><LoadingSpinner /></div>
      ) : convocatorias.length === 0 ? (
        <EmptyState
          title="No se encontraron convocatorias"
          description="No hay convocatorias que coincidan con los filtros seleccionados."
          icon={Megaphone}
          action={handleResetFilters} // ✅ Limpiar desde URL
          actionLabel="Limpiar filtros"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {convocatorias.map((convocatoria) => (
              <ConvocatoriaCard
                key={convocatoria.id}
                convocatoria={convocatoria}
                onClick={() => navigate(`/convocatorias/${convocatoria.id}`)}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  )
}