import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from '@components/ui/sheet'
import { Badge } from '@components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Calendar, Users, Paperclip, Activity, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react' 
import { ActividadEstadoMachine } from './ActividadEstadoMachine'
import { EvidenciasList } from './EvidenciasList'
import { AsignacionesManager } from './AsignacionesManager'
import { ReunionManager } from './ReunionManager'
import { useActividadDetail } from '@hooks/useActividadDetail'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const ESTADO_DRAWER = {
  APROBADA: { icon: CheckCircle2, accent: 'bg-emerald-500', label: 'Aprobada' },
  EN_PROGRESO: { icon: Clock, accent: 'bg-blue-500', label: 'En Progreso' },
  EN_REVISION: { icon: Clock, accent: 'bg-violet-500', label: 'En Revisión' },
  OBSERVADA: { icon: AlertCircle, accent: 'bg-amber-500', label: 'Observada' },
  LISTA_PARA_CIERRE: { icon: CheckCircle2, accent: 'bg-teal-500', label: 'Lista para Cierre' },
  CREADA: { icon: FileText, accent: 'bg-slate-400', label: 'Creada' },
  RECHAZADA: { icon: AlertCircle, accent: 'bg-rose-500', label: 'Rechazada' },
}

export const ActividadDrawer = ({ actividadId, open, onClose, proceso }) => {
  const { actividad, loading, refetch, updateActividad } = useActividadDetail(actividadId)

  if (!open) return null

  const estadoConfig = actividad ? (ESTADO_DRAWER[actividad.estado] || ESTADO_DRAWER.CREADA) : null
  const evidenciasCount = Array.isArray(actividad?.evidencias) ? actividad.evidencias.length : 0
  const equipoCount = actividad?.asignaciones?.length || 0

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
        ) : actividad ? (
          <div className="flex flex-col h-full">
            {/* ── Header ── */}
            <div className="relative">
              {/* Status accent bar */}
              <div className={cn("h-1 w-full", estadoConfig.accent)} />

              <div className="px-6 pt-5 pb-5 border-b border-border">
                {/* Top row: badges */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-medium bg-primary/10 text-primary border-0"
                  >
                    {actividad.fase}
                  </Badge>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {actividad.tipo}
                  </Badge>
                  {actividad.obligatoria && (
                    <Badge
                      variant="secondary"
                      className="text-[11px] font-medium bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                    >
                      Obligatoria
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <SheetTitle className="text-lg font-semibold text-foreground leading-snug mb-2">
                  {actividad.nombre}
                </SheetTitle>

                {/* Description */}
                {actividad.descripcion && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {actividad.descripcion}
                  </p>
                )}

                {/* Quick stats row */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn("w-2 h-2 rounded-full", estadoConfig.accent)} />
                    <span className="font-medium">{estadoConfig.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
                    <span className="tabular-nums">{evidenciasCount} evidencias</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span className="tabular-nums">{equipoCount} asignados</span>
                  </div>
                  {actividad.fechaLimite && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto tabular-nums">
                      <Calendar className="h-3 w-3" />
                      {formatDate(actividad.fechaLimite)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 px-6 py-5">
              <Tabs defaultValue="evidencias" className="space-y-5">
                <TabsList className="bg-muted/50 p-1 h-auto w-full grid grid-cols-4 gap-0.5">
                  <TabsTrigger
                    value="evidencias"
                    className="text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Evidencias</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="estado"
                    className="text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Estado</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="equipo"
                    className="text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Equipo</span>
                  </TabsTrigger>
                  {actividad.tipo === 'REUNION' && (
                    <TabsTrigger
                      value="reunion"
                      className="text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Reunión</span>
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="evidencias">
                  <EvidenciasList actividad={actividad} onUpdate={refetch} />
                </TabsContent>
                <TabsContent value="estado">
                  <ActividadEstadoMachine actividad={actividad} onUpdate={(d) => { updateActividad(d); refetch() }} />
                </TabsContent>
                <TabsContent value="equipo">
                  <AsignacionesManager actividad={actividad} proceso={proceso} onUpdate={refetch} />
                </TabsContent>
                <TabsContent value="reunion">
                  <ReunionManager actividad={actividad} onUpdate={refetch} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}