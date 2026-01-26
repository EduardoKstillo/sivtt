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
import { CheckCircle2, Loader2, Trophy } from 'lucide-react'
import { decisionesAPI } from '@api/endpoints/decisiones'
import { toast } from '@components/ui/use-toast'

export const DecisionFinalizarModal = ({ open, onOpenChange, proceso, fase, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [justificacion, setJustificacion] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!justificacion.trim()) {
      toast({
        variant: "destructive",
        title: "Justificación requerida",
        description: "Debe proporcionar un resumen de cierre"
      })
      return
    }

    setLoading(true)

    try {
      await decisionesAPI.create(proceso.id, fase.id, {
        decision: 'FINALIZAR',
        justificacion: justificacion.trim()
      })

      toast({
        title: "¡Proceso finalizado exitosamente!",
        description: "El proceso ha sido completado"
      })

      onSuccess()
      onOpenChange(false)
      setJustificacion('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al finalizar",
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
            <Trophy className="h-5 w-5 text-green-600" />
            Finalizar Proceso
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>¡Está a punto de finalizar el proceso!</strong>
              <div className="mt-3 space-y-1 text-sm">
                <p>✅ Todas las fases han sido completadas</p>
                <p>✅ Todas las actividades obligatorias aprobadas</p>
                <p>✅ El proceso pasará a estado FINALIZADO</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="justificacion">
              Resumen de cierre <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="justificacion"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Describa los resultados y logros del proceso..."
              rows={6}
              maxLength={1000}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-right">
              {justificacion.length}/1000
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
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Finalizar Proceso
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}