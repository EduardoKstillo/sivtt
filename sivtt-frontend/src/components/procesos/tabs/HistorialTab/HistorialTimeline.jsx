import { Badge } from '@components/ui/badge'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { 
  Circle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Building2,
  Users,
  FileText,
  DollarSign,
  Settings
} from 'lucide-react'
import { formatDate, formatDateTime } from '@utils/formatters'
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
  OTRO: Settings
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

export const HistorialTimeline = ({ eventos, proceso }) => {
  // Agrupar por fecha
  const eventosPorFecha = eventos.reduce((acc, evento) => {
    const fecha = formatDate(evento.fecha)
    if (!acc[fecha]) {
      acc[fecha] = []
    }
    acc[fecha].push(evento)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.entries(eventosPorFecha).map(([fecha, eventosDelDia]) => (
        <div key={fecha}>
          {/* Fecha Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {fecha}
            </span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* Eventos del día */}
          <div className="space-y-4">
            {eventosDelDia.map((evento, index) => {
              const Icon = TIPO_ICONS[evento.tipoEvento] || Circle
              const colorClass = TIPO_COLORS[evento.tipoEvento] || TIPO_COLORS.OTRO

              return (
                <div key={evento.id} className="flex gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      colorClass
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {index < eventosDelDia.length - 1 && (
                      <div className="w-px h-full bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 pb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {evento.titulo}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {evento.descripcion}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDateTime(evento.fecha).split(' ')[1]}
                        </span>
                      </div>

                      {/* Metadata */}
                      {evento.metadata && Object.keys(evento.metadata).length > 0 && (
                        <div className="mt-3 bg-gray-50 rounded p-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(evento.metadata).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-gray-500">{key}:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {typeof value === 'object' ? JSON.stringify(value) : value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Usuario */}
                      {evento.usuario && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-gray-600">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                              {evento.usuario.nombre?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{evento.usuario.nombre}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}