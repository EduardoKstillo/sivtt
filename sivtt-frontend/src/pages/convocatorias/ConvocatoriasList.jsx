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
import { Search, Megaphone } from 'lucide-react'
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
    search: '',
    estado: ''
  })

  useEffect(() => {
    fetchConvocatorias()
  }, [filters])

  const fetchConvocatorias = async () => {
    setLoading(true)
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      )
      
      // Nota: Aquí se llama a un endpoint global de convocatorias
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-orange-600" />
            Convocatorias
          </h1>
          <p className="text-gray-500 mt-1">
            Explora todas las convocatorias activas e históricas
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar por código o proceso..."
              className="pl-10"
            />
          </div>

          {/* Estado */}
          <Select
            value={filters.estado}
            onValueChange={(value) => handleFilterChange('estado', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las convocatorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todas las convocatorias</SelectItem>
              <SelectItem value="ABIERTA">🟢 Abiertas</SelectItem>
              <SelectItem value="CERRADA">⚫ Cerradas</SelectItem>
              <SelectItem value="CANCELADA">🔴 Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : convocatorias.length === 0 ? (
        <EmptyState
          title="No se encontraron convocatorias"
          description="Intenta ajustar los filtros de búsqueda"
        />
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  )
}