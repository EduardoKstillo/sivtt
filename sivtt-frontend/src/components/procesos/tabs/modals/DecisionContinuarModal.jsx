import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import { Alert, AlertDescription } from '@components/ui/alert'
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import { decisionesAPI } from '@api/endpoints/decisiones'
import { toast } from '@components/ui/use-toast'
import { FLUJOS_FASES } from '@utils/constants'

export const DecisionContinuarModal = ({ open, onOpenChange, proceso, fase, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [justificacion, setJustificacion] = useState('')

  const flujo = FLUJOS_FASES[proceso.tipoActivo]
  const currentIndex = flujo.indexOf(fase.fase)
  const nextFase = flujo[currentIndex + 1]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!justificacion.trim()) {
      toast({
        variant: "destructive",
        title: "Justificación requerida",
        description: "Debe proporcionar una justificación para continuar"
      })
      return
    }

    setLoading(true)

    try {
      await decisionesAPI.create(proceso.id, fase.id, {
        decision: 'CONTINUAR',
        justificacion: justificacion.trim()
      })

      toast({
        title: "Fase avanzada exitosamente",
        description: `El proceso avanzó a la fase ${nextFase}`
      })

      onSuccess()
      onOpenChange(false)
      setJustificacion('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al avanzar fase",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-600" />
            Avanzar a Siguiente Fase
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Está a punto de cerrar la fase {fase.fase} y avanzar a {nextFase}.</strong>
              <div className="mt-3 space-y-1 text-sm">
                <p>✅ Todas las actividades obligatorias están aprobadas</p>
                <p>✅ {fase.estadisticas?.evidenciasAprobadas || 0} evidencias verificadas</p>
                {proceso.tipoActivo === 'PATENTE' && proceso.trlActual && (
                  <p>✅ TRL coherente con la fase (TRL {proceso.trlActual})</p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="justificacion">
              Justificación <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="justificacion"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Explique las razones para avanzar a la siguiente fase..."
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-right">
              {justificacion.length}/500
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Confirmar y Avanzar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}