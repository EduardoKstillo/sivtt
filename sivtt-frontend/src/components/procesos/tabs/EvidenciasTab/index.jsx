import { useState } from 'react'
import { EvidenciasFolderView } from './EvidenciasFolderView'
import { EvidenciasFilters } from './EvidenciasFilters'
import { VisorEvidenciaModal } from './modals/VisorEvidenciaModal'
import { Pagination } from '@components/common/Pagination'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { EmptyState } from '@components/common/EmptyState'
import { useEvidencias } from '@hooks/useEvidencias'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Info } from 'lucide-react'
import { FLUJOS_FASES } from '@utils/constants'

export const EvidenciasTab = ({ proceso }) => {
  const [selectedEvidencia, setSelectedEvidencia] = useState(null)

  const {
    evidencias,
    evidenciasPorFase,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch
  } = useEvidencias(proceso.id)

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage })
  }

  const handleEvidenciaClick = (evidencia) => {
    setSelectedEvidencia(evidencia)
  }

  const hasFilters = filters.fase || filters.tipo || filters.estado || filters.actividadId

  // Ordenar fases según el flujo del proceso
  const flujoFases = FLUJOS_FASES[proceso.tipoActivo]
  const fasesOrdenadas = flujoFases.filter(fase => evidenciasPorFase[fase])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Repositorio de Evidencias
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Todas las evidencias del proceso organizadas por fase
        </p>
      </div>

      {/* Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          Las evidencias están agrupadas por fase. Expande cada fase para ver sus evidencias.
          Puedes filtrar por estado para ver solo aprobadas, pendientes o rechazadas.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <EvidenciasFilters
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
        proceso={proceso}
      />

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState
          title="Error al cargar evidencias"
          message={error.response?.data?.message || 'Error inesperado'}
          onRetry={refetch}
        />
      ) : evidencias.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No se encontraron evidencias" : "No hay evidencias"}
          description={
            hasFilters
              ? "Intenta ajustar los filtros"
              : "Las evidencias aparecerán aquí cuando se suban a las actividades"
          }
          action={hasFilters ? resetFilters : undefined}
          actionLabel={hasFilters ? "Limpiar filtros" : undefined}
        />
      ) : (
        <>
          {/* Vista por Carpetas */}
          <div className="space-y-4">
            {fasesOrdenadas.map((fase) => (
              <EvidenciasFolderView
                key={fase}
                fase={fase}
                evidencias={evidenciasPorFase[fase]}
                onEvidenciaClick={handleEvidenciaClick}
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

      {/* Visor Modal */}
      <VisorEvidenciaModal
        evidencia={selectedEvidencia}
        open={!!selectedEvidencia}
        onClose={() => setSelectedEvidencia(null)}
        onUpdate={refetch}
      />
    </div>
  )
}