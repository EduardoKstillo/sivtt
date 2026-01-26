import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Loader2,
  Undo2
} from 'lucide-react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from '@components/ui/use-toast'
import { TRANSICIONES_ACTIVIDAD } from '@utils/constants'

export const ActividadEstadoMachine = ({ actividad, onUpdate }) => {
  const [loading, setLoading] = useState(false)

  const transicionesDisponibles = TRANSICIONES_ACTIVIDAD[actividad.estado] || []

  // ✅ CORRECCIÓN: Calcular estadísticas desde el array de evidencias (getById)
  // El backend devuelve un array 'evidencias' con objetos completos
  const evidenciasArray = Array.isArray(actividad.evidencias) ? actividad.evidencias : []
  
  const evidenciasPendientes = evidenciasArray.filter(e => e.estado !== 'APROBADA').length
  const evidenciasRechazadas = evidenciasArray.filter(e => e.estado === 'RECHAZADA').length
  
  // Regla de negocio: Solo aprobar si está en LISTA_PARA_CIERRE y 0 pendientes/rechazadas
  const puedeAprobar = actividad.estado === 'LISTA_PARA_CIERRE' && evidenciasPendientes === 0

  const handleChangeEstado = async (nuevoEstado) => {
    setLoading(true)
    try {
      // Pedir observación si es rechazo u observación (podrías agregar modal aquí)
      const observaciones = nuevoEstado === 'OBSERVADA' ? 'Cambio de estado manual' : undefined

      const { data } = await actividadesAPI.changeEstado(actividad.id, {
        nuevoEstado,
        observaciones
      })

      toast({
        title: "Estado actualizado",
        description: `La actividad cambió a ${nuevoEstado.replace(/_/g, ' ')}`
      })

      onUpdate(data.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cambiar estado",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAprobar = async () => {
    setLoading(true)
    try {
      const { data } = await actividadesAPI.aprobar(actividad.id)

      toast({
        title: "Actividad aprobada",
        description: "La actividad fue completada exitosamente"
      })

      onUpdate(data.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al aprobar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadgeClass = (estado) => {
    const classes = {
      APROBADA: 'bg-green-100 text-green-700 border-green-200',
      EN_PROGRESO: 'bg-blue-100 text-blue-700 border-blue-200',
      EN_REVISION: 'bg-amber-100 text-amber-700 border-amber-200',
      OBSERVADA: 'bg-orange-100 text-orange-700 border-orange-200',
      LISTA_PARA_CIERRE: 'bg-purple-100 text-purple-700 border-purple-200',
      CREADA: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return classes[estado] || classes.CREADA
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Indicador Visual de Estado */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado Actual</span>
          <div className="mt-1">
            <Badge className={`text-sm px-3 py-1 ${getEstadoBadgeClass(actividad.estado)}`}>
                {actividad.estado.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
        
        {/* Fecha de cierre si aplica */}
        {actividad.estado === 'APROBADA' && (
            <div className="text-right">
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Completada
                </span>
            </div>
        )}
      </div>

      {/* Alertas de Validación para Cierre */}
      {actividad.estado === 'LISTA_PARA_CIERRE' && (
        <Alert className={puedeAprobar ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}>
          {puedeAprobar ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-orange-600" />
          )}
          <AlertDescription className={puedeAprobar ? 'text-green-900' : 'text-orange-900'}>
            {puedeAprobar ? (
              'Todas las evidencias están aprobadas. La actividad está lista para ser aprobada oficialmente.'
            ) : (
              <div className="text-sm">
                <strong>No se puede aprobar aún:</strong>
                <ul className="list-disc list-inside mt-1 ml-1 space-y-0.5">
                  {evidenciasPendientes > 0 && (
                    <li>Faltan aprobar {evidenciasPendientes} evidencia(s)</li>
                  )}
                  {evidenciasRechazadas > 0 && (
                    <li>Hay {evidenciasRechazadas} evidencia(s) rechazada(s)</li>
                  )}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Acciones Disponibles */}
      {transicionesDisponibles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide text-gray-500">
            Siguientes Pasos
          </h4>

          <div className="grid gap-2">
            {transicionesDisponibles.map((nuevoEstado) => {
              // Estilizar diferente si es avanzar o retroceder
              const esRetroceso = ['OBSERVADA', 'EN_PROGRESO'].includes(nuevoEstado) && actividad.estado !== 'CREADA'
              
              return (
                <Button
                  key={nuevoEstado}
                  variant={esRetroceso ? "outline" : "default"}
                  className={`w-full justify-between group ${
                    esRetroceso 
                        ? "hover:text-orange-700 hover:border-orange-200 hover:bg-orange-50" 
                        : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                  onClick={() => handleChangeEstado(nuevoEstado)}
                  disabled={loading}
                >
                  <span className="flex items-center gap-2">
                    {esRetroceso && <Undo2 className="h-4 w-4 text-orange-500" />}
                    Mover a: <span className="font-semibold">{nuevoEstado.replace(/_/g, ' ')}</span>
                  </span>
                  {!esRetroceso && <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Acción Final: Aprobar */}
      {actividad.estado === 'LISTA_PARA_CIERRE' && (
        <div className="pt-4 border-t border-gray-100">
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-sm"
            size="lg"
            onClick={handleAprobar}
            disabled={loading || !puedeAprobar}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Aprobar Actividad Final
              </>
            )}
          </Button>
        </div>
      )}

      {/* Info Final */}
      {actividad.estado === 'APROBADA' && (
        <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-sm text-gray-500">
                Esta actividad ha finalizado su ciclo de vida.
            </p>
        </div>
      )}
    </div>
  )
}