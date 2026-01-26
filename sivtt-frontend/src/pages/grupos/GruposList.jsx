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
import { Search, Plus, Users } from 'lucide-react'
import { GrupoCard } from './components/GrupoCard'
import { CrearGrupoModal } from './modals/CrearGrupoModal'
import { Pagination } from '@components/common/Pagination'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { EmptyState } from '@components/common/EmptyState'
import { gruposAPI } from '@api/endpoints/grupos'
import { toast } from '@components/ui/use-toast'

export const GruposList = () => {
  const [loading, setLoading] = useState(true)
  const [grupos, setGrupos] = useState([])
  const [pagination, setPagination] = useState(null)
  const [crearModalOpen, setCrearModalOpen] = useState(false)

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    activo: '',
    lineaInvestigacion: ''
  })

  useEffect(() => {
    fetchGrupos()
  }, [filters])

  const fetchGrupos = async () => {
    setLoading(true)
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      )
      
      const { data } = await gruposAPI.list(cleanFilters)
      setGrupos(data.data.grupos || [])
      setPagination(data.data.pagination || null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cargar grupos",
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
            <Users className="h-7 w-7 text-purple-600" />
            Grupos de Investigación
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona los grupos que postulan a convocatorias
          </p>
        </div>

        <Button
          onClick={() => setCrearModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Grupo
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="pl-10"
            />
          </div>

          {/* Estado */}
          <Select
            value={filters.activo}
            onValueChange={(value) => handleFilterChange('activo', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los grupos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los grupos</SelectItem>
              <SelectItem value="true">✅ Activos</SelectItem>
              <SelectItem value="false">❌ Inactivos</SelectItem>
            </SelectContent>
          </Select>

          {/* Línea de Investigación */}
          <Select
            value={filters.lineaInvestigacion}
            onValueChange={(value) => handleFilterChange('lineaInvestigacion', value)}
          >
            <SelectTrigger>
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

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : grupos.length === 0 ? (
        <EmptyState
          title="No se encontraron grupos"
          description="Intenta ajustar los filtros de búsqueda"
          action={() => setCrearModalOpen(true)}
          actionLabel="Crear primer grupo"
        />
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grupos.map((grupo) => (
              <GrupoCard
                key={grupo.id}
                grupo={grupo}
                onUpdate={fetchGrupos}
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
      <CrearGrupoModal
        open={crearModalOpen}
        onOpenChange={setCrearModalOpen}
        onSuccess={() => {
          setCrearModalOpen(false)
          fetchGrupos()
        }}
      />
    </div>
  )
}