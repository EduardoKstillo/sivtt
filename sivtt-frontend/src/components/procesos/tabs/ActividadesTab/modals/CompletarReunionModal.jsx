import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { reunionesAPI } from '@api/endpoints/reuniones'
import { toast } from '@components/ui/use-toast'

export const CompletarReunionModal = ({ open, onOpenChange, reunion, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    acuerdos: '',
    observaciones: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    try {
      await reunionesAPI.complete(reunion.id, {
        acuerdos: formData.acuerdos.trim() || undefined,
        observaciones: formData.observaciones.trim() || undefined
      })

      toast({
        title: "Reunión completada",
        description: "Los resultados fueron registrados exitosamente"
      })

      onSuccess()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al completar reunión",
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
          <DialogTitle>Completar Reunión</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="acuerdos">Acuerdos y compromisos</Label>
            <Textarea
              id="acuerdos"
              value={formData.acuerdos}
              onChange={(e) => handleChange('acuerdos', e.target.value)}
              placeholder="Describa los acuerdos alcanzados..."
              rows={6}
              maxLength={1000}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={4}
              maxLength={500}
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
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completando...
                </>
              ) : (
                'Completar Reunión'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}