import { useState } from 'react'
import { Plus, Grid3x3, List } from 'lucide-react'
import { Button } from '@components/ui/button'
import { ProcesoCard } from '@components/procesos/ProcesoCard'
import { ProcesoTable } from '@components/procesos/ProcesoTable'
import { ProcesoFilters } from '@components/procesos/ProcesoFilters'
import { ProcesoWizard } from '@components/procesos/ProcesoWizard'
import { Pagination } from '@components/common/Pagination'
import { ErrorState } from '@components/common/ErrorState'
import { EmptyState } from '@components/common/EmptyState'
import { useProcesos } from '@hooks/useProcesos'
import { cn } from '@/lib/utils'
import { Skeleton } from '@components/ui/skeleton'

export default function ProcesosList() {
  const [viewMode, setViewMode] = useState('grid')
  const [wizardOpen, setWizardOpen] = useState(false)

  const {
    procesos,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch
  } = useProcesos()

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasFilters =
    filters.search ||
    filters.tipoActivo ||
    filters.estado ||
    filters.faseActual

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Procesos de Vinculación
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona los procesos de transferencia tecnológica
          </p>
        </div>

        <Button
          className="bg-gradient-to-r from-blue-600 to-purple-600"
          onClick={() => setWizardOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proceso
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <ProcesoFilters
          filters={filters}
          onFilterChange={updateFilters}
          onReset={resetFilters}
        />
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {pagination && (
            <>
              <span className="font-semibold text-gray-900">
                {pagination.total}
              </span>{' '}
              proceso{pagination.total !== 1 && 's'}
            </>
          )}
        </span>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Loading */}
        {loading && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            )}
          </>
        )}

        {/* Error */}
        {error && !loading && (
          <ErrorState
            title="Error al cargar procesos"
            message={
              error.response?.data?.message ||
              'Ocurrió un error inesperado'
            }
            onRetry={refetch}
          />
        )}

        {/* Empty */}
        {!loading && !error && procesos.length === 0 && (
          <EmptyState
            title={
              hasFilters
                ? 'No se encontraron procesos'
                : 'No hay procesos registrados'
            }
            description={
              hasFilters
                ? 'Intenta ajustar los filtros para encontrar lo que buscas'
                : 'Comienza creando tu primer proceso de vinculación'
            }
            action={hasFilters ? resetFilters : () => setWizardOpen(true)}
            actionLabel={
              hasFilters ? 'Limpiar filtros' : 'Crear primer proceso'
            }
          />
        )}

        {/* Data */}
        {!loading && !error && procesos.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {procesos.map((proceso) => (
                  <ProcesoCard
                    key={proceso.id}
                    proceso={proceso}
                  />
                ))}
              </div>
            ) : (
              <ProcesoTable procesos={procesos} />
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Wizard */}
      <ProcesoWizard
        open={wizardOpen}
        onOpenChange={(open) => {
          setWizardOpen(open)
          if (!open) refetch()
        }}
      />
    </div>
  )
}
