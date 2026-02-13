import { Card, CardContent } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Calendar, FileText, Award, Clock, Send, CheckCircle2, XCircle } from 'lucide-react'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const ESTADO_CONFIG = {
  BORRADOR: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: Clock },
  PUBLICADA: { label: 'Publicada', color: 'bg-blue-100 text-blue-700', icon: Send },
  CERRADA: { label: 'Cerrada', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: XCircle }
}

export const ConvocatoriaCard = ({ convocatoria, onClick }) => {
  const estadoConfig = ESTADO_CONFIG[convocatoria.estatus] || ESTADO_CONFIG.BORRADOR
  const IconEstado = estadoConfig.icon

  // Lectura segura de estadísticas
  const totalPostulaciones = convocatoria.postulaciones?.total || 0
  const tieneGanador = convocatoria.postulaciones?.seleccionadas > 0

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {convocatoria.codigo}
              </h3>
              <Badge className={cn("flex-shrink-0", estadoConfig.color)}>
                <IconEstado className="h-3 w-3 mr-1" />
                {estadoConfig.label}
              </Badge>
            </div>
            
            <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1" title={convocatoria.titulo}>
              {convocatoria.titulo}
            </h4>

            {convocatoria.reto?.proceso && (
              <p className="text-xs text-gray-500 line-clamp-1">
                Proceso: {convocatoria.reto.proceso.titulo}
              </p>
            )}
          </div>

          {/* Fechas */}
          <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span>Apertura: {formatDate(convocatoria.fechaApertura)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span>Cierre: {formatDate(convocatoria.fechaCierre)}</span>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <div className="flex items-center gap-1.5 text-gray-600">
              <FileText className="h-3.5 w-3.5" />
              <span className="font-medium">{totalPostulaciones}</span> postulaciones
            </div>
            
            {tieneGanador && (
              <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                <Award className="h-3 w-3" />
                <span className="font-medium">Ganador</span>
              </div>
            )}
          </div>

          {/* Relanzamiento Badge */}
          {convocatoria.esRelanzamiento && (
            <Badge variant="outline" className="w-full justify-center text-[10px] h-5 bg-orange-50 text-orange-700 border-orange-200">
              🔄 Relanzamiento #{convocatoria.numeroRelanzamiento}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}