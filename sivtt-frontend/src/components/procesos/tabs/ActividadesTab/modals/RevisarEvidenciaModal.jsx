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
import { CheckCircle2, XCircle, Loader2, Info, Eye } from 'lucide-react'
import { evidenciasAPI } from '@api/endpoints/evidencias'
import { toast } from '@components/ui/use-toast'

export const RevisarEvidenciaModal = ({ open, onOpenChange, evidencia, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [decision, setDecision] = useState(null) // 'APROBADA' | 'RECHAZADA'
  const [comentario, setComentario] = useState('')

  if (!evidencia) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!decision) {
      toast({
        variant: "destructive",
        title: "Decisión requerida",
        description: "Debe aprobar o rechazar la evidencia"
      })
      return
    }

    if (decision === 'RECHAZADA' && !comentario.trim()) {
      toast({
        variant: "destructive",
        title: "Comentario requerido",
        description: "Debe explicar el motivo del rechazo"
      })
      return
    }

    setLoading(true)

    try {
      await evidenciasAPI.review(evidencia.id, {
        nuevoEstado: decision,
        comentarioRevision: comentario.trim() || undefined
      })

      toast({
        title: decision === 'APROBADA' ? "Evidencia aprobada" : "Evidencia rechazada",
        description: decision === 'APROBADA' 
          ? "La evidencia fue aprobada exitosamente"
          : "La evidencia fue rechazada y la actividad cambió a OBSERVADA"
      })

      onSuccess()
      setDecision(null)
      setComentario('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al revisar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revisar Evidencia</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Preview */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Vista Previa</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Archivo:</span>
                    <p className="font-medium text-gray-900">{evidencia.nombreArchivo}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <p className="font-medium text-gray-900">{evidencia.tipo}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Versión:</span>
                    <p className="font-medium text-gray-900">{evidencia.version}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Subido por:</span>
                    <p className="font-medium text-gray-900">{evidencia.usuario?.nombre}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => window.open(evidencia.archivoUrl, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Archivo Completo
                </Button>
              </div>
            </div>

            {/* Info Boxes */}
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 text-sm">
                <strong>Si apruebas:</strong>
                <br />
                {evidencia.actividad?.evidencias?.pendientes === 1 
                  ? 'Si esta es la última evidencia pendiente, la actividad cambiará a LISTA_PARA_CIERRE'
                  : 'La evidencia se marcará como aprobada'}
              </AlertDescription>
            </Alert>

            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900 text-sm">
                <strong>Si rechazas:</strong>
                <br />
                La actividad cambiará automáticamente a estado OBSERVADA
              </AlertDescription>
            </Alert>
          </div>

          {/* Right: Review Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Decisión de Revisión</h4>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant={decision === 'APROBADA' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setDecision('APROBADA')}
                  disabled={loading}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aprobar Evidencia
                </Button>

                <Button
                  type="button"
                  variant={decision === 'RECHAZADA' ? 'destructive' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setDecision('RECHAZADA')}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar Evidencia
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comentario">
                Comentarios 
                {decision === 'RECHAZADA' && <span className="text-red-500"> *</span>}
                {decision === 'APROBADA' && <span className="text-gray-500"> (opcional)</span>}
              </Label>
              <Textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder={
                  decision === 'RECHAZADA' 
                    ? "Explique las razones del rechazo..."
                    : "Agregue observaciones o comentarios (opcional)..."
                }
                rows={6}
                maxLength={500}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 text-right">
                {comentario.length}/500
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  setDecision(null)
                  setComentario('')
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !decision}
                className={decision === 'RECHAZADA' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    {decision === 'APROBADA' ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Confirmar Aprobación
                      </>
                    ) : decision === 'RECHAZADA' ? (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Confirmar Rechazo
                      </>
                    ) : (
                      'Revisar'
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}