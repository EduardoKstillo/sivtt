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
import { Loader2, Download, CheckCircle2 } from 'lucide-react'
import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'

export const GestionarNDAModal = ({
  open,
  onOpenChange,
  vinculacion,
  proceso,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [fechaFirma, setFechaFirma] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (vinculacion?.ndaFechaFirma) {
      setFechaFirma(vinculacion.ndaFechaFirma)
    } else {
      setFechaFirma('')
    }
  }, [vinculacion, open])

  if (!vinculacion) return null

  const {
    id,
    ndaFirmado,
    ndaFechaFirma,
    ndaDocumentoUrl,
    empresa
  } = vinculacion

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!ndaFirmado && !fechaFirma) {
      toast({
        variant: 'destructive',
        title: 'Fecha requerida',
        description: 'Debe especificar la fecha de firma'
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('ndaFirmado', true)
      formData.append('ndaFechaFirma', fechaFirma)
      if (file) {
        formData.append('ndaDocumento', file)
      }

      await empresasAPI.updateVinculacion(proceso.id, id, formData)

      toast({
        title: 'NDA actualizado',
        description: 'El acuerdo de confidencialidad fue registrado'
      })

      onSuccess?.()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: error.response?.data?.message || 'Intente nuevamente'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Gestionar NDA – {empresa?.razonSocial}
          </DialogTitle>
        </DialogHeader>

        {ndaFirmado ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>NDA firmado</strong>
                <br />
                Fecha de firma: {formatDate(ndaFechaFirma)}
              </AlertDescription>
            </Alert>

            {ndaDocumentoUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(ndaDocumentoUrl, '_blank')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar documento firmado
              </Button>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-900 text-sm">
                El NDA (Non-Disclosure Agreement) protege la información confidencial
                compartida durante el proceso de transferencia.
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
              <Label htmlFor="documento">Documento firmado (opcional)</Label>
              <Input
                id="documento"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Formatos aceptados: PDF, DOC, DOCX
              </p>
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
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Registrar NDA
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
