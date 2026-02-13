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
import { Pause, Loader2, Info } from 'lucide-react'
import { decisionesAPI } from '@api/endpoints/decisiones'
import { toast } from '@components/ui/use-toast'

export const DecisionPausarModal = ({ open, onOpenChange, proceso, fase, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [justificacion, setJustificacion] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!justificacion.trim()) {
      toast({
        variant: "destructive",
        title: "Justificación requerida",
        description: "Debe explicar el motivo de la pausa"
      })
      return
    }

    setLoading(true)

    try {
      await decisionesAPI.create(proceso.id, fase.id, {
        decision: 'PAUSAR',
        justificacion: justificacion.trim()
      })

      toast({
        title: "Proceso pausado",
        description: "El proceso fue pausado correctamente"
      })

      onSuccess()
      onOpenChange(false)
      setJustificacion('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al pausar",
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
            <Pause className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            Pausar Proceso
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/40">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-900 dark:text-amber-300">
              Al pausar el proceso:
              <ul className="list-disc list-inside mt-2 text-sm text-amber-800 dark:text-amber-400/80">
                <li>El estado cambiará a PAUSADO</li>
                <li>La fase actual permanecerá abierta</li>
                <li>Se puede reactivar en cualquier momento</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="justificacion">
              Motivo de la pausa <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="justificacion"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Explique el motivo por el cual se pausa el proceso..."
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground text-right tabular-nums">
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
              className="gap-1.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pausar Proceso
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}