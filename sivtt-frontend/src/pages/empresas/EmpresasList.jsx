import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom' // ✅ Importamos el hook de URL
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Search, Plus, Building2, SlidersHorizontal } from 'lucide-react'
import { EmpresaCard } from './components/EmpresaCard'
import { CrearEmpresaModal } from './modals/CrearEmpresaModal'
import { Pagination } from '@components/common/Pagination'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { EmptyState } from '@components/common/EmptyState'
import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from 'sonner' // ✅ Migrado a Sonner

// ✅ Importaciones de Seguridad Global
import { useAuth } from '@hooks/useAuth'
import { PERMISOS } from '@utils/permissions'

const SECTOR_OPTIONS = [
  { value: 'TECNOLOGIA',   label: 'Tecnología'    },
  { value: 'MANUFACTURA',  label: 'Manufactura'   },
  { value: 'AGROINDUSTRIA',label: 'Agroindustria' },
  { value: 'AGRICULTURA',  label: 'Agricultura'   },
  { value: 'MINERIA',      label: 'Minería'       },
  { value: 'SALUD',        label: 'Salud'         },
  { value: 'EDUCACION',    label: 'Educación'     },
  { value: 'CONSTRUCCION', label: 'Construcción'  },
  { value: 'OTRO',         label: 'Otro'          }
]

export const EmpresasList = () => {
  const [loading, setLoading]           = useState(true)
  const [empresas, setEmpresas]         = useState([])
  const [pagination, setPagination]     = useState(null)
  const [crearModalOpen, setCrearModalOpen] = useState(false)

  // ✅ 1. Conectamos los filtros a la URL
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = {
    page:       parseInt(searchParams.get('page')) || 1,
    limit:      12,
    search:     searchParams.get('search') || '',
    verificada: searchParams.get('verificada') || 'ALL',
    sector:     searchParams.get('sector') || 'ALL'
  }

  const { can } = useAuth()
  const canManageCatalogo = can('gestionar:empresas')

  // ✅ 2. Centralizamos la lógica de actualización de la URL
  const updateURLFilters = (newFilters) => {
    const currentParams = Object.fromEntries(searchParams.entries())
    
    const updatedParams = {
      ...currentParams,
      ...newFilters,
      // Si se cambia cualquier filtro que no sea la página, regresamos a la pag 1
      page: newFilters.page !== undefined ? newFilters.page : 1
    }

    // Limpiamos los valores vacíos o por defecto de la URL para que quede limpia
    Object.keys(updatedParams).forEach(key => {
      if (updatedParams[key] === '' || updatedParams[key] === undefined || updatedParams[key] === 'ALL') {
        delete updatedParams[key]
      }
    })

    setSearchParams(updatedParams, { replace: true })
  }

  // ✅ 3. Usamos useCallback para que React no la reconstruya en cada renderizado
  const fetchEmpresas = useCallback(async () => {
    setLoading(true)
    try {
      const cleanFilters = {
        page:       filters.page,
        limit:      filters.limit,
        search:     filters.search || undefined,
        verificada: filters.verificada !== 'ALL' ? filters.verificada : undefined,
        sector:     filters.sector !== 'ALL' ? filters.sector : undefined
      }
      const { data } = await empresasAPI.list(cleanFilters)
      setEmpresas(data.data.empresas || [])
      setPagination(data.data.pagination || null)
    } catch (error) {
      toast.error('Error al cargar empresas', {
        description: error.response?.data?.message || 'Error inesperado'
      })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.search, filters.verificada, filters.sector])

  useEffect(() => {
    fetchEmpresas()
  }, [fetchEmpresas])

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

  const hasFilters = filters.search || filters.verificada !== 'ALL' || filters.sector !== 'ALL'

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg shrink-0">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Catálogo de Empresas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona el directorio global de aliados estratégicos
            </p>
          </div>
        </div>

        {canManageCatalogo && (
          <Button onClick={() => setCrearModalOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nueva Empresa
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
              placeholder="Buscar por nombre o RUC..."
              className="pl-9 h-9 text-sm w-[220px]"
            />
          </div>

          <Select
            value={filters.verificada}
            onValueChange={(value) => handleFilterChange('verificada', value)}
          >
            <SelectTrigger className="w-[170px] h-9 text-sm">
              <SelectValue placeholder="Verificación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las empresas</SelectItem>
              <SelectItem value="true">Verificadas</SelectItem>
              <SelectItem value="false">Pendientes</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sector}
            onValueChange={(value) => handleFilterChange('sector', value)}
          >
            <SelectTrigger className="w-[170px] h-9 text-sm">
              <SelectValue placeholder="Todos los sectores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los sectores</SelectItem>
              {SECTOR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : empresas.length === 0 ? (
        <EmptyState
          title="No se encontraron empresas"
          description={hasFilters ? "Intenta ajustar los filtros de búsqueda" : "Aún no hay empresas registradas en el catálogo"}
          action={hasFilters ? handleResetFilters : (canManageCatalogo ? () => setCrearModalOpen(true) : undefined)}
          actionLabel={hasFilters ? "Limpiar filtros" : "Crear primera empresa"}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empresas.map((empresa) => (
              <EmpresaCard
                key={empresa.id}
                empresa={empresa}
                onUpdate={fetchEmpresas}
                canManage={canManageCatalogo}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}

      {canManageCatalogo && (
        <CrearEmpresaModal
          open={crearModalOpen}
          onOpenChange={setCrearModalOpen}
          onSuccess={() => {
            setCrearModalOpen(false)
            fetchEmpresas()
          }}
        />
      )}
    </div>
  )
}