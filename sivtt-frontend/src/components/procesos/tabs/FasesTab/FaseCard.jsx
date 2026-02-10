import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Circle, 
  Clock,
  Lock,
  TrendingUp,
  History,
  RefreshCcw // Icono para indicar ciclos/reintentos
} from 'lucide-react'
import { FaseActividadesList } from './FaseActividadesList'
import { DecisionFaseButtons } from './DecisionFaseButtons'
import { useFaseDetail } from '@hooks/useFaseDetail'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { formatDate } from '@utils/formatters'
import { TIPO_ACTIVO } from '@utils/constants'
import { cn } from '@/lib/utils'

// Etiquetas legibles para los ENUMS
const FASE_LABELS = {
  CARACTERIZACION: 'Caracterización',
  ENRIQUECIMIENTO: 'Enriquecimiento',
  MATCH: 'Match',
  ESCALAMIENTO: 'Escalamiento',
  TRANSFERENCIA: 'Transferencia',
  FORMULACION_RETO: 'Formulación de Reto',
  CONVOCATORIA: 'Convocatoria',
  POSTULACION: 'Postulación',
  SELECCION: 'Selección',
  ANTEPROYECTO: 'Anteproyecto',
  EJECUCION: 'Ejecución',
  CIERRE: 'Cierre'
}

