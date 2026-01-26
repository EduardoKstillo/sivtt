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
import { Loader2, Star, Info } from 'lucide-react'
import { postulacionesAPI } from '@api/endpoints/postulaciones'
import { toast } from '@components/ui/use-toast'

const CRITERIOS_EVALUACION = [
  { 
    key: 'viabilidadTecnica', 
    label: 'Viabilidad Técnica',
    desc: 'Factibilidad de la solución propuesta',
    peso: 30
  },
  { 
    key: 'experienciaEquipo', 
    label: 'Experiencia del Equipo',
    desc: 'Capacidad y trayectoria del grupo',
    peso: 25
  },
  { 
    key: 'metodologia', 
    label: 'Metodología',
    desc: 'Claridad del plan de trabajo',
    peso: 20
  },
  { 
    key: 'innovacion', 
    label: 'Innovación',
    desc: 'Originalidad de la propuesta',
    peso: 15
  },
  { 
    key: 'presupuesto', 
    label: 'Presupuesto',
    desc: 'Relación costo-beneficio',
    peso: 10
  }
]

export const EvaluarPostulacionModal = ({ open, onOpenChange, postulacion, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [puntajes, setPuntajes] = useState(
    CRITERIOS_EVALUACION.reduce((acc, criterio) => {
      acc[criterio.key] = ''
      return acc
    }, {})
  )
  const [observaciones, setObservaciones] = useState('')

  if (!postulacion) return null

  const handlePuntajeChange = (key, value) => {
    const numValue = parseFloat(value)
    if (value === '' || (numValue >= 0 && numValue <= 10)) {
      setPuntajes(prev => ({ ...prev, [key]: value }))
    }
  }

  const calcularPuntajeTotal = () => {
    let total = 0
    CRITERIOS_EVALUACION.forEach(criterio => {
      const puntaje = parseFloat(puntajes[criterio.key]) || 0
      total += (puntaje * criterio.peso) / 10
    })
    return total.toFixed(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar que todos los puntajes estén completos
    const puntajesCompletos = CRITERIOS_EVALUACION.every(
      criterio => puntajes[criterio.key] !== ''
    )

    if (!puntajesCompletos) {
      toast({
        variant: "destructive",
        title: "Evaluación incompleta",
        description: "Debe asignar puntaje a todos los criterios"
      })
      return
    }

    setLoading(true)

    try {
      const puntajesNumericos = {}
      Object.keys(puntajes).forEach(key => {
        puntajesNumericos[key] = parseFloat(puntajes[key])
      })

      await postulacionesAPI.evaluar(postulacion.id, {
        puntajes: puntajesNumericos,
        observaciones: observaciones.trim() || undefined
      })

      toast({
        title: "Postulación evaluada",
        description: `Puntaje total: ${calcularPuntajeTotal()}/100`
      })

      onSuccess()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al evaluar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  const puntajeTotal = calcularPuntajeTotal()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluar Postulación</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info del Grupo */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Grupo:</strong> {postulacion.grupo?.nombre}
              <br />
              <strong>Código:</strong> {postulacion.grupo?.codigo}
            </AlertDescription>
          </Alert>

          {/* Criterios de Evaluación */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              Criterios de Evaluación (0-10 puntos cada uno)
            </h4>

            {CRITERIOS_EVALUACION.map((criterio) => (
              <div 
                key={criterio.key}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={criterio.key} className="font-medium">
                        {criterio.label}
                      </Label>
                      <span className="text-xs text-gray-500">
                        (Peso: {criterio.peso}%)
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {criterio.desc}
                    </p>
                  </div>
                  <div className="w-24">
                    <Input
                      id={criterio.key}
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={puntajes[criterio.key]}
                      onChange={(e) => handlePuntajeChange(criterio.key, e.target.value)}
                      placeholder="0.0"
                      className="text-center font-semibold"
                      disabled={loading}
                    />
                  </div>
                </div>
                {puntajes[criterio.key] !== '' && (
                  <p className="text-xs text-gray-500 text-right">
                    Contribución: {((parseFloat(puntajes[criterio.key]) * criterio.peso) / 10).toFixed(2)} puntos
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Puntaje Total */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-600" />
                <span className="font-semibold text-gray-900">
                  Puntaje Total
                </span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {puntajeTotal}/100
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">
              Observaciones y recomendaciones
            </Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Agregue comentarios sobre la evaluación..."
              rows={4}
              maxLength={1000}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-right">
              {observaciones.length}/1000
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Evaluación'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}