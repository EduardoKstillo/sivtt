import { useState } from 'react'
import { EvidenciasFolderView } from './EvidenciasFolderView'
import { EvidenciasFilters } from './EvidenciasFilters'
import { VisorEvidenciaModal } from './modals/VisorEvidenciaModal' // Asegúrate de tener este componente o quitarlo si no lo usas
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

  // Filtrar fases que realmente tienen evidencias (para no mostrar carpetas vacías innecesarias)
  // o mostrar todas según tu preferencia. Aquí mostramos el orden lógico.
  const flujoFases = FLUJOS_FASES[proceso.tipoActivo] || []
  const fasesConData = flujoFases.filter(fase => evidenciasPorFase[fase])
  
  // Si hay evidencias en fases que no están en el flujo (ej. antiguas), las agregamos al final
  const otrasFases = Object.keys(evidenciasPorFase).filter(f => !flujoFases.includes(f))
  const fasesOrdenadas = [...fasesConData, ...otrasFases]

  const hasFilters = filters.fase || filters.tipo || filters.estado || filters.actividadId

  return (
    <div className="space-y-6 fade-in animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-lg">
            <FolderOpen className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Repositorio de Evidencias
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestión centralizada de todos los entregables y documentos del proceso.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Alert className="bg-blue-50 border-blue-100 text-blue-800">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-xs">
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
          {/* Vista por Carpetas */}
          <div className="space-y-4">
            {fasesOrdenadas.map((fase) => (
              <EvidenciasFolderView
                key={fase}
                fase={fase}
                evidencias={evidenciasPorFase[fase]}
                onEvidenciaClick={setSelectedEvidencia} // Abrir modal visualizador
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-center">
                <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                />
            </div>
          )}
        </>
      )}

      {/* Visor Modal (Opcional, si tienes visor de PDFs/Imágenes) */}
      {/* Si no tienes VisorEvidenciaModal implementado, comenta esto o usa window.open */}
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