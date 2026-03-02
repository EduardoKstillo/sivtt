import { useState, useEffect, useCallback } from 'react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@components/ui/select'
import { Badge } from '@components/ui/badge'
import { Skeleton } from '@components/ui/skeleton'
import { Search, Plus, Users, LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { UsuarioCard } from './components/UsuarioCard'
import { UsuarioTableRow } from './components/UsuarioTableRow'
import { CrearUsuarioModal } from './modals/CrearUsuarioModal'
import { Pagination } from '@components/common/Pagination'
import { EmptyState } from '@components/common/EmptyState'
import { ErrorState } from '@components/common/ErrorState'
import { usersAPI } from '@api/endpoints/users'
import { rolesAPI } from '@api/endpoints/roles'
import { useAuth } from '@hooks/useAuth'
import { PERMISOS } from '@utils/permissions'
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

export const UsuariosList = () => {
  const [loading, setLoading]           = useState(true)
  const [usuarios, setUsuarios]         = useState([])
  const [pagination, setPagination]     = useState(null)
  const [rolesDisponibles, setRoles]    = useState([])
  const [crearModalOpen, setCrearModal] = useState(false)
  const [viewMode, setViewMode]         = useState('table')
  const [error, setError]               = useState(null)

  const { can } = useAuth()
  const canCreate = can(PERMISOS.GESTIONAR_USUARIOS)

  const [filters, setFilters] = useState({
    page:   1,
    limit:  12,
    search: '',
    activo: undefined,
    rol:    undefined
  })

  // ─── Cargar roles de sistema dinámicamente ───────────────
  useEffect(() => {
    rolesAPI.listByAmbito('SISTEMA')
      .then(res => setRoles(res.data.data || []))
      .catch(() => {})
  }, [])

  const fetchUsuarios = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const clean = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )
      const { data } = await usersAPI.list(clean)
      setUsuarios(data.data.usuarios || [])
      setPagination(data.data.pagination || null)
    } catch (err) {
      setError(err)
      toast({
        variant: 'destructive',
        title: 'Error al cargar usuarios',
        description: err.response?.data?.message || 'Error inesperado'
      })
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchUsuarios() }, [fetchUsuarios])

  const handleFilter = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === 'ALL' ? undefined : value,
      page: 1
    }))
  }

  const activeFilters = [filters.search, filters.activo, filters.rol].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            Usuarios
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Administra cuentas y roles del sistema
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => setCrearModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={filters.search || ''}
              onChange={e => handleFilter('search', e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="pl-10"
            />
          </div>

          {/* Estado */}
          <Select
            value={filters.activo !== undefined ? String(filters.activo) : 'ALL'}
            onValueChange={v => handleFilter('activo', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="true">Activos</SelectItem>
              <SelectItem value="false">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          {/* Rol — dinámico desde la API */}
          <Select
            value={filters.rol || 'ALL'}
            onValueChange={v => handleFilter('rol', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los roles</SelectItem>
              {rolesDisponibles.map(rol => (
                <SelectItem key={rol.id} value={rol.codigo}>
                  {rol.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-24 inline-block" />
              ) : (
                <>
                  <span className="font-semibold text-foreground tabular-nums">
                    {pagination?.total ?? usuarios.length}
                  </span>{' '}
                  usuario{(pagination?.total ?? usuarios.length) !== 1 && 's'}
                </>
              )}
            </span>
            {activeFilters > 0 && (
              <Badge variant="secondary" className="text-[11px] gap-1">
                <SlidersHorizontal className="h-3 w-3" />
                {activeFilters} filtro{activeFilters !== 1 && 's'}
              </Badge>
            )}
          </div>

          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            {[
              { mode: 'table', Icon: List },
              { mode: 'cards', Icon: LayoutGrid }
            ].map(({ mode, Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'h-7 w-7 rounded-md flex items-center justify-center transition-colors',
                  viewMode === mode
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      {loading ? (
        viewMode === 'table' ? (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        )
      ) : error ? (
        <ErrorState
          title="Error al cargar usuarios"
          message={error.response?.data?.message || 'Error inesperado'}
          onRetry={fetchUsuarios}
        />
      ) : usuarios.length === 0 ? (
        <EmptyState
          title="No se encontraron usuarios"
          description={
            activeFilters
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando el primer usuario'
          }
          action={canCreate && !activeFilters ? () => setCrearModal(true) : undefined}
          actionLabel="Crear usuario"
        />
      ) : (
        <>
          {/* Table view */}
          {viewMode === 'table' && (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      {['Usuario', 'Roles', 'Estado', 'Procesos', ''].map(h => (
                        <th
                          key={h}
                          className={cn(
                            'px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                            h === '' ? 'text-right' : 'text-left'
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {usuarios.map(u => (
                      <UsuarioTableRow key={u.id} usuario={u} onUpdate={fetchUsuarios} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cards view */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usuarios.map(u => (
                <UsuarioCard key={u.id} usuario={u} onUpdate={fetchUsuarios} />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              onPageChange={p => setFilters(prev => ({ ...prev, page: p }))}
            />
          )}
        </>
      )}

      <CrearUsuarioModal
        open={crearModalOpen}
        onOpenChange={setCrearModal}
        onSuccess={() => { setCrearModal(false); fetchUsuarios() }}
      />
    </div>
  )
}