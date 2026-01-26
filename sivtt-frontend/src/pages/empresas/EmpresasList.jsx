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
import { Search, Plus, Building2 } from 'lucide-react'
import { EmpresaCard } from './components/EmpresaCard'
import { CrearEmpresaModal } from './modals/CrearEmpresaModal'
import { Pagination } from '@components/common/Pagination'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { EmptyState } from '@components/common/EmptyState'
import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from '@components/ui/use-toast'

// Opciones basadas en la data de tu backend (Mayúsculas para coincidir con BD)
const SECTOR_OPTIONS = [
  { value: 'TECNOLOGIA', label: 'Tecnología' },
  { value: 'MANUFACTURA', label: 'Manufactura' },
  { value: 'AGROINDUSTRIA', label: 'Agroindustria' },
  { value: 'AGRICULTURA', label: 'Agricultura' }, // Agregado según tu API response
  { value: 'MINERIA', label: 'Minería' },       // Agregado según tu API response
  { value: 'SALUD', label: 'Salud' },
  { value: 'EDUCACION', label: 'Educación' },
  { value: 'CONSTRUCCION', label: 'Construcción' },
  { value: 'OTRO', label: 'Otro' }
]

export const EmpresasList = () => {
  const [loading, setLoading] = useState(true)
  const [empresas, setEmpresas] = useState([])
  const [pagination, setPagination] = useState(null)
  const [crearModalOpen, setCrearModalOpen] = useState(false)

  // Inicializamos con undefined para que los Select muestren el placeholder/valor por defecto correctamente
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    verificada: undefined, 
    sector: undefined
  })

  useEffect(() => {
    fetchEmpresas()
  }, [filters])

  const fetchEmpresas = async () => {
    setLoading(true)
    try {
      // 1. Limpieza robusta de filtros para evitar enviar "undefined", null o cadenas vacías
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => 
          value !== '' && value !== null && value !== undefined
        )
      )
      
      const { data } = await empresasAPI.list(cleanFilters)
      
      // La respuesta de tu API es data.data.empresas
      setEmpresas(data.data.empresas || [])
      setPagination(data.data.pagination || null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cargar empresas",
        description: error.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }

  // 2. Manejador de cambios mejorado para selectores
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      // Si seleccionan 'ALL', ponemos undefined para que cleanFilters lo elimine
      [field]: value === 'ALL' ? undefined : value,
      page: 1 // Reseteamos a página 1 al filtrar
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-blue-600" />
            Empresas
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona el catálogo de empresas del sistema
          </p>
        </div>

        <Button
          onClick={() => setCrearModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search: Razón Social, RUC, Nombre Comercial */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar por nombre o RUC..."
              className="pl-10"
            />
          </div>

          {/* Filtro Verificada */}
          <Select
            value={filters.verificada === undefined ? 'ALL' : filters.verificada}
            onValueChange={(value) => handleFilterChange('verificada', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado de verificación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las empresas</SelectItem>
              {/* El backend espera string 'true' o 'false' */}
              <SelectItem value="true">✅ Verificadas</SelectItem>
              <SelectItem value="false">⏳ Pendientes</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro Sector */}
          <Select
            value={filters.sector === undefined ? 'ALL' : filters.sector}
            onValueChange={(value) => handleFilterChange('sector', value)}
          >
            <SelectTrigger>
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
          action={() => setCrearModalOpen(true)}
          actionLabel="Crear primera empresa"
        />
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empresas.map((empresa) => (
              <EmpresaCard
                key={empresa.id}
                empresa={empresa}
                onUpdate={fetchEmpresas}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Modal */}
      <CrearEmpresaModal
        open={crearModalOpen}
        onOpenChange={setCrearModalOpen}
        onSuccess={() => {
          setCrearModalOpen(false)
          fetchEmpresas()
        }}
      />
    </div>
  )
}