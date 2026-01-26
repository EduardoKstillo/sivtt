import { useState } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
import { 
  Calendar, 
  Users, 
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react'
import { PostulacionesList } from './PostulacionesList'
import { useConvocatorias } from '@hooks/useConvocatorias'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { EmptyState } from '@components/common/EmptyState'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const ESTADO_CONFIG = {
  ABIERTA: { 
    icon: Clock, 
    label: 'Abierta',
    color: 'bg-blue-100 text-blue-700'
  },
  CERRADA: { 
    icon: CheckCircle2, 
    label: 'Cerrada',
    color: 'bg-gray-100 text-gray-700'
  },
  CANCELADA: { 
    icon: XCircle, 
    label: 'Cancelada',
    color: 'bg-red-100 text-red-700'
  }
}

export const ConvocatoriasList = ({ proceso, onUpdate }) => {
  const [expandedConvocatoria, setExpandedConvocatoria] = useState(null)
  const { convocatorias, loading, refetch } = useConvocatorias(proceso.id)

  if (loading) {
    return <LoadingSpinner />
  }

  if (convocatorias.length === 0) {
    return (
      <EmptyState
        title="No hay convocatorias"
        description="Las convocatorias se crean automáticamente en la fase CONVOCATORIA"
      />
    )
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          Las convocatorias permiten que grupos de investigación postulen soluciones al reto empresarial.
          Puedes evaluar cada postulación y seleccionar al ganador.
        </AlertDescription>
      </Alert>

      {convocatorias.map((convocatoria) => {
        const estadoConfig = ESTADO_CONFIG[convocatoria.estado]
        const IconEstado = estadoConfig.icon
        const isExpanded = expandedConvocatoria === convocatoria.id

        return (
          <Card key={convocatoria.id}>
            <CardContent className="pt-6">
              {/* Header */}
              <div 
                className="flex items-start justify-between cursor-pointer mb-4"
                onClick={() => setExpandedConvocatoria(isExpanded ? null : convocatoria.id)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    )}
                  </Button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {convocatoria.codigo}
                      </h3>
                      <Badge className={estadoConfig.color}>
                        <IconEstado className="h-3 w-3 mr-1" />
                        {estadoConfig.label}
                      </Badge>
                      {convocatoria.esRelanzamiento && (
                        <Badge variant="outline">
                          🔄 Relanzamiento
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(convocatoria.fechaApertura)} - {formatDate(convocatoria.fechaCierre)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{convocatoria.postulaciones?.length || 0} postulaciones</span>
                      </div>

                      {convocatoria.ganador && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-green-700 font-medium">
                            Ganador seleccionado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t">
                  {convocatoria.motivoRelanzamiento && (
                    <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                      <AlertDescription className="text-yellow-900 text-sm">
                        <strong>Motivo de relanzamiento:</strong> {convocatoria.motivoRelanzamiento}
                      </AlertDescription>
                    </Alert>
                  )}

                  <PostulacionesList
                    convocatoria={convocatoria}
                    proceso={proceso}
                    onUpdate={refetch}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}