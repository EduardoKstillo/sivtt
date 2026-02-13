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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Loader2 } from 'lucide-react'
import { retosAPI } from '@api/endpoints/retos'
import { toast } from '@components/ui/use-toast'

export const EditarRetoModal = ({ open, onOpenChange, reto, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    problema: '',
    objetivos: '',
    resultadosEsperados: '',
    restricciones: '',
    timelineEstimado: '',
    nivelConfidencialidad: 'PUBLICO',
    prioridad: '3',
    // Ficha Técnica
    empresaSolicitante: '',
    presupuestoEstimado: '',
    duracionEstimada: '',
    equipoDisponible: ''
  })

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (open && reto) {
      setFormData({
        titulo: reto.titulo || '',
        descripcion: reto.descripcion || '',
        problema: reto.problema || '',
        objetivos: reto.objetivos || '',
        resultadosEsperados: reto.resultadosEsperados || '',
        restricciones: reto.restricciones || '',
        timelineEstimado: reto.timelineEstimado || '',
        nivelConfidencialidad: reto.nivelConfidencialidad || 'PUBLICO',
        prioridad: reto.prioridad ? reto.prioridad.toString() : '3',
        // Ficha Técnica (Manejo defensivo)
        empresaSolicitante: reto.fichaTecnica?.empresaSolicitante || '',
        presupuestoEstimado: reto.fichaTecnica?.presupuestoEstimado || '',
        duracionEstimada: reto.fichaTecnica?.duracionEstimada || '',
        equipoDisponible: reto.fichaTecnica?.equipoDisponible || ''
      })
    }
  }, [open, reto])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.titulo || !formData.descripcion || !formData.problema) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Título, descripción y problema son obligatorios"
      })
      return
    }

    setLoading(true)

    try {
      // ✅ Construcción limpia del objeto fichaTecnica
      const fichaTecnica = {
        empresaSolicitante: formData.empresaSolicitante.trim() || null,
        // Convertir a número o null si está vacío
        presupuestoEstimado: formData.presupuestoEstimado ? parseFloat(formData.presupuestoEstimado) : null,
        duracionEstimada: formData.duracionEstimada ? parseInt(formData.duracionEstimada) : null,
        equipoDisponible: formData.equipoDisponible.trim() || null
      }

      await retosAPI.update(proceso.id, reto.id, {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        problema: formData.problema.trim(),
        objetivos: formData.objetivos.trim() || undefined,
        
        fichaTecnica, // Enviamos el objeto estructurado
        
        resultadosEsperados: formData.resultadosEsperados.trim() || undefined,
        restricciones: formData.restricciones.trim() || undefined,
        timelineEstimado: formData.timelineEstimado ? parseInt(formData.timelineEstimado) : null,
        nivelConfidencialidad: formData.nivelConfidencialidad,
        prioridad: parseInt(formData.prioridad)
      })

      toast({
        title: "Reto actualizado",
        description: "Los cambios fueron guardados exitosamente"
      })

      onSuccess()
      onOpenChange(false) // Cerrar modal al éxito
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error al actualizar",
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
          <DialogTitle>Editar Reto Tecnológico</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... (El resto del JSX es idéntico a tu versión, está correcto) ... */}
          
          {/* Solo por brevedad no repito todo el JSX, ya que tus inputs están bien conectados
              al estado formData y handleChange. Lo importante era la lógica de handleSubmit 
              y useEffect. */}
          
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              Información Básica
            </h3>

            <div className="space-y-2">
              <Label htmlFor="titulo">
                Título del Reto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">
                Descripción General <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                rows={4}
                maxLength={2000}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="problema">
                Problema a Resolver <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="problema"
                value={formData.problema}
                onChange={(e) => handleChange('problema', e.target.value)}
                rows={5}
                maxLength={3000}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objetivos">Objetivos</Label>
              <Textarea
                id="objetivos"
                value={formData.objetivos}
                onChange={(e) => handleChange('objetivos', e.target.value)}
                rows={4}
                maxLength={2000}
                disabled={loading}
              />
            </div>
          </div>

          {/* Ficha Técnica */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              Ficha Técnica
            </h3>

            <div className="space-y-2">
              <Label htmlFor="empresaSolicitante">Empresa Solicitante</Label>
              <Input
                id="empresaSolicitante"
                value={formData.empresaSolicitante}
                onChange={(e) => handleChange('empresaSolicitante', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="presupuestoEstimado">Presupuesto (S/.)</Label>
                <Input
                  id="presupuestoEstimado"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.presupuestoEstimado}
                  onChange={(e) => handleChange('presupuestoEstimado', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracionEstimada">Duración (meses)</Label>
                <Input
                  id="duracionEstimada"
                  type="number"
                  min="1"
                  value={formData.duracionEstimada}
                  onChange={(e) => handleChange('duracionEstimada', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timelineEstimado">Timeline (días)</Label>
                <Input
                  id="timelineEstimado"
                  type="number"
                  min="1"
                  value={formData.timelineEstimado}
                  onChange={(e) => handleChange('timelineEstimado', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipoDisponible">Equipo Disponible</Label>
              <Input
                id="equipoDisponible"
                value={formData.equipoDisponible}
                onChange={(e) => handleChange('equipoDisponible', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Resultados y Restricciones */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              Resultados y Restricciones
            </h3>

            <div className="space-y-2">
              <Label htmlFor="resultadosEsperados">Resultados Esperados</Label>
              <Textarea
                id="resultadosEsperados"
                value={formData.resultadosEsperados}
                onChange={(e) => handleChange('resultadosEsperados', e.target.value)}
                rows={4}
                maxLength={2000}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restricciones">Restricciones</Label>
              <Textarea
                id="restricciones"
                value={formData.restricciones}
                onChange={(e) => handleChange('restricciones', e.target.value)}
                rows={4}
                maxLength={2000}
                disabled={loading}
              />
            </div>
          </div>

          {/* Configuración */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              Configuración
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nivelConfidencialidad">Nivel de Confidencialidad</Label>
                <Select
                  value={formData.nivelConfidencialidad}
                  onValueChange={(value) => handleChange('nivelConfidencialidad', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="nivelConfidencialidad">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLICO">Público</SelectItem>
                    <SelectItem value="RESTRINGIDO">Restringido</SelectItem>
                    <SelectItem value="CONFIDENCIAL">Confidencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad (1-5)</Label>
                <Select
                  value={formData.prioridad.toString()}
                  onValueChange={(value) => handleChange('prioridad', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="prioridad">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Muy Baja</SelectItem>
                    <SelectItem value="2">2 - Baja</SelectItem>
                    <SelectItem value="3">3 - Media</SelectItem>
                    <SelectItem value="4">4 - Alta</SelectItem>
                    <SelectItem value="5">5 - Muy Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}