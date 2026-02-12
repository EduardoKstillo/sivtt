import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Progress } from '@components/ui/progress'
import { Calendar, User, Building2, Activity } from 'lucide-react'
import { TIPO_ACTIVO, ESTADO_PROCESO } from '@utils/constants'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'
import {
  ESTADO_PROCESO_STYLES,
  FASE_STYLES,
  getStatusLabel,
} from '@utils/designTokens'

export const ProcesoCard = ({ proceso }) => {
  const isPatente = proceso.tipoActivo === TIPO_ACTIVO.PATENTE

  const responsable = proceso.usuarios?.[0]?.usuario
  const responsableNombre = responsable
    ? `${responsable.nombres} ${responsable.apellidos}`
    : 'Sin responsable'

  const estadoStyle = ESTADO_PROCESO_STYLES[proceso.estado]
  const faseStyle = FASE_STYLES[proceso.faseActual]

  // Progress calculation
  const totalActividades = proceso.actividadesTotales || 0
  const completadas = proceso.actividadesCompletadas || 0
  const progressPercent = totalActividades > 0
    ? Math.round((completadas / totalActividades) * 100)
    : 0

  return (
    <Link to={`/procesos/${proceso.id}`} className="block">
      <Card className="h-full card-interactive cursor-pointer group overflow-hidden">
        {/* Top color accent bar */}
        <div
          className="h-1 w-full"
          style={{ backgroundColor: faseStyle?.color || 'var(--border)' }}
        />

        <CardHeader className="pb-3 pt-4">
          {/* Type + Status row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge
              variant="secondary"
              className={cn(
                'text-[11px] font-medium border',
                isPatente
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40'
                  : 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/40'
              )}
            >
              {isPatente ? 'Patente' : 'Requerimiento'}
            </Badge>

            {estadoStyle && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-[11px] font-medium border gap-1.5',
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

          {/* Code */}
          <p className="font-mono text-xs text-muted-foreground">{proceso.codigo}</p>

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {proceso.titulo}
          </h3>
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          {/* Phase */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fase</span>
            {faseStyle ? (
              <Badge
                variant="secondary"
                className={cn(
                  'text-[11px] font-medium border',
                  faseStyle.bgClass,
                  faseStyle.textClass,
                )}
              >
                {faseStyle.label}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px]">{proceso.faseActual}</Badge>
            )}
          </div>

          {/* Activities progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                Actividades
              </span>
              <span className="font-medium text-foreground tabular-nums text-xs">
                {completadas}/{totalActividades}
              </span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>

          {/* Companies (patents only) */}
          {isPatente && proceso.empresasVinculadas > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Empresas
              </span>
              <span className="font-medium text-foreground tabular-nums">
                {proceso.empresasVinculadas}
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border pt-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[130px]">
                {responsableNombre}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="h-3 w-3" />
              <span className="tabular-nums">{formatDate(proceso.createdAt)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}