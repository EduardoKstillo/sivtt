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
import { Textarea } from '@components/ui/textarea'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, AlertTriangle, Info } from 'lucide-react'
import { convocatoriasAPI } from '@api/endpoints/convocatorias'
import { toast } from '@components/ui/use-toast'

export const RelanzarConvocatoriaModal = ({ open, onOpenChange, convocatoria, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fechaApertura: '',
    fechaCierre: '',
    motivoRelanzamiento: ''
  })

  useEffect(() => {
    if (open) {
      setFormData({ fechaApertura: '', fechaCierre: '', motivoRelanzamiento: '' })
    }
  }, [open, convocatoria])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fechaApertura || !formData.fechaCierre || !formData.motivoRelanzamiento) {
      toast({ variant: 'destructive', title: 'Campos requeridos', description: 'Por favor, complete todos los campos.' })
      return
    }

    if (formData.motivoRelanzamiento.trim().length < 10) {
      toast({ variant: 'destructive', title: 'Motivo muy corto', description: 'El motivo debe tener al menos 10 caracteres.' })
      return
    }

    const apertura = new Date(formData.fechaApertura)
    const cierre   = new Date(formData.fechaCierre)
    const hoy      = new Date()
    hoy.setHours(0, 0, 0, 0)

    if (isNaN(apertura.getTime()) || isNaN(cierre.getTime())) {
      toast({ variant: 'destructive', title: 'Fechas inválidas' })
      return
    }

    if (apertura < hoy) {
      toast({ variant: 'destructive', title: 'Fecha inválida', description: 'La fecha de apertura no puede ser anterior a hoy.' })
      return
    }

    if (cierre <= apertura) {
      toast({ variant: 'destructive', title: 'Rango inválido', description: 'La fecha de cierre debe ser posterior a la apertura.' })
      return
    }

    setLoading(true)
    try {
      await convocatoriasAPI.relanzar(convocatoria.id, {
        fechaApertura:       formData.fechaApertura,
        fechaCierre:         formData.fechaCierre,
        motivoRelanzamiento: formData.motivoRelanzamiento.trim()
      })

      toast({ title: 'Convocatoria relanzada', description: 'Se creó una nueva convocatoria en estado BORRADOR' })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast({ variant: 'destructive', title: 'Error al relanzar', description: error.response?.data?.message || 'Intente nuevamente' })
    } finally {
      setLoading(false)
    }
  }

  if (!convocatoria) return null

  const nuevoCodigo = convocatoria.codigo
    ? `${convocatoria.codigo.split('-R')[0]}-R${(convocatoria.numeroRelanzamiento || 0) + 1}`
    : '...'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Relanzar Convocatoria</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Info — bg-primary/5 del sistema */}
          <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20 py-2.5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-muted-foreground text-xs ml-2">
              Se creará una nueva convocatoria basada en{' '}
              <strong className="text-foreground">{convocatoria.codigo}</strong>.
              El nuevo código será:{' '}
              <strong className="text-foreground">{nuevoCodigo}</strong>
            </AlertDescription>
          </Alert>

          {/* Warning — amber semántico en lugar de bg-yellow-50 border-yellow-200 */}
          <Alert className="bg-amber-500/10 border-amber-500/20 py-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-muted-foreground text-xs ml-2">
              Esta acción copiará los criterios y requisitos de la convocatoria original.
              Solo se puede relanzar si la anterior está cerrada y desierta (sin seleccionados).
            </AlertDescription>
          </Alert>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivoRelanzamiento">
              Motivo del Relanzamiento <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="motivoRelanzamiento"
              value={formData.motivoRelanzamiento}
              onChange={(e) => handleChange('motivoRelanzamiento', e.target.value)}
              placeholder="Explique por qué se relanza (ej: Convocatoria desierta, ampliación de alcance...)"
              rows={4}
              maxLength={500}
              className="resize-none"
              disabled={loading}
            />
            {/* text-muted-foreground en lugar de text-gray-500 */}
            <p className="text-xs text-muted-foreground text-right tabular-nums">
              {formData.motivoRelanzamiento.length}/500 — mínimo 10 caracteres
            </p>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaApertura">
                Nueva Fecha de Apertura <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fechaApertura"
                type="date"
                value={formData.fechaApertura}
                onChange={(e) => handleChange('fechaApertura', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaCierre">
                Nueva Fecha de Cierre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fechaCierre"
                type="date"
                value={formData.fechaCierre}
                onChange={(e) => handleChange('fechaCierre', e.target.value)}
                min={formData.fechaApertura || new Date().toISOString().split('T')[0]}
                disabled={loading}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            {/* Sin bg-orange-600 hardcodeado — usa primario del tema */}
            <Button type="submit" disabled={loading} className="gap-1.5">
              {loading
                ? <Loader2 className="animate-spin h-4 w-4" />
                : 'Relanzar Convocatoria'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}