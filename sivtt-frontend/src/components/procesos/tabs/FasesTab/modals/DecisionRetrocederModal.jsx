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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { AlertTriangle, Loader2, ArrowLeft } from 'lucide-react'
import { decisionesAPI } from '@api/endpoints/decisiones'
import { toast } from '@components/ui/use-toast'
import { FLUJOS_FASES } from '@utils/constants'

export const DecisionRetrocederModal = ({ open, onOpenChange, proceso, fase, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [faseDestino, setFaseDestino] = useState('')
  const [justificacion, setJustificacion] = useState('')

  const flujo = FLUJOS_FASES[proceso.tipoActivo]
  const currentIndex = flujo.indexOf(fase.fase)
  const fasesAnteriores = flujo.slice(0, currentIndex)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!faseDestino) {
      toast({
        variant: "destructive",
        title: "Fase destino requerida",
        description: "Debe seleccionar a qué fase retroceder"
      })
      return
    }

    if (!justificacion.trim()) {
      toast({
        variant: "destructive",
        title: "Justificación requerida",
        description: "Debe explicar por qué retrocede el proceso"
      })
      return
    }

    setLoading(true)

    try {
      await decisionesAPI.create(proceso.id, fase.id, {
        decision: 'RETROCEDER',
        faseDestino,
        justificacion: justificacion.trim()
      })

      toast({
        title: "Fase retrocedida",
        description: `El proceso retrocedió a la fase ${faseDestino}`
      })

      onSuccess()
      onOpenChange(false)
      setFaseDestino('')
      setJustificacion('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al retroceder",
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
            <ArrowLeft className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Retroceder a Fase Anterior
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-900 dark:text-amber-300">
              <strong>Esta acción:</strong>
              <ul className="list-disc list-inside mt-2 text-sm text-amber-800 dark:text-amber-400/80">
                <li>Cerrará la fase {fase.fase}</li>
                <li>Reabrirá la fase seleccionada</li>
                <li>Se registrará en el historial</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="faseDestino">
              Fase destino <span className="text-destructive">*</span>
            </Label>
            <Select
              value={faseDestino}
              onValueChange={setFaseDestino}
              disabled={loading}
            >
              <SelectTrigger id="faseDestino">
                <SelectValue placeholder="Seleccione la fase" />
              </SelectTrigger>
              <SelectContent>
                {fasesAnteriores.map(f => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificacion">
              Justificación <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="justificacion"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Explique las razones para retroceder..."
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
              className="gap-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  Confirmar Retroceso
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}