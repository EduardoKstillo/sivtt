import { FaseTimeline } from './FaseTimeline'
import { useFases } from '@hooks/useFases'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { Info } from 'lucide-react'
import { TIPO_ACTIVO, FLUJOS_FASES } from '@utils/constants'

export const FasesTab = ({ proceso, onUpdate }) => {
  const { fases, loading, error, expandedFase, toggleFase, refetch } = useFases(proceso.id)

  if (loading) {
    return <div className="py-10"><LoadingSpinner /></div>
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar fases"
        message="No se pudo cargar la información de las fases"
        onRetry={refetch}
      />
    )
  }

  const isPatente = proceso.tipoActivo === TIPO_ACTIVO.PATENTE
  const flujoCompleto = FLUJOS_FASES[proceso.tipoActivo] || []

  return (
    <div className="space-y-6 fade-in animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="bg-primary/5 rounded-lg border border-primary/10 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">
              Flujo de Proceso: {isPatente ? 'PATENTE' : 'REQUERIMIENTO EMPRESARIAL'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isPatente 
                ? 'Este proceso sigue un flujo secuencial de 5 fases diseñado para la transferencia de tecnología.'
                : 'Este proceso sigue un flujo de 7 fases orientado a la solución de retos empresariales.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <FaseTimeline
        fases={fases}
        flujoCompleto={flujoCompleto}
        faseActual={proceso.faseActual}
        expandedFase={expandedFase}
        onToggleFase={toggleFase}
        proceso={proceso}
        onUpdate={onUpdate}
        onRefresh={refetch}
      />
    </div>
  )
}