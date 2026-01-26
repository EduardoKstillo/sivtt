import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Trophy, AlertTriangle } from 'lucide-react'
import { postulacionesAPI } from '@api/endpoints/postulaciones'
import { toast } from '@components/ui/use-toast'

export const SeleccionarGanadorModal = ({ open, onOpenChange, postulacion, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  if (!postulacion) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    try {
      await postulacionesAPI.seleccionar(postulacion.id)

      toast({
        title: "¡Ganador seleccionado!",
        description: `${postulacion.grupo?.nombre} fue seleccionado como ganador`
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
            <Trophy className="h-5 w-5 text-yellow-600" />
            Seleccionar Ganador de la Convocatoria
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info del Grupo */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg text-white flex items-center justify-center font-bold text-2xl">
                {postulacion.grupo?.codigo?.charAt(0) || 'G'}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {postulacion.grupo?.nombre}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Código: {postulacion.grupo?.codigo}
                </p>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-700">
                    Puntaje: {postulacion.puntajeTotal}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>¡Acción irreversible!</strong>
              <br />
              Al seleccionar este grupo como ganador:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Se cerrará automáticamente la convocatoria</li>
                <li>Las demás postulaciones serán marcadas como rechazadas</li>
                <li>El proceso avanzará a la siguiente fase (ANTEPROYECTO)</li>
                <li>Se notificará al grupo ganador</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Confirmación */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Por favor, confirme que desea seleccionar a <strong>{postulacion.grupo?.nombre}</strong> como
              el grupo ganador de esta convocatoria.
            </p>
          </div>

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
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seleccionando...
                </>
              ) : (
                <>
                  <Trophy className="mr-2 h-4 w-4" />
                  Confirmar Selección
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}