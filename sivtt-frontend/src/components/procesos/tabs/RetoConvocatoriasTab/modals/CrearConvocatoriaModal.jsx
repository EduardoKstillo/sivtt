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

// 🔥 Criterios de evaluación predefinidos
const CRITERIOS_DEFAULT = {
  puntajeMinimo: 60,
  criterios: [
    { nombre: 'viabilidadTecnica', peso: 30, descripcion: 'Viabilidad Técnica' },
    { nombre: 'experienciaEquipo', peso: 25, descripcion: 'Experiencia del Equipo' },
    { nombre: 'metodologia', peso: 20, descripcion: 'Metodología' },
    { nombre: 'innovacion', peso: 15, descripcion: 'Innovación' },
    { nombre: 'presupuesto', peso: 10, descripcion: 'Presupuesto' }
  ]
}

export const CrearConvocatoriaModal = ({ open, onOpenChange, reto, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fechaApertura: '',
    fechaCierre: '',
    criteriosTexto: '',
    requisitosTexto: '',
    puntajeMinimo: 60
  })

  const todayString = new Date().toISOString().split('T')[0]

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      fechaApertura: '',
      fechaCierre: '',
      criteriosTexto: '',
      requisitosTexto: '',
      puntajeMinimo: 60
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 1️⃣ Validar campos obligatorios
    if (!formData.titulo.trim() || !formData.fechaApertura || !formData.fechaCierre) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Complete Título, Fecha de Apertura y Fecha de Cierre."
      })
      return
    }

    // 2️⃣ Validar fechas
    const apertura = new Date(formData.fechaApertura)
    const cierre = new Date(formData.fechaCierre)

    if (isNaN(apertura.getTime()) || isNaN(cierre.getTime())) {
      toast({
        variant: "destructive",
        title: "Fechas inválidas",
        description: "Ingrese fechas válidas."
      })
      return
    }

    if (cierre <= apertura) {
      toast({
        variant: "destructive",
        title: "Fechas inválidas",
        description: "La fecha de cierre debe ser posterior a la apertura."
      })
      return
    }

    setLoading(true)

    try {
      // 3️⃣ Construir payload limpio
      const criteriosSeleccion = {
        ...CRITERIOS_DEFAULT,
        puntajeMinimo: parseInt(formData.puntajeMinimo) || 60,
        descripcionAdicional: formData.criteriosTexto.trim() || undefined
      }

      const requisitosPostulacion = formData.requisitosTexto.trim()
        ? { descripcion: formData.requisitosTexto.trim() }
        : undefined

      const payload = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        fechaApertura: formData.fechaApertura,
        fechaCierre: formData.fechaCierre,
        criteriosSeleccion,
        requisitosPostulacion
      }

      await convocatoriasAPI.create(reto.id, payload)

      toast({
        title: "Convocatoria creada",
        description: "Se guardó en estado BORRADOR."
      })

      onSuccess?.()
      resetForm()
      onOpenChange(false)

    } catch (error) {
      console.error("Error creando convocatoria:", error)

      toast({
        variant: "destructive",
        title: "Error al crear",
        description: error.response?.data?.message || "Ocurrió un error inesperado."
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

          {/* Información */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              La convocatoria se creará en estado <strong>BORRADOR</strong>.
              Podrás editarla y publicarla cuando esté lista.
            </AlertDescription>
          </Alert>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Ej: Convocatoria 2026-I"
              maxLength={200}
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
              rows={3}
              maxLength={1000}
              disabled={loading}
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Apertura <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.fechaApertura}
                min={todayString}
                onChange={(e) => handleChange('fechaApertura', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha de Cierre <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.fechaCierre}
                min={formData.fechaApertura || todayString}
                onChange={(e) => handleChange('fechaCierre', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Puntaje mínimo */}
          <div className="space-y-2">
            <Label>Puntaje Mínimo (0-100)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.puntajeMinimo}
              onChange={(e) => handleChange('puntajeMinimo', e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Por defecto 60 puntos sobre 100.
            </p>
          </div>

          {/* Criterios automáticos */}
          <Alert className="bg-gray-50 border-gray-200">
            <Info className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-700 text-sm">
              <strong>Criterios automáticos:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {CRITERIOS_DEFAULT.criterios.map(c => (
                  <li key={c.nombre}>
                    {c.descripcion}: {c.peso}%
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Criterios adicionales */}
          <div className="space-y-2">
            <Label>Criterios adicionales</Label>
            <Textarea
              value={formData.criteriosTexto}
              onChange={(e) => handleChange('criteriosTexto', e.target.value)}
              rows={4}
              maxLength={2000}
              disabled={loading}
            />
          </div>

          {/* Requisitos */}
          <div className="space-y-2">
            <Label>Requisitos de Postulación</Label>
            <Textarea
              value={formData.requisitosTexto}
              onChange={(e) => handleChange('requisitosTexto', e.target.value)}
              rows={4}
              maxLength={2000}
              disabled={loading}
            />
          </div>

          {/* Botones */}
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
