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
import { reunionesAPI } from '@api/endpoints/reuniones'
import { toast } from '@components/ui/use-toast'

export const CrearReunionModal = ({ open, onOpenChange, actividad, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fechaReunion: '',
    duracionMinutos: '',
    lugar: '',
    enlaceVirtual: '',
    agenda: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fechaReunion) {
      toast({
        variant: "destructive",
        title: "Fecha requerida",
        description: "Debe especificar la fecha y hora de la reunión"
      })
      return
    }

    setLoading(true)

    try {
      await reunionesAPI.create(actividad.id, {
        fechaReunion: formData.fechaReunion,
        duracionMinutos: formData.duracionMinutos ? parseInt(formData.duracionMinutos) : undefined,
        lugar: formData.lugar.trim() || undefined,
        enlaceVirtual: formData.enlaceVirtual.trim() || undefined,
        agenda: formData.agenda.trim() || undefined
      })

      toast({
        title: "Reunión creada",
        description: "La reunión fue programada exitosamente"
      })

      onSuccess()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al crear reunión",
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
          <DialogTitle>Programar Reunión</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fechaReunion">
              Fecha y hora <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fechaReunion"
              type="datetime-local"
              value={formData.fechaReunion}
              onChange={(e) => handleChange('fechaReunion', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracionMinutos">Duración (minutos)</Label>
            <Input
              id="duracionMinutos"
              type="number"
              value={formData.duracionMinutos}
              onChange={(e) => handleChange('duracionMinutos', e.target.value)}
              placeholder="60"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lugar">Lugar</Label>
            <Input
              id="lugar"
              value={formData.lugar}
              onChange={(e) => handleChange('lugar', e.target.value)}
              placeholder="Sala de reuniones, Edificio A"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="enlaceVirtual">Enlace virtual</Label>
            <Input
              id="enlaceVirtual"
              type="url"
              value={formData.enlaceVirtual}
              onChange={(e) => handleChange('enlaceVirtual', e.target.value)}
              placeholder="https://meet.google.com/..."
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda">Agenda</Label>
            <Textarea
              id="agenda"
              value={formData.agenda}
              onChange={(e) => handleChange('agenda', e.target.value)}
              placeholder="Temas a tratar..."
              rows={4}
              disabled={loading}
            />
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
                  Creando...
                </>
              ) : (
                'Crear Reunión'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}