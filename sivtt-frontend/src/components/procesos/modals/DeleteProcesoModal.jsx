import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Input } from '@components/ui/input'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Trash2, AlertOctagon } from 'lucide-react'
import { procesosAPI } from '@api/endpoints/procesos'
import { toast } from '@components/ui/use-toast'

export const DeleteProcesoModal = ({ open, onOpenChange, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [codigoConfirmacion, setCodigoConfirmacion] = useState('')

  // Validaciones directas en el frontend para ahorrarle el viaje al backend
  const hasActividades = proceso.actividadesTotales > 0
  const hasEmpresas = proceso.empresasVinculadas > 0
  // (Asumiendo que tienes un conteo de financiamientos en el DTO, sino, el backend lo atajará)
  const isBlockable = hasActividades || hasEmpresas 

  const isConfirmed = codigoConfirmacion === proceso.codigo

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isConfirmed) return

    setLoading(true)
    try {
      await procesosAPI.delete(proceso.id)

      toast({
        title: "Proceso Eliminado",
        description: "El registro fue borrado físicamente de la base de datos."
      })

      // Redirige al usuario fuera de la página muerta
      onSuccess() 
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Operación Bloqueada",
        description: error.response?.data?.message || "No se puede eliminar el proceso."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val)
      if (!val) setCodigoConfirmacion('') // Reset al cerrar
    }}>
      <DialogContent className="max-w-lg border-rose-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertOctagon className="h-5 w-5" />
            Eliminar Proceso Permanentemente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isBlockable ? (
            <Alert className="bg-rose-50 border-rose-200 dark:bg-rose-950/30">
              <AlertDescription className="text-rose-900 dark:text-rose-300 text-sm leading-relaxed">
                <strong>No puedes eliminar este proceso.</strong> El sistema ha detectado que ya cuenta con información operativa vinculada (actividades o empresas). 
                Por motivos de auditoría institucional, debes utilizar la opción <strong>"Cancelar proceso"</strong> en su lugar.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert className="bg-rose-50 border-rose-200 dark:bg-rose-950/30">
                <AlertDescription className="text-rose-900 dark:text-rose-300 text-sm leading-relaxed">
                  Estás a punto de realizar un <strong>Hard Delete</strong>. Se borrará el proceso y su configuración inicial. Esta acción no se puede deshacer ni quedará registro en la auditoría.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 bg-muted/50 p-4 rounded-lg border border-border">
                <Label htmlFor="codigo" className="text-sm font-medium">
                  Para confirmar, escribe el código del proceso: <strong className="select-none text-foreground">{proceso.codigo}</strong>
                </Label>
                <Input
                  id="codigo"
                  autoComplete="off"
                  value={codigoConfirmacion}
                  onChange={(e) => setCodigoConfirmacion(e.target.value)}
                  placeholder="Escribe el código exactamente igual..."
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Mantener a salvo
            </Button>
            
            <Button 
              type="submit" 
              disabled={loading || isBlockable || !isConfirmed} 
              className="bg-destructive hover:bg-destructive/90 text-white gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Sí, eliminar definitivamente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}