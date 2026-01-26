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
  APROBADA: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  EN_PROGRESO: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
  EN_REVISION: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  OBSERVADA: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  LISTA_PARA_CIERRE: { icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
  CREADA: { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-50' }
}

export const FaseActividadesList = ({ actividades, procesoId }) => {
  if (!actividades || actividades.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm border rounded-lg border-dashed">
        No hay actividades configuradas para esta fase
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 text-sm uppercase tracking-wide">
          Actividades ({actividades.length})
        </h4>
        <Button variant="link" size="sm" asChild className="text-blue-600 h-auto p-0">
          <Link to={`/procesos/${procesoId}?tab=actividades`}>
            Gestionar Actividades
            <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-3">
        {actividades.slice(0, 5).map((actividad) => {
          const estadoConfig = ESTADO_ICONS[actividad.estado] || ESTADO_ICONS.CREADA
          const IconComponent = estadoConfig.icon
          
          // ✅ CORRECCIÓN: El backend devuelve un array plano de usuarios en 'responsables'
          const responsable = actividad.responsables?.[0] 

          return (
            <div
              key={actividad.id}
              className="group flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
            >
              {/* Icon */}
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", estadoConfig.bg)}>
                <IconComponent className={cn("h-4 w-4", estadoConfig.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-medium text-gray-900 text-sm leading-snug group-hover:text-blue-700">
                    {actividad.nombre}
                  </h5>
                  {actividad.obligatoria && (
                    <Badge variant="secondary" className="text-[10px] h-5 bg-orange-50 text-orange-700 border-orange-200">
                      Obligatoria
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                  <span className={cn("font-medium", estadoConfig.color)}>
                    {actividad.estado.replace(/_/g, ' ')}
                  </span>

                  {responsable && (
                    <span className="flex items-center gap-1">
                      <UserCircle className="h-3 w-3" />
                      {responsable.nombres} {responsable.apellidos}
                    </span>
                  )}

                  {actividad.fechaLimite && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(actividad.fechaLimite)}
                    </span>
                  )}
                  
                  {actividad.evidencias && (
                    <span>
                      • {actividad.evidencias.aprobadas}/{actividad.evidencias.total} evidencias
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {actividades.length > 5 && (
          <Button variant="ghost" size="sm" asChild className="w-full text-gray-500 text-xs mt-1">
            <Link to={`/procesos/${procesoId}?tab=actividades`}>
              Ver {actividades.length - 5} actividades más...
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}