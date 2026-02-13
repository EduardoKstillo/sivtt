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
import { Loader2, XCircle, AlertTriangle } from 'lucide-react'
import { postulacionesAPI } from '@api/endpoints/postulaciones'
import { toast } from '@components/ui/use-toast'

export const RechazarPostulacionModal = ({ open, onOpenChange, postulacion, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')

  if (!postulacion) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ✅ CORRECCIÓN: Validar longitud mínima (Backend pide min 10 caracteres)
    if (!motivoRechazo.trim() || motivoRechazo.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Motivo muy corto",
        description: "Debes especificar el motivo del rechazo con al menos 10 caracteres."
      })
      return
    }

    setLoading(true)

    try {
      await postulacionesAPI.rechazar(postulacion.id, {
        motivoRechazo: motivoRechazo.trim()
      })

      toast({
        title: "Postulación rechazada",
        description: `${postulacion.grupo.nombre} ha sido rechazado`
      })

      onSuccess()
      setMotivoRechazo('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al rechazar",
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
            <XCircle className="h-6 w-6 text-red-600" />
            Rechazar Postulación
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info del Grupo */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-gray-900 mb-1">
              {postulacion.grupo.nombre}
            </h3>
            <p className="text-sm text-gray-600">
              {postulacion.grupo.codigo} • {postulacion.grupo.facultad}
            </p>
          </div>

          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900 text-sm">
              Esta acción notificará al grupo sobre el rechazo de su postulación.
              Asegúrate de proporcionar un motivo claro y constructivo.
            </AlertDescription>
          </Alert>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivoRechazo">
              Motivo del Rechazo <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motivoRechazo"
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Explica de forma clara y constructiva por qué se rechaza la postulación..."
              rows={6}
              maxLength={1000}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-right">
              {motivoRechazo.length}/1000 (Mínimo 10 caracteres)
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
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rechazando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Confirmar Rechazo
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}