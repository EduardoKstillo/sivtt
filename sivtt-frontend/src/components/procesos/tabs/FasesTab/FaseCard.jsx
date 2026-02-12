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
  RefreshCcw
} from 'lucide-react'
import { FaseActividadesList } from './FaseActividadesList'
import { DecisionFaseButtons } from './DecisionFaseButtons'
import { useFaseDetail } from '@hooks/useFaseDetail'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { formatDate } from '@utils/formatters'
import { TIPO_ACTIVO } from '@utils/constants'
import { cn } from '@/lib/utils'
import { FASE_STYLES } from '@utils/designTokens'

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
  intentos = [],
  faseVigente,
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
  const [selectedFaseId, setSelectedFaseId] = useState(null)

  useEffect(() => {
    if (intentos.length > 0) {
      const ultimoIntento = intentos[intentos.length - 1]
      setSelectedFaseId(ultimoIntento.id)
    } else if (faseVigente) {
      setSelectedFaseId(faseVigente.id)
    }
  }, [intentos.length, isExpanded, faseVigente])

  const isViewingHistory = faseVigente && selectedFaseId !== faseVigente.id
  const hasHistory = intentos.length > 1

  const { faseDetail, loading } = useFaseDetail(
    proceso.id, 
    nombreFase, 
    isExpanded && !!selectedFaseId,
    selectedFaseId
  )

  const decisionTomada = faseDetail?.decisiones?.[0]
  const faseStyle = FASE_STYLES[nombreFase]

  const getStatusIcon = () => {
    if (isCompleted) return CheckCircle2
    if (isActual) return Clock
    if (isBlocked) return Lock
    return Circle
  }

  const getStatusIconClasses = () => {
    if (isCompleted) return 'text-emerald-600 dark:text-emerald-400'
    if (isActual) return 'text-primary'
    if (isBlocked) return 'text-muted-foreground/40'
    return 'text-muted-foreground/30'
  }

  const getStatusBgClasses = () => {
    if (isCompleted) return 'bg-emerald-50 dark:bg-emerald-950/40'
    if (isActual) return faseStyle?.iconBg || 'bg-primary/10'
    if (isBlocked) return 'bg-muted/50'
    return 'bg-muted/30'
  }

  const StatusIcon = getStatusIcon()
  const isPatente = proceso.tipoActivo === TIPO_ACTIVO.PATENTE
  const faseHeader = faseVigente || {} 

  return (
    <Card className={cn(
      "transition-all",
      isActual && !isCompleted && "ring-2 ring-primary/60 shadow-md",
      isBlocked && "opacity-50"
    )}>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/30 transition-colors py-4"
        onClick={(!isBlocked && (intentos.length > 0 || faseVigente)) ? onToggle : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">

            {/* Status Icon */}
            <div className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
              getStatusBgClasses()
            )}>
              <StatusIcon className={cn("h-5 w-5", getStatusIconClasses())} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                <h3 className="font-semibold text-foreground">
                  {FASE_LABELS[nombreFase] || nombreFase}
                </h3>
                
                {hasHistory && (
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-medium border gap-1 bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/40"
                  >
                    <RefreshCcw className="h-3 w-3" />
                    Ciclo {intentos.length}
                  </Badge>
                )}
                
                {isActual && !isCompleted && (
                  <Badge className="bg-primary text-primary-foreground text-[11px]">
                    Fase Actual
                  </Badge>
                )}
                
                {isCompleted && (
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
                  >
                    Completada
                  </Badge>
                )}

                {isBlocked && (
                  <Badge variant="secondary" className="text-[11px]">
                    Bloqueada
                  </Badge>
                )}
              </div>

              {/* Metadata */}
              {faseHeader.id && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {faseHeader.fechaInicio && (
                    <span className="text-xs tabular-nums">
                      {isCompleted 
                        ? `${formatDate(faseHeader.fechaInicio)} — ${formatDate(faseHeader.fechaFin)}`
                        : `Desde ${formatDate(faseHeader.fechaInicio)}`
                      }
                    </span>
                  )}

                  {faseHeader.responsable && (
                    <span className="text-xs">
                      Resp:{' '}
                      <span className="font-medium text-foreground">
                        {faseHeader.responsable.nombres} {faseHeader.responsable.apellidos}
                      </span>
                    </span>
                  )}

                  {faseHeader.estadisticas && (
                    <span className="text-xs tabular-nums">
                      {faseHeader.estadisticas.actividadesCompletadas}/{faseHeader.estadisticas.actividadesTotales} actividades
                    </span>
                  )}

                  {isPatente && faseHeader.trlAlcanzado && (
                    <span className="flex items-center gap-1 text-xs">
                      <TrendingUp className="h-3.5 w-3.5" />
                      TRL: {faseHeader.trlAlcanzado}
                    </span>
                  )}
                </div>
              )}

              {isBlocked && (
                <p className="text-xs text-muted-foreground mt-1">
                  Requiere completar fase anterior
                </p>
              )}
            </div>
          </div>

          {/* Expand Button */}
          {(!isBlocked && (intentos.length > 0 || faseVigente)) && (
            <Button variant="ghost" size="sm" className="text-muted-foreground">
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
        <CardContent className="pt-0 space-y-6 border-t border-border rounded-b-lg">
          
          {/* History Selector */}
          {hasHistory && (
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <History className="h-4 w-4" />
                <span>Historial de Ciclos:</span>
              </div>
              <Select 
                value={selectedFaseId?.toString()} 
                onValueChange={(val) => setSelectedFaseId(parseInt(val))}
              >
                <SelectTrigger className="w-[280px] h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {intentos.map((intento, idx) => {
                    const esUltimo = idx === intentos.length - 1
                    return (
                      <SelectItem key={intento.id} value={intento.id.toString()}>
                        <span className="font-medium">Ciclo {idx + 1}</span>
                        <span className="text-muted-foreground ml-2">
                          — {esUltimo ? (intento.estado === 'CERRADA' ? 'Finalizado' : 'Actual') : 'Histórico'} 
                          {' '}({formatDate(intento.fechaInicio)})
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className={hasHistory ? "px-1 pb-4" : "py-4"}>
            {loading ? (
              <LoadingSpinner />
            ) : faseDetail ? (
              <>
                {/* History mode warning */}
                {isViewingHistory && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-3">
                    <History className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <strong>Modo Histórico (Solo Lectura)</strong>
                      <p className="text-amber-700 dark:text-amber-400/80 mt-1">
                        Estás visualizando un ciclo anterior de esta fase. Las actividades y evidencias mostradas aquí pertenecen al pasado y no pueden modificarse.
                      </p>
                    </div>
                  </div>
                )}

                {/* Activities */}
                <FaseActividadesList 
                  actividades={faseDetail.actividades || []}
                  procesoId={proceso.id}
                  readOnly={isViewingHistory}
                />

                {/* Decision buttons */}
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

                {/* Closure decision display */}
                {faseDetail.estado === 'CERRADA' && decisionTomada && (
                  <div className="bg-muted/50 border border-border rounded-lg p-4 mt-6">
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-muted-foreground"/>
                      Decisión de Cierre del Ciclo
                    </h4>
                    <div className="text-sm text-foreground/80 space-y-1.5">
                      <p>
                        <span className="font-medium text-foreground">Acción:</span>{' '}
                        <Badge variant="outline" className="text-[11px]">{decisionTomada.decision}</Badge>
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Por:</span>{' '}
                        {decisionTomada.decididor?.nombres} {decisionTomada.decididor?.apellidos}
                      </p>
                      <p className="tabular-nums">
                        <span className="font-medium text-foreground">Fecha:</span>{' '}
                        {formatDate(decisionTomada.fecha)}
                      </p>
                      {decisionTomada.justificacion && (
                        <div className="mt-2.5 pt-2.5 border-t border-border">
                          <span className="font-medium text-foreground block mb-1 text-xs">Justificación:</span>
                          <p className="italic text-muted-foreground text-sm">
                            "{decisionTomada.justificacion}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No se pudo cargar el detalle de la fase.
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}