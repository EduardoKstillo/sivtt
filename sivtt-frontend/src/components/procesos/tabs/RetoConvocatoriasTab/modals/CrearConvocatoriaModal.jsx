import { useState } from 'react'
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
import { Loader2, Info } from 'lucide-react'
import { convocatoriasAPI } from '@api/endpoints/convocatorias'
import { toast } from '@components/ui/use-toast'

export const CrearConvocatoriaModal = ({ open, onOpenChange, reto, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fechaApertura: '',
    fechaCierre: '',
    criteriosSeleccion: '',
    requisitosPostulacion: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones
    if (!formData.titulo || !formData.fechaApertura || !formData.fechaCierre) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Complete todos los campos obligatorios"
      })
      return
    }

    // Validar fechas
    const apertura = new Date(formData.fechaApertura)
    const cierre = new Date(formData.fechaCierre)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    if (apertura < hoy) {
      toast({
        variant: "destructive",
        title: "Fecha inválida",
        description: "La fecha de apertura no puede ser anterior a hoy"
      })
      return
    }

    if (cierre <= apertura) {
      toast({
        variant: "destructive",
        title: "Fechas inválidas",
        description: "La fecha de cierre debe ser posterior a la apertura"
      })
      return
    }

    setLoading(true)

    try {
      await convocatoriasAPI.create(reto.id, {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        fechaApertura: formData.fechaApertura,
        fechaCierre: formData.fechaCierre,
        criteriosSeleccion: formData.criteriosSeleccion.trim() || undefined,
        requisitosPostulacion: formData.requisitosPostulacion.trim() || undefined
      })

      toast({
        title: "Convocatoria creada",
        description: "La convocatoria fue creada en estado BORRADOR"
      })

      onSuccess()
      
      // Reset form
      setFormData({
        titulo: '',
        descripcion: '',
        fechaApertura: '',
        fechaCierre: '',
        criteriosSeleccion: '',
        requisitosPostulacion: ''
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al crear convocatoria",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Convocatoria</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              La convocatoria se creará en estado <strong>BORRADOR</strong>. 
              Podrás editarla y luego publicarla cuando esté lista.
            </AlertDescription>
          </Alert>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título de la Convocatoria <span className="text-red-500">*</span>
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Ej: Primera Convocatoria - Solución IoT Industrial"
              disabled={loading}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Descripción general de la convocatoria..."
              rows={3}
              maxLength={1000}
              disabled={loading}
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaApertura">
                Fecha de Apertura <span className="text-red-500">*</span>
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
                Fecha de Cierre <span className="text-red-500">*</span>
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

          {/* Criterios de Selección */}
          <div className="space-y-2">
            <Label htmlFor="criteriosSeleccion">Criterios de Selección</Label>
            <Textarea
              id="criteriosSeleccion"
              value={formData.criteriosSeleccion}
              onChange={(e) => handleChange('criteriosSeleccion', e.target.value)}
              placeholder="Criterios que se usarán para evaluar las postulaciones..."
              rows={4}
              maxLength={2000}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Ejemplo: Viabilidad técnica (30%), Experiencia del equipo (25%), etc.
            </p>
          </div>

          {/* Requisitos */}
          <div className="space-y-2">
            <Label htmlFor="requisitosPostulacion">Requisitos de Postulación</Label>
            <Textarea
              id="requisitosPostulacion"
              value={formData.requisitosPostulacion}
              onChange={(e) => handleChange('requisitosPostulacion', e.target.value)}
              placeholder="Requisitos que deben cumplir los grupos para postular..."
              rows={4}
              maxLength={2000}
              disabled={loading}
            />
          </div>

          {/* Actions */}
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
                  Creando...
                </>
              ) : (
                'Crear Convocatoria'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}