export const FaseCard = ({ 
  intentos = [], // Array con todas las versiones de esta fase
  faseVigente,   // El objeto fase más reciente (para mostrar en header colapsado)
  nombreFase, 
  isExpanded, 
  isActual, 
  isCompleted, 
  isBlocked,
  onToggle,
  proceso,
  onUpdate,
  onRefresh
}) => {
  // Estado para controlar qué ciclo estamos viendo (por defecto el último/vigente)
  const [selectedFaseId, setSelectedFaseId] = useState(null)

  // Sincronizar selección cuando cambian los datos o se expande
  useEffect(() => {
    if (intentos.length > 0) {
      // Por defecto seleccionamos el último (el actual o el último cerrado)
      const ultimoIntento = intentos[intentos.length - 1]
      setSelectedFaseId(ultimoIntento.id)
    } else if (faseVigente) {
      setSelectedFaseId(faseVigente.id)
    }
  }, [intentos.length, isExpanded, faseVigente])

  // Identificar si estamos viendo historial antiguo
  const isViewingHistory = faseVigente && selectedFaseId !== faseVigente.id
  const hasHistory = intentos.length > 1

  // 🔹 Hook actualizado: Ahora le pasamos el ID específico que queremos ver
  const { faseDetail, loading } = useFaseDetail(
    proceso.id, 
    nombreFase, 
    isExpanded && !!selectedFaseId,
    selectedFaseId // Nuevo parámetro para el hook
  )

  // Decisiones de la versión específica que estamos viendo
  const decisionTomada = faseDetail?.decisiones?.[0]

  const getStatusIcon = () => {
    if (isCompleted) return CheckCircle2
    if (isActual) return Clock
    if (isBlocked) return Lock
    return Circle
  }

  const getStatusColor = () => {
    if (isCompleted) return 'text-green-600'
    if (isActual) return 'text-blue-600'
    if (isBlocked) return 'text-gray-400'
    return 'text-gray-300'
  }

  const StatusIcon = getStatusIcon()
  const isPatente = proceso.tipoActivo === TIPO_ACTIVO.PATENTE

  // Usamos faseVigente para la metadata del header (siempre visible)
  const faseHeader = faseVigente || {} 

  return (
    <Card className={cn(
      "transition-all",
      isActual && "ring-2 ring-blue-600 shadow-lg",
      isBlocked && "opacity-60"
    )}>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors py-4"
        onClick={(!isBlocked && (intentos.length > 0 || faseVigente)) ? onToggle : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">

            {/* Status Icon */}
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              isCompleted && "bg-green-50",
              isActual && "bg-blue-50",
              isBlocked && "bg-gray-50"
            )}>
              <StatusIcon className={cn("h-6 w-6", getStatusColor())} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {FASE_LABELS[nombreFase] || nombreFase}
                </h3>
                
                {/* Badge de Reintento / Ciclos */}
                {hasHistory && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 flex items-center gap-1">
                    <RefreshCcw className="h-3 w-3" />
                    Ciclo {intentos.length}
                  </Badge>
                )}
                
                {isActual && !isCompleted && (
                  <Badge className="bg-blue-600">
                    Fase Actual
                  </Badge>
                )}
                
                {isCompleted && (
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Completada
                  </Badge>
                )}

                {isBlocked && (
                  <Badge variant="secondary">
                    Bloqueada
                  </Badge>
                )}
              </div>

              {/* Metadata del Header (Siempre muestra la situación actual) */}
              {faseHeader.id && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {faseHeader.fechaInicio && (
                    <span>
                      {isCompleted 
                        ? `${formatDate(faseHeader.fechaInicio)} - ${formatDate(faseHeader.fechaFin)}`
                        : `Desde ${formatDate(faseHeader.fechaInicio)}`
                      }
                    </span>
                  )}

                  {faseHeader.responsable && (
                    <span>
                      Responsable:{' '}
                      <span className="font-medium text-gray-900">
                        {faseHeader.responsable.nombres} {faseHeader.responsable.apellidos}
                      </span>
                    </span>
                  )}

                  {faseHeader.estadisticas && (
                    <span>
                      {faseHeader.estadisticas.actividadesCompletadas}/{faseHeader.estadisticas.actividadesTotales} actividades
                    </span>
                  )}

                  {isPatente && faseHeader.trlAlcanzado && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      TRL: {faseHeader.trlAlcanzado}
                    </span>
                  )}
                </div>
              )}

              {isBlocked && (
                <p className="text-sm text-gray-500 mt-1">
                  Requiere completar fase anterior
                </p>
              )}
            </div>
          </div>

          {/* Expand Button */}
          {(!isBlocked && (intentos.length > 0 || faseVigente)) && (
            <Button variant="ghost" size="sm">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Expanded Content */}
      {isExpanded && (
        <CardContent className="pt-0 space-y-6 border-t bg-white rounded-b-lg">
          
          {/* 🔥 SELECTOR DE HISTORIAL (Solo si hay más de 1 intento) */}
          {hasHistory && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-b-lg mb-4 border-b">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <History className="h-4 w-4" />
                <span>Historial de Ciclos:</span>
              </div>
              <Select 
                value={selectedFaseId?.toString()} 
                onValueChange={(val) => setSelectedFaseId(parseInt(val))}
              >
                <SelectTrigger className="w-[280px] h-9 text-xs bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {intentos.map((intento, idx) => {
                    const esUltimo = idx === intentos.length - 1
                    return (
                      <SelectItem key={intento.id} value={intento.id.toString()}>
                        <span className="font-medium">Ciclo {idx + 1}</span>
                        <span className="text-gray-500 ml-2">
                           - {esUltimo ? (intento.estado === 'CERRADA' ? 'Finalizado' : 'Actual') : 'Histórico'} 
                           {' '}({formatDate(intento.fechaInicio)})
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className={hasHistory ? "px-2 pb-4" : "py-4"}>
            {loading ? (
              <LoadingSpinner />
            ) : faseDetail ? (
              <>
                {/* Aviso visual si estamos viendo historial antiguo */}
                {isViewingHistory && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md mb-6 text-sm flex items-start gap-3">
                    <History className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Modo Histórico (Solo Lectura)</strong>
                      <p className="text-amber-700 mt-1">
                        Estás visualizando un ciclo anterior de esta fase. Las actividades y evidencias mostradas aquí pertenecen al pasado y no pueden modificarse.
                      </p>
                    </div>
                  </div>
                )}

                {/* Actividades */}
                <FaseActividadesList 
                  actividades={faseDetail.actividades || []}
                  procesoId={proceso.id}
                  readOnly={isViewingHistory} // 🔥 Prop para deshabilitar subidas/ediciones
                />

                {/* Decisiones - Solo mostrar botones si es la fase actual Y es la versión vigente */}
                {isActual && !isViewingHistory && !isCompleted && (
                  <DecisionFaseButtons
                    proceso={proceso}
                    fase={faseDetail}
                    onSuccess={() => {
                      onUpdate()
                      onRefresh()
                    }}
                  />
                )}

                {/* Mostrar la decisión que cerró este ciclo específico */}
                {/* Se muestra siempre si la fase que estamos viendo (sea actual o histórica) está cerrada */}
                {faseDetail.estado === 'CERRADA' && decisionTomada && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-gray-500"/>
                      Decisión de Cierre del Ciclo
                    </h4>
                    <div className="text-sm text-gray-800 space-y-1">
                      <p>
                        <span className="font-medium">Acción:</span> <Badge variant="outline">{decisionTomada.decision}</Badge>
                      </p>
                      <p>
                        <span className="font-medium">Por:</span>{' '}
                        {decisionTomada.decididor?.nombres} {decisionTomada.decididor?.apellidos}
                      </p>
                      <p>
                        <span className="font-medium">Fecha:</span> {formatDate(decisionTomada.fecha)}
                      </p>
                      {decisionTomada.justificacion && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="font-medium block mb-1">Justificación:</span>
                          <p className="italic text-gray-600">"{decisionTomada.justificacion}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No se pudo cargar el detalle de la fase.
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}