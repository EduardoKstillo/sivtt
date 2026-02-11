import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@components/ui/dropdown-menu'
import { 
  Upload, FileText, Eye, CheckCircle2, XCircle, Clock, AlertCircle, 
  Link as LinkIcon, ExternalLink, MoreVertical, Trash2, Edit 
} from 'lucide-react'
import { SubirEvidenciaModal } from './modals/SubirEvidenciaModal'
import { RevisarEvidenciaModal } from './modals/RevisarEvidenciaModal'
import { evidenciasAPI } from '@api/endpoints/evidencias' // Asegúrate de importar la API
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const ESTADO_EVIDENCIA_CONFIG = {
  APROBADA: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', badge: 'bg-green-100 text-green-700' },
  PENDIENTE: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  RECHAZADA: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' }
}

export const EvidenciasList = ({ actividad, onUpdate }) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedEvidencia, setSelectedEvidencia] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const evidencias = Array.isArray(actividad.evidencias) ? actividad.evidencias : []
  
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

  const handleDeleteEvidencia = async (evidencia) => {
    if (!confirm('¿Eliminar esta evidencia?')) return
    
    setDeletingId(evidencia.id)
    try {
      await evidenciasAPI.delete(evidencia.id)
      toast({ title: 'Evidencia eliminada', description: 'Se ha recalculado el estado de la actividad.' })
      onUpdate() // Refrescar lista y estado
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    } finally {
      setDeletingId(null)
    }
  }

  // Opcional: Si quieres editar metadatos (descripcion, nombre)
  const handleEditEvidencia = (evidencia) => {
     // Aquí abrirías un modal pequeño para editar texto. 
     // Por brevedad, lo dejo como placeholder o podrías reusar el modal de subida en modo "edit".
     toast({ description: "Funcionalidad de edición pendiente de modal" })
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
            const isLink = evidencia.tipoEvidencia === 'ENLACE' || (evidencia.tipoEvidencia === 'OTRO' && evidencia.urlArchivo?.startsWith('http'))
            
            // REGLA DE NEGOCIO: Solo se puede eliminar si NO ha sido revisada (está pendiente)
            // Y la actividad no está cerrada.
            const canDelete = evidencia.estado === 'PENDIENTE' && actividad.estado !== 'APROBADA';

            return (
              <div key={evidencia.id} className="group border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-start gap-3 relative">
                
                {/* Icon */}
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1", isLink ? "bg-blue-50" : estadoConfig.bg)}>
                  {isLink ? <LinkIcon className="h-5 w-5 text-blue-600" /> : <FileText className={cn("h-5 w-5", estadoConfig.color)} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1 pr-6">
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm truncate max-w-[200px] sm:max-w-xs" title={evidencia.nombreArchivo}>
                        {evidencia.nombreArchivo}
                      </h5>
                      <p className="text-xs text-gray-500">
                        v{evidencia.version} • {evidencia.tipoEvidencia}
                      </p>
                    </div>
                    <Badge className={cn("text-[10px] h-5 px-1.5", estadoConfig.badge)}>
                      <IconEstado className="h-3 w-3 mr-1" /> {evidencia.estado}
                    </Badge>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Por: <span className="font-medium">{evidencia.subidoPor?.nombres || 'Usuario'}</span> • {formatDate(evidencia.createdAt)}</p>
                    {evidencia.revisadoPor && <p className="text-gray-400">Revisado por: {evidencia.revisadoPor.nombres}</p>}
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
                      {isLink ? <ExternalLink className="h-3 w-3 mr-1.5" /> : <Eye className="h-3 w-3 mr-1.5" />}
                      {isLink ? 'Abrir Enlace' : 'Ver Archivo'}
                    </Button>

                    {evidencia.estado === 'PENDIENTE' && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600" onClick={() => handleReview(evidencia)}>
                        Revisar
                      </Button>
                    )}
                  </div>
                </div>

                {/* 🔥 MENÚ OPCIONES EVIDENCIA */}
                {canUpload && (
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditEvidencia(evidencia)}>
                          <Edit className="h-3.5 w-3.5 mr-2" /> Editar detalles
                        </DropdownMenuItem>
                        {canDelete ? (
                 <DropdownMenuItem 
                   onClick={() => handleDeleteEvidencia(evidencia)} 
                   className="text-red-600 focus:text-red-600"
                   disabled={deletingId === evidencia.id}
                 >
                   <Trash2 className="h-3.5 w-3.5 mr-2" /> Eliminar
                 </DropdownMenuItem>
             ) : (
                 <div className="px-2 py-1.5 text-xs text-muted-foreground italic max-w-[150px]">
                    No se puede eliminar (ya revisada).
                 </div>
             )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
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
          onUpdate()
        }}
      />

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