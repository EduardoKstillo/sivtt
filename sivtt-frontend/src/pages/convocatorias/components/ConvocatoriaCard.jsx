import { Card, CardContent } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Calendar, FileText, Award } from 'lucide-react'
import { formatDate } from '@utils/formatters'

const ESTADO_CONFIG = {
  ABIERTA: { label: 'Abierta', color: 'bg-green-100 text-green-700', icon: '🟢' },
  CERRADA: { label: 'Cerrada', color: 'bg-gray-100 text-gray-700', icon: '⚫' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: '🔴' }
}

export const ConvocatoriaCard = ({ convocatoria, onClick }) => {
  const estadoConfig = ESTADO_CONFIG[convocatoria.estado]

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {convocatoria.codigo}
              </h3>
              <Badge className={estadoConfig.color}>
                {estadoConfig.icon} {estadoConfig.label}
              </Badge>
            </div>
            
            {convocatoria.proceso && (
              <p className="text-sm text-gray-600 line-clamp-1">
                {convocatoria.proceso.titulo}
              </p>
            )}
          </div>

          {/* Fechas */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Apertura: {formatDate(convocatoria.fechaApertura)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Cierre: {formatDate(convocatoria.fechaCierre)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{convocatoria.postulaciones?.length || 0} postulaciones</span>
            </div>
            
            {convocatoria.ganador && (
              <div className="flex items-center gap-1 text-green-700">
                <Award className="h-4 w-4" />
                <span className="font-medium">Con ganador</span>
              </div>
            )}
          </div>

          {/* Relanzamiento */}
          {convocatoria.esRelanzamiento && (
            <Badge variant="outline" className="w-full justify-center">
              🔄 Relanzamiento
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}