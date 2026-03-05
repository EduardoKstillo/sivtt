import { useState } from 'react'
import { HistorialFilters } from './HistorialFilters'
import { HistorialTimeline } from './HistorialTimeline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { EmptyState } from '@components/common/EmptyState'
import { useHistorial } from '@hooks/useHistorial'
import { History } from 'lucide-react'

export const HistorialTab = ({ proceso }) => {
  const [filters, setFilters] = useState({
    tipoEvento: '',
    fechaInicio: '',
    fechaFin: ''
  })

  // Hook conectado al servicio backend
  const {
    eventos,
    loading,
    error,
    refetch
  } = useHistorial(proceso.id, filters)

  const hasFilters = filters.tipoEvento || filters.fechaInicio || filters.fechaFin

  if (loading) return <div className="py-10"><LoadingSpinner /></div>

  if (error) {
    return (
      <ErrorState
        title="Error al cargar historial"
        message="No se pudo cargar la línea de tiempo del proceso"
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="space-y-6 fade-in animate-in slide-in-from-bottom-4 duration-500">

      {/* Header — patrón idéntico a EvidenciasTab */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg shrink-0">
          <History className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Línea de Tiempo</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Registro de auditoría y eventos clave del proceso.
          </p>
        </div>
      </div>

      <HistorialFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ tipoEvento: '', fechaInicio: '', fechaFin: '' })}
      />

      {/* Contenedor principal — usa bg-card y border-border del sistema */}
      <div className="bg-card rounded-lg border border-border p-6 min-h-[400px]">
        {eventos.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'Sin resultados' : 'Historial vacío'}
            description={
              hasFilters
                ? 'No se encontraron eventos con los filtros seleccionados.'
                : 'Aún no hay actividad registrada en este proceso.'
            }
            action={hasFilters ? () => setFilters({ tipoEvento: '', fechaInicio: '', fechaFin: '' }) : undefined}
            actionLabel={hasFilters ? 'Limpiar filtros' : undefined}
          />
        ) : (
          <HistorialTimeline eventos={eventos} />
        )}
      </div>
    </div>
  )
}