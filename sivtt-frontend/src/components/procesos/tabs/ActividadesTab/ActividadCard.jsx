import { Card, CardContent } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar,
  FileText,
  Users,
  Paperclip
} from 'lucide-react'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const ESTADO_CONFIG = {
  APROBADA: { 
    icon: CheckCircle2, 
    color: 'text-green-600', 
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-700 border-green-200'
  },
  EN_PROGRESO: { 
    icon: Clock, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  EN_REVISION: { 
    icon: Clock, 
    color: 'text-amber-600', 
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  OBSERVADA: { 
    icon: AlertCircle, 
    color: 'text-orange-600', 
    bg: 'bg-orange-50',
    badge: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  LISTA_PARA_CIERRE: { 
    icon: CheckCircle2, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  CREADA: { 
    icon: FileText, 
    color: 'text-gray-600', 
    bg: 'bg-gray-50',
    badge: 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const TIPO_ICONS = {
  DOCUMENTO: FileText,
  REUNION: Users,
  TAREA: CheckCircle2,
  REVISION: Clock,
  OTRO: FileText
}

export const ActividadCard = ({ actividad, onClick }) => {
  const estadoConfig = ESTADO_CONFIG[actividad.estado] || ESTADO_CONFIG.CREADA
  const IconEstado = estadoConfig.icon
  const IconTipo = TIPO_ICONS[actividad.tipo] || FileText

  const isVencida = actividad.fechaLimite && 
    new Date(actividad.fechaLimite) < new Date() && 
    actividad.estado !== 'APROBADA'

  // Manejo de responsables como array plano
  const responsable = actividad.responsables?.[0]

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Icono de Estado */}
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0", estadoConfig.bg)}>
            <IconEstado className={cn("h-6 w-6", estadoConfig.color)} />
          </div>

          {/* Contenido Principal */}
          <div className="flex-1 min-w-0">
            {/* Cabecera: Nombre y Badges */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-gray-900">
                {actividad.nombre}
              </h3>

              <div className="flex items-center gap-2 flex-shrink-0">
                {actividad.obligatoria && (
                  <Badge variant="destructive" className="text-xs">
                    Obligatoria
                  </Badge>
                )}
                <Badge variant="outline" className={cn("text-xs font-medium border-0 px-2 h-5", estadoConfig.badge)}>
                  {actividad.estado.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              {/* Fase */}
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Fase:</span>
                <Badge variant="outline" className="text-xs">
                  {actividad.fase}
                </Badge>
              </div>

              {/* Tipo */}
              <div className="flex items-center gap-1">
                <IconTipo className="h-4 w-4 text-gray-400" />
                <span>{actividad.tipo}</span>
              </div>

              {/* Responsable */}
              {responsable && (
                <div className="flex items-center gap-1" title={`${responsable.nombres} ${responsable.apellidos}`}>
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>
                    {responsable.nombres.split(' ')[0]} {responsable.apellidos.split(' ')[0]}
                    {actividad.responsables.length > 1 && ` +${actividad.responsables.length - 1}`}
                  </span>
                </div>
              )}

              {/* Evidencias */}
              {actividad.evidencias && actividad.evidencias.total > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-4 w-4 text-gray-400" />
                  <span>
                    {actividad.evidencias.aprobadas}/{actividad.evidencias.total} evidencias
                  </span>
                </div>
              )}

              {/* Fecha Límite */}
              {actividad.fechaLimite && (
                <div className={cn(
                  "flex items-center gap-1",
                  isVencida && "text-red-600 font-medium"
                )}>
                  <Calendar className="h-4 w-4" />
                  <span>
                    {isVencida ? '⚠️ Vencida: ' : 'Vence: '}
                    {formatDate(actividad.fechaLimite)}
                  </span>
                </div>
              )}
            </div>

            {/* Descripción */}
            {actividad.descripcion && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {actividad.descripcion}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
