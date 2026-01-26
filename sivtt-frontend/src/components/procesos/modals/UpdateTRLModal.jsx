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
import { Loader2, Info, TrendingUp } from 'lucide-react'
import { procesosAPI } from '@api/endpoints/procesos'
import { toast } from '@components/ui/use-toast'
import { TRL_RANGES } from '@utils/constants'
import { isValidTRLForPhase } from '@utils/validators'
import { cn } from '@/lib/utils'

export const UpdateTRLModal = ({ open, onOpenChange, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [newTRL, setNewTRL] = useState(proceso.trlActual)
  const [justificacion, setJustificacion] = useState('')

  const isValidTRL = isValidTRLForPhase(proceso.faseActual, newTRL)
  const hasChanged = newTRL !== proceso.trlActual
  const isIncrement = newTRL > proceso.trlActual

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!hasChanged) {
      toast({
        variant: "destructive",
        title: "Sin cambios",
        description: "Debe seleccionar un TRL diferente"
      })
      return
    }

    if (!isValidTRL) {
      toast({
        variant: "destructive",
        title: "TRL no válido",
        description: `El TRL debe estar entre ${TRL_RANGES[proceso.faseActual]?.min} y ${TRL_RANGES[proceso.faseActual]?.max} para la fase ${proceso.faseActual}`
      })
      return
    }

    if (!justificacion.trim()) {
      toast({
        variant: "destructive",
        title: "Justificación requerida",
        description: "Debe proporcionar una justificación para el cambio"
      })
      return
    }

    setLoading(true)

    try {
      const { data } = await procesosAPI.updateTRL(proceso.id, {
        nuevoTRL: newTRL,
        justificacion: justificacion.trim()
      })

      toast({
        title: "TRL actualizado",
        description: `El TRL se actualizó de ${proceso.trlActual} a ${newTRL}`
      })

      onSuccess(data.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar TRL",
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
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Actualizar Nivel TRL
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TRL Actual */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">TRL Actual:</span>
              <span className="text-2xl font-bold text-gray-900">
                {proceso.trlActual}/9
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "flex-1 h-2 rounded-full",
                    level <= proceso.trlActual ? "bg-gray-400" : "bg-gray-200"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Selector de Nuevo TRL */}
          <div className="space-y-3">
            <Label>
              Nuevo TRL <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                const isValid = isValidTRLForPhase(proceso.faseActual, level)
                const isSelected = level === newTRL
                const isCurrent = level === proceso.trlActual

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setNewTRL(level)}
                    disabled={!isValid || loading}
                    className={cn(
                      "flex-1 h-12 rounded-lg font-semibold text-sm transition-all",
                      isSelected && "ring-2 ring-blue-600 scale-105",
                      isValid && !isSelected && "bg-blue-100 text-blue-700 hover:bg-blue-200",
                      !isValid && "bg-gray-100 text-gray-400 cursor-not-allowed",
                      isCurrent && !isSelected && "bg-gray-300 text-gray-700"
                    )}
                    title={!isValid ? `No válido para fase ${proceso.faseActual}` : `TRL ${level}`}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-500">
              TRL válidos para la fase {proceso.faseActual}: {TRL_RANGES[proceso.faseActual]?.min} - {TRL_RANGES[proceso.faseActual]?.max}
            </p>
          </div>

          {/* Preview del cambio */}
          {hasChanged && (
            <Alert className={isIncrement ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
              <Info className={`h-4 w-4 ${isIncrement ? 'text-green-600' : 'text-orange-600'}`} />
              <AlertDescription className={isIncrement ? 'text-green-900' : 'text-orange-900'}>
                {isIncrement ? (
                  <>
                    <strong>Incremento de TRL:</strong> {proceso.trlActual} → {newTRL} ({newTRL - proceso.trlActual} niveles)
                  </>
                ) : (
                  <>
                    <strong>Reducción de TRL:</strong> {proceso.trlActual} → {newTRL} ({proceso.trlActual - newTRL} niveles)
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Justificación */}
          <div className="space-y-2">
            <Label htmlFor="justificacion">
              Justificación del cambio <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="justificacion"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Explique las razones del cambio de TRL..."
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-right">
              {justificacion.length}/500
            </p>
          </div>

          {/* Actions */}
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
              disabled={loading || !hasChanged || !isValidTRL}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar TRL'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}