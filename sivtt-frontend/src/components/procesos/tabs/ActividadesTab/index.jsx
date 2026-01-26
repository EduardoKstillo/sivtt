import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Plus } from 'lucide-react'
import { ActividadCard } from './ActividadCard'
import { ActividadDrawer } from './ActividadDrawer' 
import { ActividadesFilters } from './ActividadesFilters'
import { CrearActividadModal } from './modals/CrearActividadModal'
import { Pagination } from '@components/common/Pagination'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { EmptyState } from '@components/common/EmptyState'
import { useActividades } from '@hooks/useActividades'
import { Skeleton } from '@components/ui/skeleton'

export const ActividadesTab = ({ proceso, onUpdate }) => {
  const [selectedActividad, setSelectedActividad] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const {
    actividades,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch
  } = useActividades(proceso.id)

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage })
  }

  // ✅ Validar correctamente si hay filtros activos (ignorando los default)
  const hasFilters = 
    (filters.fase && filters.fase !== 'Todas') || 
    (filters.estado && filters.estado !== 'Todos') || 
    (filters.tipo && filters.tipo !== 'Todos') || 
    filters.responsableId

  return (
    <div className="space-y-6 fade-in animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Tablero de Actividades
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestión detallada de tareas, documentos y reuniones
          </p>
        </div>

        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Actividad
        </Button>
      </div>

      {/* Filters */}
      <ActividadesFilters
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
        proceso={proceso}
      />

      {/* Content */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Error al cargar actividades"
          message={error.response?.data?.message}
          onRetry={refetch}
        />
      ) : actividades.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No se encontraron resultados" : "No hay actividades registradas"}
          description={
            hasFilters
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza creando la primera actividad para esta fase"
          }
          action={hasFilters ? resetFilters : () => setCreateModalOpen(true)}
          actionLabel={hasFilters ? "Limpiar filtros" : "Crear actividad"}
        />
      ) : (
        <>
          {/* Lista */}
          <div className="space-y-3">
            {actividades.map((actividad) => (
              <ActividadCard
                key={actividad.id}
                actividad={actividad}
                onClick={() => setSelectedActividad(actividad)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Modals y Drawers */}
      <CrearActividadModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        proceso={proceso}
        onSuccess={() => {
          setCreateModalOpen(false)
          refetch()
          onUpdate() // Actualizar contadores del proceso padre
        }}
      />

      {/* Drawer Detalle (Solo renderizar si hay seleccionada) */}
      {selectedActividad && (
        <ActividadDrawer
          actividadId={selectedActividad.id}
          open={!!selectedActividad}
          onClose={() => {
            setSelectedActividad(null)
            refetch() // Refrescar lista al cerrar por si hubo cambios
          }}
          proceso={proceso}
        />
      )}
    </div>
  )
}