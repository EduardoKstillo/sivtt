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
            <ArrowLeft className="h-5 w-5 text-orange-600" />
            Retroceder a Fase Anterior
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Esta acción:</strong>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Cerrará la fase {fase.fase}</li>
                <li>Reabrirá la fase seleccionada</li>
                <li>Se registrará en el historial</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="faseDestino">
              Fase destino <span className="text-red-500">*</span>
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
              Justificación <span className="text-red-500">*</span>
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
              variant="destructive"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <ArrowLeft className="mr-2 h-4 w-4" />
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