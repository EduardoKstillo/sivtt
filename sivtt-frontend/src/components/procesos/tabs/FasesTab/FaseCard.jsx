import { Card, CardContent, CardHeader } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Circle, 
  Clock,
  Lock,
  TrendingUp
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
  fase, 
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

  // 🔹 Lógica correcta: solo cargar detalle si está expandida y existe en BD
  const { faseDetail, loading } = useFaseDetail(
    proceso.id, 
    nombreFase, 
    isExpanded && !!fase
  )

  // 🔹 Backend devuelve decisiones como array
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

  return (
    <Card className={cn(
      "transition-all",
      isActual && "ring-2 ring-blue-600 shadow-lg",
      isBlocked && "opacity-60"
    )}>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={fase && !isBlocked ? onToggle : undefined}
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
                
                {isActual && (
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

              {/* Metadata */}
              {fase && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {fase.fechaInicio && (
                    <span>
                      {isCompleted 
                        ? `${formatDate(fase.fechaInicio)} - ${formatDate(fase.fechaFin)}`
                        : `Desde ${formatDate(fase.fechaInicio)}`
                      }
                    </span>
                  )}

                  {fase.responsable && (
                    <span>
                      Responsable:{' '}
                      <span className="font-medium text-gray-900">
                        {fase.responsable.nombres} {fase.responsable.apellidos}
                      </span>
                    </span>
                  )}

                  {fase.estadisticas && (
                    <span>
                      {fase.estadisticas.actividadesCompletadas}/{fase.estadisticas.actividadesTotales} actividades
                    </span>
                  )}

                  {isPatente && fase.trlAlcanzado && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      TRL: {fase.trlAlcanzado}
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
          {fase && !isBlocked && (
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
      {isExpanded && fase && (
        <CardContent className="pt-0 space-y-6">
          {loading ? (
            <LoadingSpinner />
          ) : faseDetail ? (
            <>
              {/* Actividades */}
              <FaseActividadesList 
                actividades={faseDetail.actividades || []}
                procesoId={proceso.id}
              />

              {/* Decisiones - Solo fase actual */}
              {isActual && (
                <DecisionFaseButtons
                  proceso={proceso}
                  fase={faseDetail}
                  onSuccess={() => {
                    onUpdate()
                    onRefresh()
                  }}
                />
              )}

              {/* Decisión tomada - Fase completada */}
              {isCompleted && decisionTomada && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">
                    Decisión Tomada
                  </h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <p>
                      <strong>Acción:</strong> {decisionTomada.decision}
                    </p>
                    <p>
                      <strong>Por:</strong>{' '}
                      {decisionTomada.decididor?.nombres} {decisionTomada.decididor?.apellidos}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {formatDate(decisionTomada.fecha)}
                    </p>
                    {decisionTomada.justificacion && (
                      <p>
                        <strong>Justificación:</strong> {decisionTomada.justificacion}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </CardContent>
      )}
    </Card>
  )
}
