import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Search, Megaphone, X } from 'lucide-react'
import { ConvocatoriaCard } from './components/ConvocatoriaCard'
import { Pagination } from '@components/common/Pagination'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { EmptyState } from '@components/common/EmptyState'
import { convocatoriasAPI } from '@api/endpoints/convocatorias'
import { toast } from '@components/ui/use-toast'

export const ConvocatoriasList = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [convocatorias, setConvocatorias] = useState([])
  const [pagination, setPagination] = useState(null)

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '', // En backend no implementaste search global en list, verifica si es necesario o filtrar por front
    estatus: 'Todos' // Cambiado de 'estado' a 'estatus' para coincidir con backend
  })

  useEffect(() => {
    fetchConvocatorias()
  }, [filters.page, filters.estatus]) // Search suele manejarse con debounce, o enter

  const fetchConvocatorias = async () => {
    setLoading(true)
    try {
      const cleanFilters = {
        page: filters.page,
        limit: filters.limit,
        estatus: filters.estatus !== 'Todos' ? filters.estatus : undefined
        // Backend no tiene 'search' en query schema aun, si lo agregaste úsalo
      }
      
      const { data } = await convocatoriasAPI.list(cleanFilters)
      setConvocatorias(data.data.convocatorias || [])
      setPagination(data.data.pagination || null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cargar convocatorias",
        description: error.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="space-y-6 fade-in animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-blue-600" />
            Convocatorias
          </h1>
          <p className="text-gray-500 mt-1">
            Gestión centralizada de todas las convocatorias del sistema.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search (Visual por ahora si backend no soporta) */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar por código..."
              className="pl-10"
            />
          </div>

          {/* Estatus */}
          <Select
            value={filters.estatus}
            onValueChange={(value) => handleFilterChange('estatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los estados</SelectItem>
              <SelectItem value="BORRADOR">📝 Borrador</SelectItem>
              <SelectItem value="PUBLICADA">🚀 Publicada</SelectItem>
              <SelectItem value="CERRADA">🔒 Cerrada</SelectItem>
              <SelectItem value="CANCELADA">❌ Cancelada</SelectItem>
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
          action={() => setFilters({ page: 1, limit: 12, search: '', estatus: 'Todos' })}
          actionLabel="Limpiar filtros"
        />
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {convocatorias.map((convocatoria) => (
              <ConvocatoriaCard
                key={convocatoria.id}
                convocatoria={convocatoria}
                onClick={() => navigate(`/convocatorias/${convocatoria.id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}