import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Download, CheckCircle2, Info, FileText } from 'lucide-react'
import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'

export const GestionarCartaIntencionModal = ({
  open, onOpenChange, vinculacion, proceso, onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [fechaFirma, setFechaFirma] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (open && vinculacion) {
      setFechaFirma(vinculacion.cartaIntencionFecha || '')
      setFile(null)
    }
  }, [open, vinculacion])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fechaFirma) {
      toast({ variant: 'destructive', title: 'Fecha requerida', description: 'Debe especificar la fecha de firma' })
      return
    }

    setLoading(true)
    try {
      await empresasAPI.updateVinculacion(proceso.id, vinculacion.id, {
        cartaIntencionFirmada: true,
        cartaIntencionFecha: fechaFirma
      })
      toast({ title: 'Carta registrada', description: 'La carta de intención fue registrada exitosamente' })
      onSuccess()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al registrar', description: error.response?.data?.message })
    } finally {
      setLoading(false)
    }
  }

  if (!vinculacion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Gestionar Carta de Intención
          </DialogTitle>
        </DialogHeader>

        {vinculacion.cartaIntencionFirmada ? (
          <div className="space-y-4">
            <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/40">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription className="text-emerald-900 dark:text-emerald-300">
                <strong>Carta de intención registrada</strong>
                <br />
                <span className="text-emerald-800 dark:text-emerald-400/80 tabular-nums">
                  Fecha de firma: {formatDate(vinculacion.cartaIntencionFecha)}
                </span>
              </AlertDescription>
            </Alert>

            {vinculacion.cartaIntencionArchivoUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(vinculacion.cartaIntencionArchivoUrl, '_blank')}
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar documento
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
            <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-muted-foreground text-sm">
                La carta de intención formaliza el compromiso de la empresa
                para participar en el proceso.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label className="text-xs">
                Fecha de firma <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={fechaFirma}
                onChange={(e) => setFechaFirma(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Documento (opcional)</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={loading}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="gap-1.5">
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Registrando...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Registrar Carta</>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}