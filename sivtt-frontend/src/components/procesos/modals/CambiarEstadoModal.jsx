import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Pause, Play, XCircle, AlertTriangle } from 'lucide-react'
import { procesosAPI } from '@api/endpoints/procesos'
import { toast } from 'sonner' // ✅ Migrado a Sonner

const CONFIG = {
  PAUSADO: {
    title: 'Pausar Proceso',
    icon: Pause,
    colorClass: 'text-amber-600',
    btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    alert: 'El proceso se detendrá temporalmente. Nadie podrá modificar, subir evidencias ni avanzar fases hasta que sea reanudado.'
  },
  ACTIVO: {
    title: 'Reanudar Proceso',
    icon: Play,
    colorClass: 'text-emerald-600',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    alert: 'El proceso volverá a estar activo y el equipo podrá continuar con sus actividades.'
  },
  CANCELADO: {
    title: 'Cancelar Proceso (Definitivo)',
    icon: XCircle,
    colorClass: 'text-rose-600',
    btnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    alert: '¡ATENCIÓN! Esta acción es irreversible. La fase actual se cerrará forzosamente y el proceso quedará congelado como "Cancelado" para fines de auditoría histórica.'
  }
}

export const CambiarEstadoModal = ({ open, onOpenChange, proceso, nuevoEstado, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [motivo, setMotivo] = useState('')

  if (!nuevoEstado) return null

  const config = CONFIG[nuevoEstado]
  const Icon = config.icon

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (motivo.trim().length < 10) {
      toast.error('Justificación requerida', { // ✅ Sonner
        description: 'El motivo debe tener al menos 10 caracteres para la auditoría.'
      })
      return
    }

    setLoading(true)
    try {
      await procesosAPI.changeEstado(proceso.id, {
        nuevoEstado,
        motivo: motivo.trim()
      })

      toast.success(`Proceso ${nuevoEstado.toLowerCase()}`, { // ✅ Sonner
        description: 'El estado ha sido actualizado con éxito.'
      })

      setMotivo('')
      onSuccess()
    } catch (error) {
      toast.error('Error al cambiar estado', { // ✅ Sonner
        description: error.response?.data?.message || 'Intente nuevamente'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.colorClass}`} />
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Alert className="bg-muted/50 border-border">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="text-sm text-foreground/80 leading-relaxed">
              {config.alert}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="motivo">
              Motivo de la acción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explique detalladamente la razón de este cambio de estado para el registro de auditoría..."
              rows={4}
              maxLength={500}
              disabled={loading}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right tabular-nums">
              {motivo.length}/500
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Volver
            </Button>
            <Button type="submit" disabled={loading} className={config.btnClass}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
              Confirmar Acción
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}