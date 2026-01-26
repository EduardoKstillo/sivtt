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

  // ✅ Lógica correcta y segura
  const flujo = FLUJOS_FASES[proceso.tipoActivo] || []
  const currentIndex = flujo.indexOf(fase.fase)
  const isFinalPhase = currentIndex === flujo.length - 1
  const canContinue = canCloseFase(fase.actividades || [])

  // Actividades obligatorias pendientes (feedback UX)
  const actividadesObligatorias = (fase.actividades || []).filter(a => a.obligatoria)
  const actividadesPendientes = actividadesObligatorias.filter(
    a => a.estado !== 'APROBADA'
  )

  return (
    <div className="space-y-4">
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-4">
          🎯 Decisión de Fase
        </h4>

        {/* ⚠️ Validación de actividades obligatorias */}
        {!canContinue && (
          <Alert className="mb-4 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900">
              <strong>No se puede cerrar esta fase.</strong>
              <br />
              Requiere aprobar {actividadesPendientes.length} actividad
              {actividadesPendientes.length !== 1 && 'es'} obligatoria
              {actividadesPendientes.length !== 1 && 's'}:
              <ul className="list-disc list-inside mt-2 text-sm">
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

        {/* 🧭 Botones de Decisión */}
        <div className="flex flex-wrap gap-3">
          {/* Retroceder */}
          {currentIndex > 0 && (
            <Button
              variant="outline"
              onClick={() => setModalOpen('retroceder')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retroceder
            </Button>
          )}

          {/* Pausar */}
          <Button
            variant="outline"
            onClick={() => setModalOpen('pausar')}
          >
            <Pause className="h-4 w-4 mr-2" />
            Pausar
          </Button>

          {/* Continuar / Finalizar */}
          {isFinalPhase ? (
            <Button
              onClick={() => setModalOpen('finalizar')}
              disabled={!canContinue}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalizar Proceso
            </Button>
          ) : (
            <Button
              onClick={() => setModalOpen('continuar')}
              disabled={!canContinue}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Continuar a Siguiente Fase
            </Button>
          )}

          {/* 🔁 Relanzar Convocatoria */}
          {!isPatente && fase.fase === 'SELECCION' && (
            <Button
              variant="outline"
              onClick={() => setModalOpen('relanzar')}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Relanzar Convocatoria
            </Button>
          )}
        </div>
      </div>

      {/* ================= MODALES ================= */}

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
