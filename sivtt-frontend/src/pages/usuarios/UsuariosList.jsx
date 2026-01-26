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
import { Search, Plus, Users, LayoutGrid, List } from 'lucide-react'
import { UsuarioCard } from './components/UsuarioCard'
import { UsuarioTableRow } from './components/UsuarioTableRow'
import { CrearUsuarioModal } from './modals/CrearUsuarioModal'
import { Pagination } from '@components/common/Pagination'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { EmptyState } from '@components/common/EmptyState'
import { usersAPI } from '@api/endpoints/users'
import { toast } from '@components/ui/use-toast'
import { ROL_SISTEMA } from '@utils/constants'

export const UsuariosList = () => {
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState([])
  const [pagination, setPagination] = useState(null)
  const [crearModalOpen, setCrearModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState('table') // 'table' o 'cards'

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    activo: undefined,
    roles: undefined
  })

  const ROLES_SISTEMA_OPTIONS = [
    { value: ROL_SISTEMA.ADMIN_SISTEMA, label: '👑 Administrador del sistema' },
    { value: ROL_SISTEMA.GESTOR_VINCULACION, label: '🔗 Gestor de vinculación' },
    { value: ROL_SISTEMA.RESPONSABLE_FASE, label: '📍 Responsable de fase' },
    { value: ROL_SISTEMA.EVALUADOR, label: '📝 Evaluador' },
    { value: ROL_SISTEMA.REVISOR, label: '🔍 Revisor' },
    { value: ROL_SISTEMA.INVESTIGADOR, label: '🔬 Investigador' },
    { value: ROL_SISTEMA.EMPRESA, label: '🏢 Empresa' },
    { value: ROL_SISTEMA.OBSERVADOR, label: '👁️ Observador' }
  ]

  useEffect(() => {
    fetchUsuarios()
  }, [filters])

  const fetchUsuarios = async () => {
    setLoading(true)
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== '' && value !== null && value !== undefined
        )
      )

      const { data } = await usersAPI.list(cleanFilters)

      setUsuarios(data.data.usuarios || [])
      setPagination(data.data.pagination || null)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar usuarios',
        description: error.response?.data?.message || 'Error inesperado'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => {
      const newValue = value === 'ALL' ? undefined : value;

      return {
        ...prev,
        [field]: newValue,
        page: 1
      };
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-600" />
            Usuarios
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona los usuarios del sistema
          </p>
        </div>

        <Button
          onClick={() => setCrearModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
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
              placeholder="Buscar por nombre o email..."
              className="pl-10"
            />
          </div>

          {/* Estado */}
          <Select
            value={filters.activo !== undefined ? String(filters.activo) : 'ALL'}
            onValueChange={(value) => handleFilterChange('activo', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="true">✅ Activos</SelectItem>
              <SelectItem value="false">❌ Inactivos</SelectItem>
            </SelectContent>
          </Select>

          {/* Roles */}
          <Select
            value={filters.roles || 'ALL'}
            onValueChange={(value) => handleFilterChange('roles', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {ROLES_SISTEMA_OPTIONS.map(rol => (
                <SelectItem key={rol.value} value={rol.value}>
                  {rol.label}
                </SelectItem>
              ))}
              <SelectItem value="ADMIN_SISTEMA,GESTOR_VINCULACION">
                👑 + 🔗 Admin / Gestor
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{usuarios.length}</span> usuarios
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-indigo-600' : ''}
            >
              <List className="h-4 w-4 mr-2" />
              Tabla
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className={viewMode === 'cards' ? 'bg-indigo-600' : ''}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Cards
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : usuarios.length === 0 ? (
        <EmptyState
          title="No se encontraron usuarios"
          description="Intenta ajustar los filtros de búsqueda"
          action={() => setCrearModalOpen(true)}
          actionLabel="Crear usuario"
        />
      ) : (
        <>
          {/* Vista Tabla */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Roles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Procesos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usuarios.map(usuario => (
                      <UsuarioTableRow
                        key={usuario.id}
                        usuario={usuario}
                        onUpdate={fetchUsuarios}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vista Cards */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usuarios.map(usuario => (
                <UsuarioCard
                  key={usuario.id}
                  usuario={usuario}
                  onUpdate={fetchUsuarios}
                />
              ))}
            </div>
          )}

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
      <CrearUsuarioModal
        open={crearModalOpen}
        onOpenChange={setCrearModalOpen}
        onSuccess={() => {
          setCrearModalOpen(false)
          fetchUsuarios()
        }}
      />
    </div>
  )
}