import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { Badge } from '@components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Building2,
  Users,
  FileText,
  DollarSign,
  Clock
} from 'lucide-react'
import { formatDateTime } from '@utils/formatters'
import { cn } from '@/lib/utils'

const TIPO_ICONS = {
  ESTADO:         CheckCircle2,
  FASE:           ArrowRight,
  TRL:            TrendingUp,
  DECISION:       CheckCircle2,
  EMPRESA:        Building2,
  EQUIPO:         Users,
  ACTIVIDAD:      FileText,
  EVIDENCIA:      FileText,
  FINANCIAMIENTO: DollarSign,
  OTRO:           Clock
}

// Colores semánticos con opacidad — idéntico al patrón de HistorialTimeline
const TIPO_COLORS = {
  ESTADO:         'bg-blue-500/10 text-blue-500',
  FASE:           'bg-violet-500/10 text-violet-500',
  TRL:            'bg-emerald-500/10 text-emerald-500',
  DECISION:       'bg-amber-500/10 text-amber-500',
  EMPRESA:        'bg-indigo-500/10 text-indigo-500',
  EQUIPO:         'bg-pink-500/10 text-pink-500',
  ACTIVIDAD:      'bg-cyan-500/10 text-cyan-500',
  EVIDENCIA:      'bg-teal-500/10 text-teal-500',
  FINANCIAMIENTO: 'bg-emerald-500/10 text-emerald-500',
  OTRO:           'bg-muted text-muted-foreground'
}

export const RecentActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No hay actividad reciente
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {activities.map((activity) => {
        const Icon       = TIPO_ICONS[activity.tipoEvento] || Clock
        const colorClass = TIPO_COLORS[activity.tipoEvento] || TIPO_COLORS.OTRO

        return (
          <div
            key={activity.id}
            // bg-card border-border — mismo patrón que filas en GestionarMiembrosGrupoModal
            className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            {/* Ícono de tipo */}
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
              colorClass
            )}>
              <Icon className="h-4 w-4" />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                  {activity.titulo}
                </p>
                <Badge variant="outline" className="text-[10px] h-5 whitespace-nowrap shrink-0">
                  {activity.tipoEvento}
                </Badge>
              </div>

              {activity.descripcion && (
                <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                  {activity.descripcion}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {activity.usuario && (
                  <div className="flex items-center gap-1">
                    <Avatar className="h-4 w-4">
                      {/* bg-muted text-muted-foreground en lugar de bg-gray-200 text-gray-600 */}
                      <AvatarFallback className="bg-muted text-muted-foreground text-[8px]">
                        {activity.usuario.nombre?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{activity.usuario.nombre}</span>
                  </div>
                )}
                <span className="text-border">•</span>
                <span>{formatDateTime(activity.fecha)}</span>
              </div>

              {activity.proceso && (
                // FileText ícono en lugar de emoji 📋
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="truncate">{activity.proceso.titulo}</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}