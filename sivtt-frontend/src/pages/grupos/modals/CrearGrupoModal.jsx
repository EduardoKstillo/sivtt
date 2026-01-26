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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Loader2 } from 'lucide-react'
import { gruposAPI } from '@api/endpoints/grupos'
import { toast } from '@components/ui/use-toast'

const LINEAS_INVESTIGACION = [
  'Inteligencia Artificial',
  'Biotecnología',
  'Energías Renovables',
  'Nanotecnología',
  'Ciencia de Materiales',
  'Ingeniería Biomédica',
  'Desarrollo de Software',
  'Robótica',
  'Otro'
]

export const CrearGrupoModal = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    lineaInvestigacion: '',
    facultad: '',
    departamento: '',
    descripcion: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nombre || !formData.codigo) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Nombre y código son obligatorios"
      })
      return
    }

    setLoading(true)

    try {
      await gruposAPI.create({
        nombre: formData.nombre.trim(),
        codigo: formData.codigo.trim(),
        lineaInvestigacion: formData.lineaInvestigacion || undefined,
        facultad: formData.facultad.trim() || undefined,
        departamento: formData.departamento.trim() || undefined,
        descripcion: formData.descripcion.trim() || undefined
      })

      toast({
        title: "Grupo creado",
        description: "El grupo de investigación fue registrado exitosamente"
      })

      onSuccess()
      setFormData({
        nombre: '',
        codigo: '',
        lineaInvestigacion: '',
        facultad: '',
        departamento: '',
        descripcion: ''
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al crear grupo",
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
          <DialogTitle>Crear Grupo de Investigación</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre del grupo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Grupo de Innovación en IA"
                disabled={loading}
              />
            </div>

            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="codigo">
                Código <span className="text-red-500">*</span>
              </Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
                placeholder="GI-IA-001"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Línea de Investigación */}
            <div className="space-y-2">
              <Label htmlFor="lineaInvestigacion">Línea de Investigación</Label>
              <Select
                value={formData.lineaInvestigacion}
                onValueChange={(value) => handleChange('lineaInvestigacion', value)}
                disabled={loading}
              >
                <SelectTrigger id="lineaInvestigacion">
                  <SelectValue placeholder="Seleccione la línea" />
                </SelectTrigger>
                <SelectContent>
                  {LINEAS_INVESTIGACION.map(linea => (
                    <SelectItem key={linea} value={linea}>
                      {linea}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Facultad */}
            <div className="space-y-2">
              <Label htmlFor="facultad">Facultad</Label>
              <Input
                id="facultad"
                value={formData.facultad}
                onChange={(e) => handleChange('facultad', e.target.value)}
                placeholder="Ingeniería de Producción y Servicios"
                disabled={loading}
              />
            </div>
          </div>

          {/* Departamento */}
          <div className="space-y-2">
            <Label htmlFor="departamento">Departamento Académico</Label>
            <Input
              id="departamento"
              value={formData.departamento}
              onChange={(e) => handleChange('departamento', e.target.value)}
              placeholder="Ingeniería de Sistemas e Informática"
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
              placeholder="Descripción de las áreas de investigación del grupo..."
              rows={4}
              maxLength={1000}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.descripcion.length}/1000
            </p>
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
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Grupo'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}