import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Info } from 'lucide-react'
import { retosAPI } from '@api/endpoints/retos'
import { toast } from '@components/ui/use-toast'

export const CrearRetoModal = ({ open, onOpenChange, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '', descripcion: '', problema: '', objetivos: '',
    resultadosEsperados: '', restricciones: '', timelineEstimado: '',
    nivelConfidencialidad: 'PUBLICO', prioridad: 3,
    empresaSolicitante: '', presupuestoEstimado: '', duracionEstimada: '', equipoDisponible: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.titulo || !formData.descripcion || !formData.problema) {
      toast({ variant: 'destructive', title: 'Campos requeridos', description: 'Título, descripción y problema son obligatorios' })
      return
    }
    setLoading(true)
    try {
      const fichaTecnica = {
        empresaSolicitante:  formData.empresaSolicitante.trim(),
        presupuestoEstimado: formData.presupuestoEstimado ? parseFloat(formData.presupuestoEstimado) : null,
        duracionEstimada:    formData.duracionEstimada    ? parseInt(formData.duracionEstimada)       : null,
        equipoDisponible:    formData.equipoDisponible.trim()
      }
      await retosAPI.create(proceso.id, {
        titulo:               formData.titulo.trim(),
        descripcion:          formData.descripcion.trim(),
        problema:             formData.problema.trim(),
        objetivos:            formData.objetivos.trim()            || undefined,
        fichaTecnica,
        resultadosEsperados:  formData.resultadosEsperados.trim()  || undefined,
        restricciones:        formData.restricciones.trim()        || undefined,
        timelineEstimado:     formData.timelineEstimado            ? parseInt(formData.timelineEstimado) : null,
        nivelConfidencialidad: formData.nivelConfidencialidad,
        prioridad:             parseInt(formData.prioridad)
      })
      toast({ title: 'Reto creado', description: 'El reto tecnológico fue creado exitosamente' })
      onSuccess()
      setFormData({ titulo: '', descripcion: '', problema: '', objetivos: '', resultadosEsperados: '', restricciones: '', timelineEstimado: '', nivelConfidencialidad: 'PUBLICO', prioridad: 3, empresaSolicitante: '', presupuestoEstimado: '', duracionEstimada: '', equipoDisponible: '' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al crear reto', description: error.response?.data?.message || 'Intente nuevamente' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Reto Tecnológico</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Alert info — patrón bg-primary/5 del sistema */}
          <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20 py-2.5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-muted-foreground text-xs ml-2">
              Define el reto tecnológico que será publicado en las convocatorias para grupos de investigación.
            </AlertDescription>
          </Alert>

          {/* ── Información Básica ── */}
          {/* border-b border-border en lugar de border-b sin color */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
              Información Básica
            </h3>

            <div className="space-y-2">
              <Label htmlFor="titulo">
                Título del Reto <span className="text-destructive">*</span>
              </Label>
              <Input id="titulo" value={formData.titulo} onChange={e => handleChange('titulo', e.target.value)} placeholder="Título corto y descriptivo del reto" disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">
                Descripción General <span className="text-destructive">*</span>
              </Label>
              <Textarea id="descripcion" value={formData.descripcion} onChange={e => handleChange('descripcion', e.target.value)} placeholder="Descripción general del reto tecnológico..." rows={4} maxLength={2000} className="resize-none" disabled={loading} />
              <p className="text-xs text-muted-foreground text-right tabular-nums">{formData.descripcion.length}/2000</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="problema">
                Problema a Resolver <span className="text-destructive">*</span>
              </Label>
              <Textarea id="problema" value={formData.problema} onChange={e => handleChange('problema', e.target.value)} placeholder="Describa detalladamente el problema tecnológico..." rows={5} maxLength={3000} className="resize-none" disabled={loading} />
              <p className="text-xs text-muted-foreground text-right tabular-nums">{formData.problema.length}/3000</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objetivos">Objetivos</Label>
              <Textarea id="objetivos" value={formData.objetivos} onChange={e => handleChange('objetivos', e.target.value)} placeholder="Objetivos específicos del reto..." rows={4} maxLength={2000} className="resize-none" disabled={loading} />
            </div>
          </div>

          {/* ── Ficha Técnica ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
              Ficha Técnica
            </h3>

            <div className="space-y-2">
              <Label htmlFor="empresaSolicitante">Empresa Solicitante</Label>
              <Input id="empresaSolicitante" value={formData.empresaSolicitante} onChange={e => handleChange('empresaSolicitante', e.target.value)} placeholder="Nombre de la empresa" disabled={loading} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="presupuestoEstimado">Presupuesto (S/.)</Label>
                <Input id="presupuestoEstimado" type="number" min="0" step="0.01" value={formData.presupuestoEstimado} onChange={e => handleChange('presupuestoEstimado', e.target.value)} placeholder="50000.00" disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracionEstimada">Duración (meses)</Label>
                <Input id="duracionEstimada" type="number" min="1" value={formData.duracionEstimada} onChange={e => handleChange('duracionEstimada', e.target.value)} placeholder="6" disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timelineEstimado">Timeline Estimado (días)</Label>
                <Input id="timelineEstimado" type="number" min="1" value={formData.timelineEstimado} onChange={e => handleChange('timelineEstimado', e.target.value)} placeholder="180" disabled={loading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipoDisponible">Equipo Disponible</Label>
              <Input id="equipoDisponible" value={formData.equipoDisponible} onChange={e => handleChange('equipoDisponible', e.target.value)} placeholder="Descripción del equipo disponible" disabled={loading} />
            </div>
          </div>

          {/* ── Resultados y Restricciones ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
              Resultados y Restricciones
            </h3>

            <div className="space-y-2">
              <Label htmlFor="resultadosEsperados">Resultados Esperados</Label>
              <Textarea id="resultadosEsperados" value={formData.resultadosEsperados} onChange={e => handleChange('resultadosEsperados', e.target.value)} placeholder="Entregables y resultados esperados..." rows={4} maxLength={2000} className="resize-none" disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restricciones">Restricciones</Label>
              <Textarea id="restricciones" value={formData.restricciones} onChange={e => handleChange('restricciones', e.target.value)} placeholder="Restricciones técnicas, legales o de otro tipo..." rows={4} maxLength={2000} className="resize-none" disabled={loading} />
            </div>
          </div>

          {/* ── Configuración ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
              Configuración
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nivelConfidencialidad">Nivel de Confidencialidad</Label>
                <Select value={formData.nivelConfidencialidad} onValueChange={v => handleChange('nivelConfidencialidad', v)} disabled={loading}>
                  <SelectTrigger id="nivelConfidencialidad" className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLICO">Público</SelectItem>
                    <SelectItem value="RESTRINGIDO">Restringido</SelectItem>
                    <SelectItem value="CONFIDENCIAL">Confidencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad (1-5)</Label>
                <Select value={formData.prioridad.toString()} onValueChange={v => handleChange('prioridad', v)} disabled={loading}>
                  <SelectTrigger id="prioridad" className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 — Muy Baja</SelectItem>
                    <SelectItem value="2">2 — Baja</SelectItem>
                    <SelectItem value="3">3 — Media</SelectItem>
                    <SelectItem value="4">4 — Alta</SelectItem>
                    <SelectItem value="5">5 — Muy Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Crear Reto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}