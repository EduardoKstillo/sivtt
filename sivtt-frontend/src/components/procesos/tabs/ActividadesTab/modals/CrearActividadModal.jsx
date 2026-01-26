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
import { Checkbox } from '@components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from '@components/ui/use-toast'
import { TIPO_ACTIVIDAD, FLUJOS_FASES } from '@utils/constants'

export const CrearActividadModal = ({ open, onOpenChange, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fase: '',
    tipo: '',
    nombre: '',
    descripcion: '',
    obligatoria: false,
    fechaLimite: ''
  })
  const [errors, setErrors] = useState({})

  const fasesAbiertas = FLUJOS_FASES[proceso.tipoActivo].filter(fase => 
    fase === proceso.faseActual // Solo fase actual (en producción vendría del backend)
  )

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.fase) newErrors.fase = 'La fase es obligatoria'
    if (!formData.tipo) newErrors.tipo = 'El tipo es obligatorio'
    if (!formData.nombre || formData.nombre.trim().length < 5) {
      newErrors.nombre = 'El nombre debe tener al menos 5 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      await actividadesAPI.create(proceso.id, {
        fase: formData.fase,
        tipo: formData.tipo,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        obligatoria: formData.obligatoria,
        fechaLimite: formData.fechaLimite || undefined
      })

      toast({
        title: "Actividad creada",
        description: "La actividad fue creada exitosamente"
      })

      onSuccess()
      setFormData({
        fase: '',
        tipo: '',
        nombre: '',
        descripcion: '',
        obligatoria: false,
        fechaLimite: ''
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al crear actividad",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Actividad</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              Las actividades se crean en la fase actual del proceso. Podrás asignar responsables y revisores después de crearla.
            </AlertDescription>
          </Alert>

          {/* Fase */}
          <div className="space-y-2">
            <Label htmlFor="fase">
              Fase <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.fase}
              onValueChange={(value) => handleChange('fase', value)}
              disabled={loading}
            >
              <SelectTrigger id="fase" className={errors.fase && "border-red-500"}>
                <SelectValue placeholder="Seleccione la fase" />
              </SelectTrigger>
              <SelectContent>
                {fasesAbiertas.map(fase => (
                  <SelectItem key={fase} value={fase}>
                    {fase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fase && <p className="text-xs text-red-500">{errors.fase}</p>}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleChange('tipo', value)}
              disabled={loading}
            >
              <SelectTrigger id="tipo" className={errors.tipo && "border-red-500"}>
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TIPO_ACTIVIDAD.DOCUMENTO}>📄 Documento</SelectItem>
                <SelectItem value={TIPO_ACTIVIDAD.REUNION}>👥 Reunión</SelectItem>
                <SelectItem value={TIPO_ACTIVIDAD.TAREA}>✅ Tarea</SelectItem>
                <SelectItem value={TIPO_ACTIVIDAD.REVISION}>🔍 Revisión</SelectItem>
                <SelectItem value={TIPO_ACTIVIDAD.OTRO}>📋 Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-xs text-red-500">{errors.tipo}</p>}
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Elaborar informe técnico de resultados"
              maxLength={200}
              disabled={loading}
              className={errors.nombre && "border-red-500"}
            />
            {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Describa los detalles de la actividad..."
              rows={4}
              maxLength={500}
              disabled={loading}
            />
          </div>

          {/* Fecha Límite */}
          <div className="space-y-2">
            <Label htmlFor="fechaLimite">Fecha límite (opcional)</Label>
            <Input
              id="fechaLimite"
              type="date"
              value={formData.fechaLimite}
              onChange={(e) => handleChange('fechaLimite', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Obligatoria */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="obligatoria"
              checked={formData.obligatoria}
              onCheckedChange={(checked) => handleChange('obligatoria', checked)}
              disabled={loading}
            />
            <Label
              htmlFor="obligatoria"
              className="text-sm font-normal cursor-pointer"
            >
              Esta es una actividad obligatoria (debe estar aprobada para cerrar la fase)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
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
                'Crear Actividad'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}