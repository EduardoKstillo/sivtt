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
import { Loader2 } from 'lucide-react'
import { procesosAPI } from '@api/endpoints/procesos'
import { toast } from '@components/ui/use-toast'

export const EditProcesoModal = ({ open, onOpenChange, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: proceso.titulo,
    descripcion: proceso.descripcion || ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.titulo || formData.titulo.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "El título debe tener al menos 10 caracteres"
      })
      return
    }

    setLoading(true)

    try {
      const { data } = await procesosAPI.update(proceso.id, {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim() || undefined
      })

      toast({
        title: "Proceso actualizado",
        description: "La información se actualizó correctamente"
      })

      onSuccess(data.data)
    } catch (error) {
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Información del Proceso</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              maxLength={200}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.titulo.length}/200
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              rows={6}
              maxLength={1000}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.descripcion.length}/1000
            </p>
          </div>

          <div className="flex justify-end gap-3">
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