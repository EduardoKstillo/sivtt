import { useState } from 'react'
import { HistorialFilters } from './HistorialFilters'
import { HistorialTimeline } from './HistorialTimeline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { EmptyState } from '@components/common/EmptyState'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Info, History } from 'lucide-react'
import { useHistorial } from '@hooks/useHistorial'

export const HistorialTab = ({ proceso }) => {
  const [filters, setFilters] = useState({
    tipoEvento: '', // Puede ser 'TRL', 'FASE', etc. o ''
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
      
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
            <History className="h-5 w-5 text-gray-600" />
        </div>
        <div>
            <h2 className="text-lg font-semibold text-gray-900">Línea de Tiempo</h2>
            <p className="text-sm text-gray-500">Registro de auditoría y eventos clave.</p>
        </div>
      </div>

      <HistorialFilters
        filters={filters}
        onFilterChange={setFilters} // El componente hijo maneja la lógica de actualización
        onReset={() => setFilters({ tipoEvento: '', fechaInicio: '', fechaFin: '' })}
      />

      <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[400px]">
        {eventos.length === 0 ? (
            <EmptyState
            title={hasFilters ? "Sin resultados" : "Historial vacío"}
            description={
                hasFilters
                ? "No se encontraron eventos con los filtros seleccionados."
                : "Aún no hay actividad registrada en este proceso."
            }
            action={hasFilters ? () => setFilters({ tipoEvento: '', fechaInicio: '', fechaFin: '' }) : undefined}
            actionLabel={hasFilters ? "Limpiar filtros" : undefined}
            />
        ) : (
            <HistorialTimeline eventos={eventos} />
        )}
      </div>
    </div>
  )
}