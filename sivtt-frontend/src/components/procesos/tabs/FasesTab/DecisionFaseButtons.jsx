import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'
import { 
  ArrowLeft, 
  ArrowRight, 
  Pause, 
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { DecisionContinuarModal } from '../modals/DecisionContinuarModal'
import { DecisionRetrocederModal } from '../modals/DecisionRetrocederModal'
import { DecisionPausarModal } from '../modals/DecisionPausarModal'
import { DecisionFinalizarModal } from '../modals/DecisionFinalizarModal'
import { RelanzarConvocatoriaModal } from '../modals/RelanzarConvocatoriaModal'
import { TIPO_ACTIVO, FLUJOS_FASES } from '@utils/constants'
import { canCloseFase } from '@utils/validators'

export const DecisionFaseButtons = ({ proceso, fase, onSuccess }) => {
  const [modalOpen, setModalOpen] = useState(null)

  const isPatente = proceso.tipoActivo === TIPO_ACTIVO.PATENTE
  const flujo = FLUJOS_FASES[proceso.tipoActivo] || []
  const currentIndex = flujo.indexOf(fase.fase)
  const isFinalPhase = currentIndex === flujo.length - 1
  const canContinue = canCloseFase(fase.actividades || [])

  const actividadesObligatorias = (fase.actividades || []).filter(a => a.obligatoria)
  const actividadesPendientes = actividadesObligatorias.filter(
    a => a.estado !== 'APROBADA'
  )

  return (
    <div className="space-y-4">
      <div className="border-t border-border pt-5">
        <h4 className="font-medium text-foreground mb-4 text-sm flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-primary text-xs">🎯</span>
          Decisión de Fase
        </h4>

        {/* Validation warning */}
        {!canContinue && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/30">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-900 dark:text-amber-300">
              <strong>No se puede cerrar esta fase.</strong>
              <br />
              Requiere aprobar {actividadesPendientes.length} actividad
              {actividadesPendientes.length !== 1 && 'es'} obligatoria
              {actividadesPendientes.length !== 1 && 's'}:
              <ul className="list-disc list-inside mt-2 text-sm text-amber-800 dark:text-amber-400/80">
                {actividadesPendientes.slice(0, 3).map(act => (
                  <li key={act.id}>{act.nombre}</li>
                ))}
                {actividadesPendientes.length > 3 && (
                  <li>Y {actividadesPendientes.length - 3} más...</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Decision Buttons */}
        <div className="flex flex-wrap gap-2.5">
          {/* Retroceder */}
          {currentIndex > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen('retroceder')}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Retroceder
            </Button>
          )}

          {/* Pausar */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalOpen('pausar')}
            className="gap-1.5"
          >
            <Pause className="h-4 w-4" />
            Pausar
          </Button>

          {/* Continuar / Finalizar */}
          {isFinalPhase ? (
            <Button
              size="sm"
              onClick={() => setModalOpen('finalizar')}
              disabled={!canContinue}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              Finalizar Proceso
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setModalOpen('continuar')}
              disabled={!canContinue}
              className="gap-1.5"
            >
              <ArrowRight className="h-4 w-4" />
              Continuar a Siguiente Fase
            </Button>
          )}

          {/* Relanzar Convocatoria */}
          {!isPatente && fase.fase === 'SELECCION' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen('relanzar')}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              Relanzar Convocatoria
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      <DecisionContinuarModal
        open={modalOpen === 'continuar'}
        onOpenChange={(open) => setModalOpen(open ? 'continuar' : null)}
        proceso={proceso}
        fase={fase}
        onSuccess={onSuccess}
      />

      <DecisionRetrocederModal
        open={modalOpen === 'retroceder'}
        onOpenChange={(open) => setModalOpen(open ? 'retroceder' : null)}
        proceso={proceso}
        fase={fase}
        onSuccess={onSuccess}
      />

      <DecisionPausarModal
        open={modalOpen === 'pausar'}
        onOpenChange={(open) => setModalOpen(open ? 'pausar' : null)}
        proceso={proceso}
        fase={fase}
        onSuccess={onSuccess}
      />

      <DecisionFinalizarModal
        open={modalOpen === 'finalizar'}
        onOpenChange={(open) => setModalOpen(open ? 'finalizar' : null)}
        proceso={proceso}
        fase={fase}
        onSuccess={onSuccess}
      />

      {!isPatente && fase.fase === 'SELECCION' && (
        <RelanzarConvocatoriaModal
          open={modalOpen === 'relanzar'}
          onOpenChange={(open) => setModalOpen(open ? 'relanzar' : null)}
          proceso={proceso}
          fase={fase}
          onSuccess={onSuccess}
        />
      )}
    </div>
  )
}