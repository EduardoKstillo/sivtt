import { useState, useEffect } from 'react'
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
import { toast } from '@components/ui/use-toast'

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

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    verificada: undefined,
    sector: undefined
  })

  // ✅ Validar permiso global para gestionar el catálogo
  const { can } = useAuth()
  const canManageCatalogo = can('gestionar:empresas')

  useEffect(() => {
    fetchEmpresas()
  }, [filters])

  const fetchEmpresas = async () => {
    setLoading(true)
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) =>
          value !== '' && value !== null && value !== undefined
        )
      )
      const { data } = await empresasAPI.list(cleanFilters)
      setEmpresas(data.data.empresas || [])
      setPagination(data.data.pagination || null)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar empresas',
        description: error.response?.data?.message || 'Error inesperado'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === 'ALL' ? undefined : value,
      page: 1
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="space-y-6">

      {/* Header — patrón idéntico a EvidenciasTab */}
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

        {/* ✅ Botón oculto si no tiene permiso */}
        {canManageCatalogo && (
          <Button onClick={() => setCrearModalOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nueva Empresa
          </Button>
        )}
      </div>

      {/* Filters — patrón flex-wrap de ActividadesFilters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">

          {/* Icono filtrar */}
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
              placeholder="Buscar por nombre o RUC..."
              className="pl-9 h-9 text-sm w-[220px]"
            />
          </div>

          {/* Verificación */}
          <Select
            value={filters.verificada === undefined ? 'ALL' : String(filters.verificada)}
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

          {/* Sector */}
          <Select
            value={filters.sector === undefined ? 'ALL' : filters.sector}
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

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : empresas.length === 0 ? (
        <EmptyState
          title="No se encontraron empresas"
          description="Intenta ajustar los filtros de búsqueda"
          action={canManageCatalogo ? () => setCrearModalOpen(true) : undefined}
          actionLabel="Crear primera empresa"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empresas.map((empresa) => (
              <EmpresaCard
                key={empresa.id}
                empresa={empresa}
                onUpdate={fetchEmpresas}
                // ✅ Pasamos el permiso a la tarjeta
                canManage={canManageCatalogo}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}

      {/* Modal protegido */}
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