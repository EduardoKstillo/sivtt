import { Card, CardContent } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar,
  FileText,
  Users,
  Paperclip,
  AlertTriangle // Icono para rechazadas
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
    color: 'text-red-600', // Rojo más fuerte para llamar la atención
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700 border-red-200'
  },
  LISTA_PARA_CIERRE: { 
    icon: CheckCircle2, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  CREADA: { 
    icon: FileText, 
    color: 'text-gray-500', 
    bg: 'bg-gray-100',
    badge: 'bg-gray-100 text-gray-700 border-gray-200'
  },
  RECHAZADA: { // Agregado por seguridad si la actividad entera se rechaza
    icon: AlertCircle, 
    color: 'text-red-600', 
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700 border-red-200'
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

  // Lógica de Vencimiento
  const isVencida = actividad.fechaLimite && 
    new Date(actividad.fechaLimite) < new Date() && 
    actividad.estado !== 'APROBADA' && 
    actividad.estado !== 'LISTA_PARA_CIERRE'

  // Backend devuelve array: 'responsables'
  const responsable = actividad.responsables?.[0]
  const masResponsables = (actividad.responsables?.length || 0) - 1

  // Datos de evidencias del backend
  const evidenciasData = actividad.evidencias || { total: 0, aprobadas: 0, rechazadas: 0 }
  const tieneRechazos = evidenciasData.rechazadas > 0

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-all cursor-pointer border-l-4",
        // Borde izquierdo de color según estado para identificación rápida
        actividad.estado === 'OBSERVADA' ? "border-l-red-500" : 
        actividad.estado === 'APROBADA' ? "border-l-green-500" :
        actividad.estado === 'LISTA_PARA_CIERRE' ? "border-l-purple-500" :
        "border-l-transparent"
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Icono de Estado */}
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1", estadoConfig.bg)}>
            <IconEstado className={cn("h-5 w-5", estadoConfig.color)} />
          </div>

          {/* Contenido Principal */}
          <div className="flex-1 min-w-0">
            {/* Cabecera: Nombre y Badges */}
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="font-medium text-gray-900 leading-snug">
                {actividad.nombre}
              </h3>

              <div className="flex items-center gap-2 flex-shrink-0">
                {actividad.obligatoria && (
                   <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                     Obligatoria
                   </span>
                )}
                <Badge variant="outline" className={cn("text-[10px] font-medium border-0 px-2 h-5", estadoConfig.badge)}>
                  {actividad.estado.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            {/* Descripción corta */}
            {actividad.descripcion && (
              <p className="text-sm text-gray-500 line-clamp-1 mb-3">
                {actividad.descripcion}
              </p>
            )}

            {/* Metadata Footer */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mt-2">
              
              {/* Tipo */}
              <div className="flex items-center gap-1.5">
                <IconTipo className="h-3.5 w-3.5" />
                <span className="capitalize">{actividad.tipo.toLowerCase()}</span>
              </div>

              {/* Responsable */}
              {responsable && (
                <div className="flex items-center gap-1.5" title="Responsable">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {responsable.nombres?.split(' ')[0]} {responsable.apellidos?.split(' ')[0]}
                    {masResponsables > 0 && ` +${masResponsables}`}
                  </span>
                </div>
              )}

              {/* Evidencias (Con alerta de rechazo) */}
              {evidenciasData.total > 0 && (
                <div className={cn(
                  "flex items-center gap-1.5",
                  tieneRechazos ? "text-red-600 font-medium" : ""
                )}>
                  {tieneRechazos ? <AlertTriangle className="h-3.5 w-3.5"/> : <Paperclip className="h-3.5 w-3.5" />}
                  <span>
                    {evidenciasData.aprobadas}/{evidenciasData.total}
                    {tieneRechazos && " (Revisar)"}
                  </span>
                </div>
              )}

              {/* Fecha Límite */}
              {actividad.fechaLimite && (
                <div className={cn(
                  "flex items-center gap-1.5 ml-auto",
                  isVencida ? "text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded" : ""
                )}>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {formatDate(actividad.fechaLimite)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}