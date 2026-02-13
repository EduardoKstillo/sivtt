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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fechaApertura || !formData.fechaCierre || !formData.motivoRelanzamiento) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Complete todos los campos"
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
      await convocatoriasAPI.relanzar(convocatoria.id, {
        fechaApertura: formData.fechaApertura,
        fechaCierre: formData.fechaCierre,
        motivoRelanzamiento: formData.motivoRelanzamiento.trim()
      })

      toast({
        title: "Convocatoria relanzada",
        description: "Se creó una nueva convocatoria en estado BORRADOR"
      })

      onSuccess()
      
      setFormData({
        fechaApertura: '',
        fechaCierre: '',
        motivoRelanzamiento: ''
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al relanzar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

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
              El nuevo código será <strong>{convocatoria.codigo.split('-R')[0]}-R{convocatoria.numeroRelanzamiento + 1}</strong>
            </AlertDescription>
          </Alert>

          {/* Warning */}
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900 text-sm">
              Solo se puede relanzar si NO hay ninguna postulación seleccionada.
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
              placeholder="Explique por qué se relanza la convocatoria..."
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.motivoRelanzamiento.length}/500
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