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
import { retosAPI } from '@api/endpoints/retos'
import { toast } from '@components/ui/use-toast'

export const EditarRetoModal = ({ open, onOpenChange, reto, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    descripcion: reto.descripcion || '',
    alcance: reto.alcance || '',
    requisitos: reto.requisitos || '',
    presupuestoEstimado: reto.presupuestoEstimado || '',
    duracionEstimada: reto.duracionEstimada || '',
    equipoDisponible: reto.equipoDisponible || '',
    resultadosEsperados: reto.resultadosEsperados || ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.descripcion.trim()) {
      toast({
        variant: "destructive",
        title: "Descripción requerida",
        description: "La descripción del reto es obligatoria"
      })
      return
    }

    setLoading(true)

    try {
      await retosAPI.update(proceso.id, {
        descripcion: formData.descripcion.trim(),
        alcance: formData.alcance.trim() || undefined,
        requisitos: formData.requisitos.trim() || undefined,
        presupuestoEstimado: formData.presupuestoEstimado ? parseFloat(formData.presupuestoEstimado) : undefined,
        duracionEstimada: formData.duracionEstimada ? parseInt(formData.duracionEstimada) : undefined,
        equipoDisponible: formData.equipoDisponible.trim() || undefined,
        resultadosEsperados: formData.resultadosEsperados.trim() || undefined
      })

      toast({
        title: "Reto actualizado",
        description: "La información del reto fue actualizada exitosamente"
      })

      onSuccess()
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Reto Empresarial</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción del problema <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Describa el problema o necesidad empresarial..."
              rows={6}
              maxLength={2000}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.descripcion.length}/2000
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alcance">Alcance del proyecto</Label>
              <Textarea
                id="alcance"
                value={formData.alcance}
                onChange={(e) => handleChange('alcance', e.target.value)}
                placeholder="Defina el alcance del proyecto..."
                rows={4}
                maxLength={1000}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requisitos">Requisitos técnicos</Label>
              <Textarea
                id="requisitos"
                value={formData.requisitos}
                onChange={(e) => handleChange('requisitos', e.target.value)}
                placeholder="Liste los requisitos técnicos..."
                rows={4}
                maxLength={1000}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="presupuestoEstimado">Presupuesto estimado (S/.)</Label>
              <Input
                id="presupuestoEstimado"
                type="number"
                min="0"
                step="0.01"
                value={formData.presupuestoEstimado}
                onChange={(e) => handleChange('presupuestoEstimado', e.target.value)}
                placeholder="50000.00"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracionEstimada">Duración estimada (meses)</Label>
              <Input
                id="duracionEstimada"
                type="number"
                min="1"
                value={formData.duracionEstimada}
                onChange={(e) => handleChange('duracionEstimada', e.target.value)}
                placeholder="6"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipoDisponible">Equipo disponible</Label>
              <Input
                id="equipoDisponible"
                value={formData.equipoDisponible}
                onChange={(e) => handleChange('equipoDisponible', e.target.value)}
                placeholder="2 ingenieros, 1 técnico"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resultadosEsperados">Resultados esperados</Label>
            <Textarea
              id="resultadosEsperados"
              value={formData.resultadosEsperados}
              onChange={(e) => handleChange('resultadosEsperados', e.target.value)}
              placeholder="Describa los entregables y resultados esperados..."
              rows={4}
              maxLength={1000}
              disabled={loading}
            />
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