import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from '@components/ui/use-toast'

export const VerificarEmpresaModal = ({
  open,
  onOpenChange,
  empresa,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    if (!loading) onOpenChange(false)
  }

  const handleVerificar = async () => {
    if (!empresa?.id) return

    setLoading(true)

    try {
      await empresasAPI.verify(empresa.id)

      toast({
        title: 'Empresa verificada',
        description: 'La empresa fue verificada exitosamente',
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al verificar',
        description: error.response?.data?.message || 'Intente nuevamente',
      })
    } finally {
      setLoading(false)
    }
  }

  // ⛔ No renderizar si no hay empresa
  if (!empresa) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Verificar Empresa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">

          {/* Información de la empresa — bg-muted/30 + border-border del sistema */}
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Información de la Empresa
            </h4>

            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Razón Social:</span>
                <span className="font-medium text-foreground">{empresa.razonSocial}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">RUC:</span>
                <span className="font-medium text-foreground font-mono">{empresa.ruc}</span>
              </div>

              {empresa.sector && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Sector:</span>
                  <span className="font-medium text-foreground capitalize">
                    {empresa.sector.charAt(0) + empresa.sector.slice(1).toLowerCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Advertencia — amber semántico consistente con el estado "Observada" del sistema */}
          <Alert className="bg-amber-500/10 border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-foreground ml-2">
              <p className="text-sm font-medium mb-1">Antes de verificar, asegúrese de:</p>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 mt-1.5">
                <li>Validar que el RUC sea correcto en SUNAT</li>
                <li>Confirmar que los datos de contacto son válidos</li>
                <li>Verificar que la empresa esté activa y habida</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Info — patrón bg-primary/5 border-primary/15 del sistema */}
          <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20 py-2.5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-muted-foreground text-xs ml-2">
              Al verificar la empresa, podrá ser vinculada a procesos de transferencia tecnológica.
            </AlertDescription>
          </Alert>

          {/* Footer — patrón idéntico a CrearEditarActividadModal */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button
              onClick={handleVerificar}
              disabled={loading}
              className="gap-1.5"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Verificar Empresa
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}