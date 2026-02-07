import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Download, CheckCircle2, Info } from 'lucide-react'
import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'

export const GestionarCartaIntencionModal = ({
  open,
  onOpenChange,
  vinculacion,
  proceso,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [fechaFirma, setFechaFirma] = useState('')
  const [file, setFile] = useState(null)

  // 🔹 Inicializar estado cuando se abre el modal
  useEffect(() => {
    if (open && vinculacion) {
      setFechaFirma(vinculacion.cartaIntencionFecha || '')
      setFile(null)
    }
  }, [open, vinculacion])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!fechaFirma) {
      toast({
        variant: 'destructive',
        title: 'Fecha requerida',
        description: 'Debe especificar la fecha de firma'
      })
      return
    }

    setLoading(true)

    try {
      const payload = {
        cartaIntencionFirmada: true,
        cartaIntencionFecha: fechaFirma
      }

      await empresasAPI.updateVinculacion(
        proceso.id,
        vinculacion.id,
        payload
      )

      toast({
        title: 'Carta registrada',
        description: 'La carta de intención fue registrada exitosamente'
      })

      onSuccess()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al registrar',
        description: error.response?.data?.message || 'Intente nuevamente'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!vinculacion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestionar Carta de Intención</DialogTitle>
        </DialogHeader>

        {vinculacion.cartaIntencionFirmada ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>Carta de intención registrada</strong>
                <br />
                Fecha de firma:{' '}
                {formatDate(vinculacion.cartaIntencionFecha)}
              </AlertDescription>
            </Alert>

            {vinculacion.cartaIntencionArchivoUrl && (
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    vinculacion.cartaIntencionArchivoUrl,
                    '_blank'
                  )
                }
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar documento
              </Button>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                La carta de intención formaliza el compromiso de la empresa
                para participar en el proceso.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="fechaFirma">
                Fecha de firma <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fechaFirma"
                type="date"
                value={fechaFirma}
                onChange={(e) => setFechaFirma(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento">Documento (opcional)</Label>
              <Input
                id="documento"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={loading}
              />
            </div>

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
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Registrar Carta
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
