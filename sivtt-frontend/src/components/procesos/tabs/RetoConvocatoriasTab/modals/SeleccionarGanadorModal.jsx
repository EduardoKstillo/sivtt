import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, AlertTriangle, Award, CheckCircle2 } from 'lucide-react'
import { postulacionesAPI } from '@api/endpoints/postulaciones'
import { toast } from '@components/ui/use-toast'

export const SeleccionarGanadorModal = ({ open, onOpenChange, postulacion, convocatoria, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  if (!postulacion) return null

  const puntajeMinimo = convocatoria.criteriosSeleccion?.puntajeMinimo || 60
  const cumplePuntaje = postulacion.puntajeTotal >= puntajeMinimo

  const handleConfirm = async () => {
    if (!cumplePuntaje) {
      toast({
        variant: "destructive",
        title: "Puntaje insuficiente",
        description: `El grupo debe alcanzar al menos ${puntajeMinimo} puntos`
      })
      return
    }

    setLoading(true)

    try {
      await postulacionesAPI.seleccionar(postulacion.id)

      toast({
        title: "Grupo seleccionado",
        description: `${postulacion.grupo.nombre} ha sido seleccionado como ganador`
      })

      onSuccess()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al seleccionar",
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
            <Award className="h-6 w-6 text-yellow-600" />
            Seleccionar Grupo Ganador
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info del Grupo */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              {postulacion.grupo.nombre}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {postulacion.grupo.codigo} • {postulacion.grupo.facultad}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Coordinador</p>
                <p className="font-medium text-gray-900">{postulacion.grupo.coordinador}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Puntaje Obtenido</p>
                <p className="text-2xl font-bold text-purple-900">
                  {postulacion.puntajeTotal}/100
                </p>
              </div>
            </div>
          </div>

          {/* Validación de Puntaje */}
          {cumplePuntaje ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>Puntaje aprobado:</strong> El grupo cumple con el puntaje mínimo requerido 
                de {puntajeMinimo} puntos.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong>Puntaje insuficiente:</strong> El grupo no alcanza el puntaje mínimo 
                de {puntajeMinimo} puntos. No puede ser seleccionado.
              </AlertDescription>
            </Alert>
          )}

          {/* Desglose de Puntajes */}
          {postulacion.puntajesDetalle && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Desglose de Evaluación</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {Object.entries(postulacion.puntajesDetalle).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="font-semibold text-gray-900">{value}/100</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning */}
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900 text-sm">
              <strong>Acción irreversible:</strong> Al seleccionar este grupo como ganador, 
              todas las demás postulaciones serán automáticamente rechazadas.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || !cumplePuntaje}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seleccionando...
                </>
              ) : (
                <>
                  <Award className="mr-2 h-4 w-4" />
                  Confirmar Selección
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}