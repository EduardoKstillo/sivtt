import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Calendar,
  ExternalLink,
  UserCircle
} from 'lucide-react'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const ESTADO_ICONS = {
  APROBADA: {
    icon: CheckCircle2,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  EN_PROGRESO: {
    icon: Clock,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
  },
  EN_REVISION: {
    icon: Clock,
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-950/40',
  },
  OBSERVADA: {
    icon: AlertCircle,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
  },
  LISTA_PARA_CIERRE: {
    icon: CheckCircle2,
    colorClass: 'text-teal-600 dark:text-teal-400',
    bgClass: 'bg-teal-50 dark:bg-teal-950/40',
  },
  CREADA: {
    icon: FileText,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
  },
  RECHAZADA: {
    icon: AlertCircle,
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
  },
}

export const FaseActividadesList = ({ actividades, procesoId, readOnly }) => {
  if (!actividades || actividades.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg border-dashed border-border bg-dot-pattern">
        No hay actividades configuradas para esta fase
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground text-xs uppercase tracking-widest text-muted-foreground">
          Actividades ({actividades.length})
        </h4>
        <Button variant="link" size="sm" asChild className="text-primary h-auto p-0 text-xs">
          <Link to={`/procesos/${procesoId}?tab=actividades`}>
            Gestionar Actividades
            <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-2.5">
        {actividades.slice(0, 5).map((actividad) => {
          const estadoConfig = ESTADO_ICONS[actividad.estado] || ESTADO_ICONS.CREADA
          const IconComponent = estadoConfig.icon
          const responsable = actividad.responsables?.[0] 

          return (
            <div
              key={actividad.id}
              className="group flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/[0.02] dark:hover:bg-primary/5 transition-all"
            >
              {/* Icon */}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                estadoConfig.bgClass
              )}>
                <IconComponent className={cn("h-4 w-4", estadoConfig.colorClass)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-medium text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                    {actividad.nombre}
                  </h5>
                  {actividad.obligatoria && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-5 shrink-0 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                    >
                      Obligatoria
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                  <span className={cn("font-medium", estadoConfig.colorClass)}>
                    {actividad.estado.replace(/_/g, ' ')}
                  </span>

                  {responsable && (
                    <span className="flex items-center gap-1">
                      <UserCircle className="h-3 w-3" />
                      {responsable.nombres} {responsable.apellidos}
                    </span>
                  )}

                  {actividad.fechaLimite && (
                    <span className="flex items-center gap-1 tabular-nums">
                      <Calendar className="h-3 w-3" />
                      {formatDate(actividad.fechaLimite)}
                    </span>
                  )}
                  
                  {actividad.evidencias && (
                    <span className="tabular-nums">
                      · {actividad.evidencias.aprobadas}/{actividad.evidencias.total} evidencias
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {actividades.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full text-muted-foreground text-xs mt-1"
          >
            <Link to={`/procesos/${procesoId}?tab=actividades`}>
              Ver {actividades.length - 5} actividades más...
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}