import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import { Alert, AlertDescription } from '@components/ui/alert'
import { RefreshCw, Loader2, Info } from 'lucide-react'
import { decisionesAPI } from '@api/endpoints/decisiones'
import { toast } from '@components/ui/use-toast'

export const RelanzarConvocatoriaModal = ({ open, onOpenChange, proceso, fase, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fechaApertura: '',
    fechaCierre: '',
    motivoRelanzamiento: '',
    modificaciones: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fechaApertura || !formData.fechaCierre) {
      toast({
        variant: "destructive",
        title: "Fechas incompletas",
        description: "Debe definir el periodo de la nueva convocatoria"
      })
      return
    }

    if (new Date(formData.fechaCierre) <= new Date(formData.fechaApertura)) {
      toast({
        variant: "destructive",
        title: "Fechas inválidas",
        description: "La fecha de cierre debe ser posterior a la de apertura"
      })
      return
    }

    if (!formData.motivoRelanzamiento.trim()) {
      toast({
        variant: "destructive",
        title: "Justificación requerida",
        description: "Explique el motivo del relanzamiento"
      })
      return
    }

    setLoading(true)

    try {
      await decisionesAPI.create(proceso.id, fase.id, {
        decision: 'RELANZAR_CONVOCATORIA',
        justificacion: formData.motivoRelanzamiento.trim(),
        fechaApertura: new Date(formData.fechaApertura).toISOString(),
        fechaCierre: new Date(formData.fechaCierre).toISOString(),
        modificaciones: formData.modificaciones.trim() || undefined
      })

      toast({
        title: "Convocatoria Relanzada",
        description: "Se ha creado una nueva versión de la convocatoria."
      })

      onSuccess()
      onOpenChange(false)
      setFormData({
        fechaApertura: '',
        fechaCierre: '',
        motivoRelanzamiento: '',
        modificaciones: ''
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al relanzar",
        description: error.response?.data?.message || "Ocurrió un error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
            <RefreshCw className="h-5 w-5" />
            Relanzar Convocatoria
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800/40">
            <Info className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <AlertDescription className="text-violet-900 dark:text-violet-300 text-sm">
              <p>Esta acción cerrará la fase actual y generará una <strong>nueva convocatoria</strong> (ej. COD-R2) vinculada a este reto.</p>
              <p className="mt-1 text-violet-800 dark:text-violet-400/80">Esto permitirá ajustar criterios y obtener nuevas postulaciones.</p>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaApertura">Apertura</Label>
              <Input
                id="fechaApertura"
                type="date"
                value={formData.fechaApertura}
                onChange={(e) => handleChange('fechaApertura', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaCierre">Cierre</Label>
              <Input
                id="fechaCierre"
                type="date"
                value={formData.fechaCierre}
                onChange={(e) => handleChange('fechaCierre', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">
              Motivo del Relanzamiento <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="motivo"
              value={formData.motivoRelanzamiento}
              onChange={(e) => handleChange('motivoRelanzamiento', e.target.value)}
              placeholder="Ej: La convocatoria quedó desierta..."
              className="min-h-[80px]"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modificaciones">Ajustes a Criterios (Opcional)</Label>
            <Textarea
              id="modificaciones"
              value={formData.modificaciones}
              onChange={(e) => handleChange('modificaciones', e.target.value)}
              placeholder="Describa cambios en puntajes o requisitos si aplica..."
              className="min-h-[80px]"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-1.5 bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Confirmar Relanzamiento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}