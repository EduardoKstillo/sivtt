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
  ESTADO: CheckCircle2,
  FASE: ArrowRight,
  TRL: TrendingUp,
  DECISION: CheckCircle2,
  EMPRESA: Building2,
  EQUIPO: Users,
  ACTIVIDAD: FileText,
  EVIDENCIA: FileText,
  FINANCIAMIENTO: DollarSign,
  OTRO: Clock
}

const TIPO_COLORS = {
  ESTADO: 'text-blue-600 bg-blue-50',
  FASE: 'text-purple-600 bg-purple-50',
  TRL: 'text-green-600 bg-green-50',
  DECISION: 'text-orange-600 bg-orange-50',
  EMPRESA: 'text-indigo-600 bg-indigo-50',
  EQUIPO: 'text-pink-600 bg-pink-50',
  ACTIVIDAD: 'text-cyan-600 bg-cyan-50',
  EVIDENCIA: 'text-teal-600 bg-teal-50',
  FINANCIAMIENTO: 'text-emerald-600 bg-emerald-50',
  OTRO: 'text-gray-600 bg-gray-50'
}

export const RecentActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No hay actividad reciente
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      {activities.map((activity, index) => {
        const Icon = TIPO_ICONS[activity.tipoEvento] || Clock
        const colorClass = TIPO_COLORS[activity.tipoEvento] || TIPO_COLORS.OTRO

        return (
          <div 
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            {/* Icon */}
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              colorClass
            )}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {activity.titulo}
                </p>
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {activity.tipoEvento}
                </Badge>
              </div>

              {activity.descripcion && (
                <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                  {activity.descripcion}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-500">
                {activity.usuario && (
                  <div className="flex items-center gap-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-[8px]">
                        {activity.usuario.nombre?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{activity.usuario.nombre}</span>
                  </div>
                )}
                <span>•</span>
                <span>{formatDateTime(activity.fecha)}</span>
              </div>

              {activity.proceso && (
                <p className="text-xs text-gray-500 mt-1">
                  📋 {activity.proceso.titulo}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}