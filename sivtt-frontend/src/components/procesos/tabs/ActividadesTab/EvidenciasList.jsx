import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
import { 
  Upload, 
  FileText, 
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { SubirEvidenciaModal } from './modals/SubirEvidenciaModal'
import { RevisarEvidenciaModal } from './modals/RevisarEvidenciaModal'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const ESTADO_EVIDENCIA_CONFIG = {
  APROBADA: { 
    icon: CheckCircle2, 
    color: 'text-green-600', 
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-700'
  },
  PENDIENTE: { 
    icon: Clock, 
    color: 'text-amber-600', 
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700'
  },
  RECHAZADA: { 
    icon: XCircle, 
    color: 'text-red-600', 
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700'
  }
}

export const EvidenciasList = ({ actividad, onUpdate }) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedEvidencia, setSelectedEvidencia] = useState(null)

  // ✅ CORRECCIÓN: El backend en getById devuelve el array directo
  const evidencias = Array.isArray(actividad.evidencias) ? actividad.evidencias : []
  
  // Calcular estadísticas localmente
  const stats = {
    aprobadas: evidencias.filter(e => e.estado === 'APROBADA').length,
    pendientes: evidencias.filter(e => e.estado === 'PENDIENTE').length,
    rechazadas: evidencias.filter(e => e.estado === 'RECHAZADA').length
  }

  const canUpload = actividad.estado !== 'APROBADA'

  const handleReview = (evidencia) => {
    setSelectedEvidencia(evidencia)
    setReviewModalOpen(true)
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">
            Archivos Adjuntos ({evidencias.length})
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            {stats.aprobadas} aprobadas • {stats.pendientes} pendientes • {stats.rechazadas} rechazadas
          </p>
        </div>

        {canUpload && (
          <Button
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
          >
            <Upload className="h-3.5 w-3.5 mr-2" />
            Subir Evidencia
          </Button>
        )}
      </div>

      {/* Lista */}
      {evidencias.length === 0 ? (
        <Alert className="bg-gray-50 border-gray-200">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <AlertDescription className="text-gray-500 text-sm">
            No hay evidencias cargadas. {canUpload && 'Sube el primer archivo para documentar el avance.'}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {evidencias.map((evidencia) => {
            const estadoConfig = ESTADO_EVIDENCIA_CONFIG[evidencia.estado] || ESTADO_EVIDENCIA_CONFIG.PENDIENTE
            const IconEstado = estadoConfig.icon

            return (
              <div
                key={evidencia.id}
                className="group border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-start gap-3"
              >
                {/* Icon */}
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1", estadoConfig.bg)}>
                  <FileText className={cn("h-5 w-5", estadoConfig.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm truncate max-w-[200px] sm:max-w-xs" title={evidencia.nombreArchivo}>
                        {evidencia.nombreArchivo}
                      </h5>
                      <p className="text-xs text-gray-500">
                        v{evidencia.version} • {evidencia.tipoEvidencia || evidencia.tipo}
                      </p>
                    </div>
                    <Badge className={cn("text-[10px] h-5 px-1.5", estadoConfig.badge)}>
                      <IconEstado className="h-3 w-3 mr-1" />
                      {evidencia.estado}
                    </Badge>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      Por: <span className="font-medium">{evidencia.subidoPor?.nombres || 'Usuario'}</span> • {formatDate(evidencia.createdAt)}
                    </p>
                    
                    {evidencia.revisadoPor && (
                      <p className="text-gray-400">
                        Revisado por: {evidencia.revisadoPor.nombres}
                      </p>
                    )}
                    
                    {evidencia.comentarioRevision && (
                      <div className="mt-2 p-2 bg-yellow-50/50 border border-yellow-100 rounded text-yellow-800 italic text-[11px]">
                        "{evidencia.comentarioRevision}"
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => window.open(evidencia.urlArchivo, '_blank')}
                    >
                      <Eye className="h-3 w-3 mr-1.5" />
                      Ver
                    </Button>

                    {/* Mostrar botón Revisar solo si está pendiente */}
                    {evidencia.estado === 'PENDIENTE' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleReview(evidencia)}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1.5" />
                        Revisar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <SubirEvidenciaModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        actividad={actividad}
        onSuccess={() => {
          setUploadModalOpen(false)
          onUpdate() // Esto recargará el hook useActividadDetail
        }}
      />

      {/* Solo renderizar modal de revisión si hay evidencia seleccionada */}
      {selectedEvidencia && (
        <RevisarEvidenciaModal
          open={reviewModalOpen}
          onOpenChange={(open) => {
            setReviewModalOpen(open)
            if (!open) setSelectedEvidencia(null)
          }}
          evidencia={selectedEvidencia}
          onSuccess={() => {
            setReviewModalOpen(false)
            onUpdate()
          }}
        />
      )}
    </div>
  )
}