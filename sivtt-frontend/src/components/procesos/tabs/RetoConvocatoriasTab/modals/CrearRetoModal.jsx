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
import { retosAPI } from '@api/endpoints/retos'
import { toast } from '@components/ui/use-toast'

export const CrearRetoModal = ({ open, onOpenChange, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    empresaSolicitante: '',
    descripcionProblema: '',
    alcance: '',
    requisitos: '',
    presupuestoEstimado: '',
    duracionEstimada: '',
    equipoDisponible: '',
    resultadosEsperados: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.empresaSolicitante || !formData.descripcionProblema) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Empresa solicitante y descripción del problema son obligatorios"
      })
      return
    }

    setLoading(true)

    try {
      await retosAPI.create(proceso.id, {
        empresaSolicitante: formData.empresaSolicitante.trim(),
        descripcionProblema: formData.descripcionProblema.trim(),
        alcance: formData.alcance.trim() || undefined,
        requisitos: formData.requisitos.trim() || undefined,
        presupuestoEstimado: formData.presupuestoEstimado ? parseFloat(formData.presupuestoEstimado) : undefined,
        duracionEstimada: formData.duracionEstimada ? parseInt(formData.duracionEstimada) : undefined,
        equipoDisponible: formData.equipoDisponible.trim() || undefined,
        resultadosEsperados: formData.resultadosEsperados.trim() || undefined
      })

      toast({
        title: "Reto creado",
        description: "El reto empresarial fue creado exitosamente"
      })

      onSuccess()
      
      // Resetear form
      setFormData({
        empresaSolicitante: '',
        descripcionProblema: '',
        alcance: '',
        requisitos: '',
        presupuestoEstimado: '',
        duracionEstimada: '',
        equipoDisponible: '',
        resultadosEsperados: ''
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al crear reto",
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
          <DialogTitle>Crear Reto Empresarial</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              Define el problema tecnológico que la empresa necesita resolver.
              Este reto será publicado en las convocatorias para grupos de investigación.
            </AlertDescription>
          </Alert>

          {/* Empresa Solicitante */}
          <div className="space-y-2">
            <Label htmlFor="empresaSolicitante">
              Empresa Solicitante <span className="text-red-500">*</span>
            </Label>
            <Input
              id="empresaSolicitante"
              value={formData.empresaSolicitante}
              onChange={(e) => handleChange('empresaSolicitante', e.target.value)}
              placeholder="Nombre de la empresa que solicita el reto"
              disabled={loading}
            />
          </div>

          {/* Descripción del Problema */}
          <div className="space-y-2">
            <Label htmlFor="descripcionProblema">
              Descripción del Problema <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descripcionProblema"
              value={formData.descripcionProblema}
              onChange={(e) => handleChange('descripcionProblema', e.target.value)}
              placeholder="Describa detalladamente el problema tecnológico a resolver..."
              rows={6}
              maxLength={2000}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.descripcionProblema.length}/2000
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alcance */}
            <div className="space-y-2">
              <Label htmlFor="alcance">Alcance del Proyecto</Label>
              <Textarea
                id="alcance"
                value={formData.alcance}
                onChange={(e) => handleChange('alcance', e.target.value)}
                placeholder="Define el alcance esperado..."
                rows={4}
                maxLength={1000}
                disabled={loading}
              />
            </div>

            {/* Requisitos */}
            <div className="space-y-2">
              <Label htmlFor="requisitos">Requisitos Técnicos</Label>
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
            {/* Presupuesto */}
            <div className="space-y-2">
              <Label htmlFor="presupuestoEstimado">Presupuesto Estimado (S/.)</Label>
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

            {/* Duración */}
            <div className="space-y-2">
              <Label htmlFor="duracionEstimada">Duración Estimada (meses)</Label>
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

            {/* Equipo */}
            <div className="space-y-2">
              <Label htmlFor="equipoDisponible">Equipo Disponible</Label>
              <Input
                id="equipoDisponible"
                value={formData.equipoDisponible}
                onChange={(e) => handleChange('equipoDisponible', e.target.value)}
                placeholder="2 ingenieros, 1 técnico"
                disabled={loading}
              />
            </div>
          </div>

          {/* Resultados Esperados */}
          <div className="space-y-2">
            <Label htmlFor="resultadosEsperados">Resultados Esperados</Label>
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
                'Crear Reto'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}