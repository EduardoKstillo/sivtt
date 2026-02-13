import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Info } from 'lucide-react'
import { postulacionesAPI } from '@api/endpoints/postulaciones'
import { toast } from '@components/ui/use-toast'

// 🔥 Criterios según el schema
const CRITERIOS_EVALUACION = [
  { key: 'viabilidadTecnica', label: 'Viabilidad Técnica', peso: 30 },
  { key: 'experienciaEquipo', label: 'Experiencia del Equipo', peso: 25 },
  { key: 'metodologia', label: 'Metodología', peso: 20 },
  { key: 'innovacion', label: 'Innovación', peso: 15 },
  { key: 'presupuesto', label: 'Presupuesto', peso: 10 }
]

export const EvaluarPostulacionModal = ({ open, onOpenChange, postulacion, convocatoria, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [puntajes, setPuntajes] = useState({})
  const [observaciones, setObservaciones] = useState('')
  const [puntajeTotal, setPuntajeTotal] = useState(0)

  // Inicializar puntajes al abrir el modal
  useEffect(() => {
    if (open && postulacion) {
      if (postulacion.puntajesDetalle) {
        // Si ya fue evaluada, cargar puntajes previos
        setPuntajes(postulacion.puntajesDetalle)
        setPuntajeTotal(postulacion.puntajeTotal || 0)
        setObservaciones(postulacion.observaciones || '')
      } else {
        // Inicializar en 0
        const initialPuntajes = {}
        CRITERIOS_EVALUACION.forEach(criterio => {
          initialPuntajes[criterio.key] = 0
        })
        setPuntajes(initialPuntajes)
        setPuntajeTotal(0)
        setObservaciones('')
      }
    }
  }, [open, postulacion])

  // Calcular puntaje total cuando cambian los puntajes
  useEffect(() => {
    const total = CRITERIOS_EVALUACION.reduce((sum, criterio) => {
      const puntajeCriterio = parseFloat(puntajes[criterio.key] || 0)
      const puntajePonderado = (puntajeCriterio * criterio.peso) / 100
      return sum + puntajePonderado
    }, 0)
    setPuntajeTotal(Math.round(total * 10) / 10) // Redondear a 1 decimal
  }, [puntajes])

  const handlePuntajeChange = (key, value) => {
    const numValue = parseFloat(value) || 0
    if (numValue >= 0 && numValue <= 100) {
      setPuntajes(prev => ({ ...prev, [key]: numValue }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar que todos los criterios tengan puntaje
    const criteriosSinEvaluar = CRITERIOS_EVALUACION.filter(
      c => !puntajes[c.key] || puntajes[c.key] === 0
    )

    if (criteriosSinEvaluar.length > 0) {
      toast({
        variant: "destructive",
        title: "Evaluación incompleta",
        description: "Debes asignar puntaje a todos los criterios"
      })
      return
    }

    setLoading(true)

    try {
      await postulacionesAPI.evaluar(postulacion.id, {
        puntajesDetalle: puntajes,
        puntajeTotal: puntajeTotal,
        observaciones: observaciones.trim() || undefined
      })

      toast({
        title: "Postulación evaluada",
        description: `Puntaje total: ${puntajeTotal}/100`
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

  if (!postulacion) return null

  const puntajeMinimo = convocatoria.criteriosSeleccion?.puntajeMinimo || 60

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Evaluar Postulación - {postulacion.grupo.nombre}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              Puntaje mínimo requerido: <strong>{puntajeMinimo}/100</strong>
              <br />
              Evalúa cada criterio de 0 a 100. El puntaje final se calcula según el peso de cada criterio.
            </AlertDescription>
          </Alert>

          {/* Criterios de Evaluación */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">
              Criterios de Evaluación
            </h3>

            {CRITERIOS_EVALUACION.map(criterio => (
              <div key={criterio.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={criterio.key}>
                    {criterio.label}
                    <span className="text-sm text-gray-500 ml-2">
                      (Peso: {criterio.peso}%)
                    </span>
                  </Label>
                  <span className="text-sm font-medium text-blue-600">
                    {((puntajes[criterio.key] || 0) * criterio.peso / 100).toFixed(1)} pts
                  </span>
                </div>
                <Input
                  id={criterio.key}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={puntajes[criterio.key] || 0}
                  onChange={(e) => handlePuntajeChange(criterio.key, e.target.value)}
                  disabled={loading}
                  placeholder="0 - 100"
                />
              </div>
            ))}
          </div>

          {/* Puntaje Total */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Puntaje Total Calculado</p>
                <p className="text-4xl font-bold text-gray-900">
                  {puntajeTotal.toFixed(1)}/100
                </p>
              </div>
              <div className="text-right">
                {puntajeTotal >= puntajeMinimo ? (
                  <div className="text-green-600">
                    <p className="text-sm font-medium">✅ Supera mínimo</p>
                    <p className="text-xs">({puntajeMinimo} pts requeridos)</p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p className="text-sm font-medium">❌ Bajo mínimo</p>
                    <p className="text-xs">({puntajeMinimo} pts requeridos)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Desglose visual */}
            <div className="mt-4 space-y-1">
              {CRITERIOS_EVALUACION.map(criterio => {
                const puntajePonderado = (puntajes[criterio.key] || 0) * criterio.peso / 100
                return (
                  <div key={criterio.key} className="flex items-center gap-2 text-xs">
                    <span className="w-32 text-gray-600">{criterio.label}:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(puntajes[criterio.key] || 0)}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-medium text-gray-900">
                      {puntajePonderado.toFixed(1)} pts
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Comentarios adicionales sobre la evaluación..."
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