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
import { Info, FolderOpen } from 'lucide-react'
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

  const flujoFases = FLUJOS_FASES[proceso.tipoActivo] || []
  const fasesConData = flujoFases.filter(fase => evidenciasPorFase[fase])
  const otrasFases = Object.keys(evidenciasPorFase).filter(f => !flujoFases.includes(f))
  const fasesOrdenadas = [...fasesConData, ...otrasFases]

  const hasFilters = filters.fase || filters.tipo || filters.estado || filters.actividadId

  return (
    <div className="space-y-6 fade-in animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg shrink-0">
          <FolderOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Repositorio de Evidencias
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión centralizada de todos los entregables y documentos del proceso.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-muted-foreground text-xs">
          Este repositorio muestra la última versión aprobada o en curso de cada entregable.
          Utiliza los filtros para encontrar documentos específicos.
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
        <div className="py-12 flex justify-center"><LoadingSpinner /></div>
      ) : error ? (
        <ErrorState
          title="Error al cargar evidencias"
          message={error.response?.data?.message || 'Error inesperado'}
          onRetry={refetch}
        />
      ) : evidencias.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No se encontraron resultados" : "Repositorio vacío"}
          description={
            hasFilters
              ? "No hay evidencias que coincidan con los filtros seleccionados."
              : "Aún no se han cargado evidencias en este proceso."
          }
          action={hasFilters ? resetFilters : undefined}
          actionLabel={hasFilters ? "Limpiar filtros" : undefined}
        />
      ) : (
        <>
          <div className="space-y-3">
            {fasesOrdenadas.map((fase) => (
              <EvidenciasFolderView
                key={fase}
                fase={fase}
                evidencias={evidenciasPorFase[fase]}
                onEvidenciaClick={setSelectedEvidencia}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </div>
          )}
        </>
      )}

      {selectedEvidencia && (
        <VisorEvidenciaModal
          evidencia={selectedEvidencia}
          open={!!selectedEvidencia}
          onClose={() => setSelectedEvidencia(null)}
        />
      )}
    </div>
  )
}