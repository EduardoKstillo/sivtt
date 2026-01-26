import { useState } from 'react'
import { HistorialFilters } from './HistorialFilters'
import { HistorialTimeline } from './HistorialTimeline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { EmptyState } from '@components/common/EmptyState'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Info } from 'lucide-react'
import { useHistorial } from '@hooks/useHistorial'

export const HistorialTab = ({ proceso }) => {
  const [filters, setFilters] = useState({
    tipoEvento: '',
    fechaInicio: '',
    fechaFin: ''
  })

  const {
    eventos,
    loading,
    error,
    refetch
  } = useHistorial(proceso.id, filters)

  const hasFilters = filters.tipoEvento || filters.fechaInicio || filters.fechaFin

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar historial"
        message="No se pudo cargar el historial del proceso"
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Historial del Proceso
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Registro completo de todos los eventos y cambios del proceso
        </p>
      </div>

      {/* Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          El historial registra automáticamente todos los cambios importantes: cambios de estado,
          avances de fase, decisiones tomadas, actualizaciones de TRL, y más.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <HistorialFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ tipoEvento: '', fechaInicio: '', fechaFin: '' })}
      />

      {/* Timeline */}
      {eventos.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No se encontraron eventos" : "No hay eventos registrados"}
          description={
            hasFilters
              ? "Intenta ajustar los filtros de búsqueda"
              : "Los eventos aparecerán aquí conforme se registren cambios en el proceso"
          }
          action={hasFilters ? () => setFilters({ tipoEvento: '', fechaInicio: '', fechaFin: '' }) : undefined}
          actionLabel={hasFilters ? "Limpiar filtros" : undefined}
        />
      ) : (
        <HistorialTimeline eventos={eventos} proceso={proceso} />
      )}
    </div>
  )
}