import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Progress } from '@components/ui/progress'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { Calendar, Building2, Layers, CheckCircle2, User2 } from 'lucide-react'
import { TIPO_ACTIVO } from '@utils/constants'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'
import {
  ESTADO_PROCESO_STYLES,
  FASE_STYLES,
} from '@utils/designTokens'

export const ProcesoCard = ({ proceso }) => {
  const isPatente = proceso.tipoActivo === TIPO_ACTIVO.PATENTE

  const responsable = proceso.usuarios?.find(
    (u) => u.rol?.codigo === 'GESTOR_PROCESO'
  )

  const responsableNombre = responsable
    ? `${responsable.nombres} ${responsable.apellidos}`
    : 'Sin asignar'
    
  const iniciales = responsable 
    ? `${responsable.nombres?.charAt(0) || ''}${responsable.apellidos?.charAt(0) || ''}` 
    : <User2 className="h-3.5 w-3.5 text-muted-foreground/60" />

  const estadoStyle = ESTADO_PROCESO_STYLES[proceso.estado]
  const faseStyle = FASE_STYLES[proceso.faseActual]

  // Cálculos de progreso
  const totalActividades = proceso.actividadesTotales || 0
  const completadas = proceso.actividadesCompletadas || 0
  const progressPercent = totalActividades > 0
    ? Math.round((completadas / totalActividades) * 100)
    : 0

  return (
    <Link to={`/procesos/${proceso.id}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className={cn(
        "h-full flex flex-col relative overflow-hidden group transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-md hover:border-primary/40"
      )}>
        {/* Línea superior indicadora de la fase actual */}
        <div
          className="absolute top-0 left-0 w-full h-1.5 transition-colors"
          style={{ backgroundColor: faseStyle?.color || 'var(--border)' }}
        />

        <CardHeader className="px-5 pt-6 pb-3 space-y-3">
          {/* Fila 1: Badges y Estado */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  'text-[10px] font-bold tracking-wide border h-5.5 px-2 uppercase',
                  isPatente
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40'
                    : 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/40'
                )}
              >
                {isPatente ? 'Patente' : 'Requerimiento'}
              </Badge>
              <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md border border-border shadow-sm">
                {proceso.codigo}
              </span>
            </div>

            {estadoStyle && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-[10px] font-medium border gap-1.5 h-5.5 px-2 shrink-0',
                  estadoStyle.bgClass,
                  estadoStyle.textClass,
                  estadoStyle.borderClass
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', estadoStyle.dotColor)} />
                {estadoStyle.label}
              </Badge>
            )}
          </div>

          {/* Fila 2: Título Principal */}
          <h3 className="font-bold text-foreground text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {proceso.titulo}
          </h3>
        </CardHeader>

        <CardContent className="px-5 py-3 space-y-4 flex-1">
          {/* Fase */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Fase Actual
            </span>
            {faseStyle ? (
              <Badge
                variant="secondary"
                className={cn('text-[11px] font-medium border', faseStyle.bgClass, faseStyle.textClass)}
              >
                {faseStyle.label}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px]">{proceso.faseActual}</Badge>
            )}
          </div>

          {/* Empresas (Solo si es patente y tiene empresas) */}
          {isPatente && proceso.empresasVinculadas > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Empresas aliadas
              </span>
              <span className="font-semibold text-foreground tabular-nums text-xs">
                {proceso.empresasVinculadas}
              </span>
            </div>
          )}

          {/* Progreso de Actividades (Mini-Widget) */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-3 space-y-2.5 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                Avance global
              </span>
              <span className="font-medium text-muted-foreground tabular-nums text-[11px]">
                {completadas}/{totalActividades} act.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={progressPercent} className="h-2 flex-1" />
              <span className="text-[10px] font-bold text-foreground tabular-nums w-8 text-right">
                {progressPercent}%
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-5 py-3.5 bg-muted/10 border-t border-border flex items-center justify-between mt-auto">
          {/* Responsable con Avatar */}
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6 border border-border shadow-sm shrink-0">
              <AvatarFallback className="bg-background text-[10px] font-medium text-foreground">
                {iniciales}
              </AvatarFallback>
            </Avatar>
            <span className={cn(
              "text-xs truncate max-w-[120px]",
              responsable ? "font-medium text-foreground/80" : "italic text-muted-foreground"
            )}>
              {responsableNombre}
            </span>
          </div>

          {/* Fecha */}
          <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span className="text-[11px] font-medium tabular-nums">
              {formatDate(proceso.createdAt)}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}