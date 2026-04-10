import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { 
  ChevronDown, CheckCircle2, Circle, Clock, Lock, 
  TrendingUp, History, RefreshCcw, Edit, Calendar, User2, Layers
} from 'lucide-react'
import { FaseActividadesList } from './FaseActividadesList'
import { DecisionFaseButtons } from './DecisionFaseButtons'
import { AsignarLiderFaseModal } from './modals/AsignarLiderFaseModal'
import { useFaseDetail } from '@hooks/useFaseDetail'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { formatDate } from '@utils/formatters'
import { TIPO_ACTIVO } from '@utils/constants'
import { cn } from '@/lib/utils'
import { FASE_STYLES } from '@utils/designTokens'
import { useAuthStore } from '@store/authStore'
import { ROLES } from '@utils/permissions'
import { procesosAPI } from '@api/endpoints/procesos' 

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
  const [liderModalOpen, setLiderModalOpen] = useState(false) 
  
  const { user } = useAuthStore()

  // ✅ Referencia para el Auto-Scroll
  const cardRef = useRef(null)

  // ✅ EFECTO CORREGIDO: Sin trabas, hace scroll suave siempre que la tarjeta se expanda
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      // 400ms le da el tiempo exacto al acordeón anterior para cerrarse
      // y al nuevo para abrirse antes de calcular las coordenadas.
      const timer = setTimeout(() => {
        cardRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center' // 'center' asegura que no quede tapado por tu Navbar superior
        })
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isExpanded])

  useEffect(() => {
    if (intentos.length > 0) {
      setSelectedFaseId(intentos[intentos.length - 1].id)
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

  const isAdmin = user?.roles?.includes(ROLES.ADMIN_SISTEMA)
  const isGestorProceso = proceso.usuarios?.some(u => u.id === user?.id && u.rol?.codigo === 'GESTOR_PROCESO')
  const isLiderFase = proceso.usuarios?.some(u => u.id === user?.id && u.rol?.codigo === 'LIDER_FASE')
  
  const canGestionarFase = isAdmin || isGestorProceso || isLiderFase
  const canAsignarLider = isAdmin || isGestorProceso

  const isPatente = proceso.tipoActivo === TIPO_ACTIVO.PATENTE
  const faseHeader = faseVigente || {} 

  const inicialesLider = faseHeader.responsable 
    ? `${faseHeader.responsable.nombres.charAt(0)}${faseHeader.responsable.apellidos.charAt(0)}` 
    : <User2 className="h-3 w-3 text-muted-foreground/60" />

  return (
    <>
      <Card 
        ref={cardRef} // ✅ Vinculamos la tarjeta al scroll
        className={cn(
          "transition-all duration-300 border",
          isActual && !isCompleted ? "ring-2 ring-primary/40 border-primary/30 shadow-md bg-card" : "border-border bg-card/50",
          isBlocked && "opacity-60 border-dashed bg-muted/20"
        )}
      >
        <CardHeader 
          className={cn(
            "p-4 sm:p-5 transition-colors",
            !isBlocked && "cursor-pointer hover:bg-muted/40",
            isExpanded && "border-b border-border/50 bg-muted/10"
          )}
          onClick={(!isBlocked && (intentos.length > 0 || faseVigente)) ? onToggle : undefined}
        >
          <div className="flex items-start sm:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4 flex-1">
              
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                isCompleted ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                isActual ? (faseStyle?.iconBg || "bg-primary/10") + " text-primary" :
                "bg-muted text-muted-foreground/50"
              )}>
                {isCompleted ? <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" /> :
                 isActual ? <Clock className="h-5 w-5 sm:h-6 sm:w-6" /> :
                 isBlocked ? <Lock className="h-5 w-5 sm:h-6 sm:w-6" /> :
                 <Circle className="h-5 w-5 sm:h-6 sm:w-6" />}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h3 className={cn(
                    "text-base sm:text-lg font-bold truncate",
                    isBlocked ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {FASE_LABELS[nombreFase] || nombreFase}
                  </h3>
                  
                  {isActual && !isCompleted && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-[10px] uppercase tracking-wider px-2">
                      Fase Actual
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 px-2">
                      Completada
                    </Badge>
                  )}
                  {hasHistory && (
                    <Badge variant="secondary" className="text-[10px] border gap-1 bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30">
                      <RefreshCcw className="h-3 w-3" /> Ciclo {intentos.length}
                    </Badge>
                  )}
                </div>

                {!isBlocked && faseHeader.id ? (
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-5 gap-y-2 mt-2 text-xs text-muted-foreground font-medium">
                    
                    {faseHeader.fechaInicio && (
                      <div className="flex items-center gap-1.5 tabular-nums">
                        <Calendar className="h-3.5 w-3.5" />
                        {isCompleted 
                          ? `${formatDate(faseHeader.fechaInicio)} — ${formatDate(faseHeader.fechaFin)}`
                          : `Desde ${formatDate(faseHeader.fechaInicio)}`
                        }
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5 border border-border shadow-sm">
                        <AvatarFallback className="bg-background text-[9px] text-foreground">
                          {inicialesLider}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-[150px]">
                        {faseHeader.responsable 
                          ? `${faseHeader.responsable.nombres.split(' ')[0]} ${faseHeader.responsable.apellidos.split(' ')[0]}`
                          : 'Sin líder asignado'
                        }
                      </span>
                      
                      {canAsignarLider && isActual && !isViewingHistory && (
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 ml-[-4px]"
                          onClick={(e) => { e.stopPropagation(); setLiderModalOpen(true); }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="hidden sm:flex items-center gap-4">
                      {faseHeader.estadisticas && (
                        <span className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5" />
                          {faseHeader.estadisticas.actividadesCompletadas}/{faseHeader.estadisticas.actividadesTotales} act.
                        </span>
                      )}
                      {isPatente && faseHeader.trlAlcanzado && (
                        <span className="flex items-center gap-1.5 text-primary">
                          <TrendingUp className="h-3.5 w-3.5" /> TRL {faseHeader.trlAlcanzado}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  isBlocked && <span className="text-xs text-muted-foreground">Requiere completar la fase anterior.</span>
                )}
              </div>
            </div>

            {(!isBlocked && (intentos.length > 0 || faseVigente)) && (
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                isExpanded ? "bg-muted text-foreground rotate-180" : "text-muted-foreground/50 group-hover:bg-muted group-hover:text-foreground"
              )}>
                <ChevronDown className="h-5 w-5" />
              </div>
            )}
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-4 sm:p-5 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            
            {hasHistory && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/40 p-3 rounded-xl border border-border/50 gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <History className="h-4 w-4" />
                  <span>Visualizando ciclo:</span>
                </div>
                <Select value={selectedFaseId?.toString()} onValueChange={(val) => setSelectedFaseId(parseInt(val))}>
                  <SelectTrigger className="w-full sm:w-[280px] h-9 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {intentos.map((intento, idx) => {
                      const esUltimo = idx === intentos.length - 1
                      return (
                        <SelectItem key={intento.id} value={intento.id.toString()}>
                          <span className="font-medium">Ciclo {idx + 1}</span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            — {esUltimo ? (intento.estado === 'CERRADA' ? 'Finalizado' : 'Actual') : 'Histórico'} 
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="pt-2">
              {loading ? (
                <LoadingSpinner />
              ) : faseDetail ? (
                <>
                  {isViewingHistory && (
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-3">
                      <History className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div>
                        <strong className="block mb-0.5">Modo Histórico (Solo Lectura)</strong>
                        <p className="text-amber-700/90 dark:text-amber-400/80 leading-relaxed text-xs">
                          Estás visualizando un ciclo cerrado. Las actividades y evidencias mostradas pertenecen al pasado y no pueden modificarse.
                        </p>
                      </div>
                    </div>
                  )}

                  <FaseActividadesList 
                    actividades={faseDetail.actividades || []}
                    procesoId={proceso.id}
                    readOnly={isViewingHistory}
                    canCreateActivity={canGestionarFase && !isViewingHistory} 
                  />

                  {isActual && !isViewingHistory && !isCompleted && canGestionarFase && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <DecisionFaseButtons
                        proceso={proceso}
                        fase={faseDetail}
                        onSuccess={async () => {
                          try {
                            const res = await procesosAPI.getById(proceso.id)
                            if (res.data?.data) onUpdate(res.data.data) 
                          } catch (error) { console.error(error) }
                          onRefresh() 
                        }}
                      />
                    </div>
                  )}

                  {faseDetail.estado === 'CERRADA' && decisionTomada && (
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mt-8 shadow-sm">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Lock className="h-4 w-4"/>
                        Resolución del Ciclo
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block text-xs mb-1">Acción tomada:</span>
                          <Badge variant="outline" className="font-bold bg-background">{decisionTomada.decision}</Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs mb-1">Decidido por:</span>
                          <span className="font-medium text-foreground">{decisionTomada.decididor?.nombres} {decisionTomada.decididor?.apellidos}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-muted-foreground block text-xs mb-1">Fecha de resolución:</span>
                          <span className="font-medium tabular-nums text-foreground">{formatDate(decisionTomada.fecha)}</span>
                        </div>
                        {decisionTomada.justificacion && (
                          <div className="sm:col-span-2 bg-background border border-border rounded-lg p-3 mt-2">
                            <span className="text-muted-foreground block text-xs font-medium mb-1.5">Justificación registrada:</span>
                            <p className="italic text-foreground/80 text-sm leading-relaxed">"{decisionTomada.justificacion}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl bg-muted/10">
                  No se pudo cargar el detalle de la fase.
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {canAsignarLider && (
        <AsignarLiderFaseModal 
          open={liderModalOpen} 
          onOpenChange={setLiderModalOpen} 
          proceso={proceso} 
          fase={faseVigente} 
          onSuccess={() => { onUpdate(); onRefresh() }} 
        />
      )}
    </>
  )
}