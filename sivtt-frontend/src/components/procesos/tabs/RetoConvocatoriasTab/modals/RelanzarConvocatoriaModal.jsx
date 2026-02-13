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

  // Resetear formulario cuando se abre/cierra o cambia la convocatoria
  useEffect(() => {
    if (open) {
      setFormData({
        fechaApertura: '',
        fechaCierre: '',
        motivoRelanzamiento: ''
      })
    }
  }, [open, convocatoria])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Intentando relanzar convocatoria...", formData)

    // 1. Validar campos vacíos
    if (!formData.fechaApertura || !formData.fechaCierre || !formData.motivoRelanzamiento) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor, complete todos los campos."
      })
      return
    }

    // 2. Validar longitud del motivo (Backend Joi min(10))
    if (formData.motivoRelanzamiento.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Motivo muy corto",
        description: "El motivo del relanzamiento debe tener al menos 10 caracteres."
      })
      return
    }

    // 3. Validar fechas
    const apertura = new Date(formData.fechaApertura)
    const cierre = new Date(formData.fechaCierre)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0) // Ignorar hora actual para permitir selección de "hoy"

    // Ajuste de zona horaria para comparación justa con "hoy"
    const aperturaMidnight = new Date(apertura)
    aperturaMidnight.setHours(24, 0, 0, 0) // Margen para asegurar que pase si es hoy

    if (isNaN(apertura.getTime()) || isNaN(cierre.getTime())) {
      toast({ variant: "destructive", title: "Fechas inválidas" })
      return
    }

    // Validación: Apertura no puede ser pasado (ayer o antes)
    if (apertura < hoy) {
      toast({
        variant: "destructive",
        title: "Fecha inválida",
        description: "La fecha de apertura no puede ser anterior a hoy."
      })
      return
    }

    // Validación: Cierre debe ser después de apertura
    if (cierre <= apertura) {
      toast({
        variant: "destructive",
        title: "Rango inválido",
        description: "La fecha de cierre debe ser posterior a la fecha de apertura."
      })
      return
    }

    setLoading(true)

    try {
      await convocatoriasAPI.relanzar(convocatoria.id, {
        fechaApertura: formData.fechaApertura,
        fechaCierre: formData.fechaCierre,
        motivoRelanzamiento: formData.motivoRelanzamiento.trim()
        // No enviamos 'modificaciones' porque este modal no las gestiona,
        // el backend usará los criterios originales por defecto.
      })

      toast({
        title: "Convocatoria relanzada",
        description: "Se creó una nueva convocatoria en estado BORRADOR"
      })

      onSuccess()
      onOpenChange(false) // Cerrar modal explícitamente
      
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error al relanzar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!convocatoria) return null

  // Calcular el nuevo código visualmente para informar al usuario
  const nuevoCodigo = convocatoria.codigo 
    ? `${convocatoria.codigo.split('-R')[0]}-R${(convocatoria.numeroRelanzamiento || 0) + 1}`
    : '...'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Relanzar Convocatoria</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              Se creará una nueva convocatoria basada en <strong>{convocatoria.codigo}</strong>.
              <br/>
              El nuevo código será: <strong>{nuevoCodigo}</strong>
            </AlertDescription>
          </Alert>

          {/* Warning */}
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900 text-sm">
              Esta acción copiará los criterios y requisitos de la convocatoria original. 
              Solo se puede relanzar si la anterior está cerrada y desierta (sin seleccionados).
            </AlertDescription>
          </Alert>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivoRelanzamiento">
              Motivo del Relanzamiento <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motivoRelanzamiento"
              value={formData.motivoRelanzamiento}
              onChange={(e) => handleChange('motivoRelanzamiento', e.target.value)}
              placeholder="Explique por qué se relanza (ej: Convocatoria desierta, ampliación de alcance...)"
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.motivoRelanzamiento.length}/500 (Mínimo 10 caracteres)
            </p>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaApertura">
                Nueva Fecha de Apertura <span className="text-red-500">*</span>
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
                Nueva Fecha de Cierre <span className="text-red-500">*</span>
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
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Relanzando...
                </>
              ) : (
                'Relanzar Convocatoria'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}