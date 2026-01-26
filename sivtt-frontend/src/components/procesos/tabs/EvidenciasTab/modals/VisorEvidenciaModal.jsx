import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { 
  X, 
  Download, 
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink
} from 'lucide-react'
import { PDFViewer } from '../viewers/PDFViewer'
import { ImageViewer } from '../viewers/ImageViewer'
import { RevisarEvidenciaModal } from '@components/procesos/tabs/ActividadesTab/modals/RevisarEvidenciaModal'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const ESTADO_CONFIG = {
  APROBADA: { 
    icon: CheckCircle2, 
    color: 'text-green-600', 
    badge: 'bg-green-100 text-green-700'
  },
  PENDIENTE: { 
    icon: Clock, 
    color: 'text-yellow-600', 
    badge: 'bg-yellow-100 text-yellow-700'
  },
  RECHAZADA: { 
    icon: XCircle, 
    color: 'text-red-600', 
    badge: 'bg-red-100 text-red-700'
  }
}

export const VisorEvidenciaModal = ({ evidencia, open, onClose, onUpdate }) => {
  const [reviewModalOpen, setReviewModalOpen] = useState(false)

  if (!evidencia) return null

  const estadoConfig = ESTADO_CONFIG[evidencia.estado]
  const IconEstado = estadoConfig.icon

  const isPDF = evidencia.nombreArchivo?.toLowerCase().endsWith('.pdf')
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => 
    evidencia.nombreArchivo?.toLowerCase().endsWith(`.${ext}`)
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-8">
                <DialogTitle className="text-xl mb-2">
                  {evidencia.nombreArchivo}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <Badge className={estadoConfig.badge}>
                    <IconEstado className="h-3 w-3 mr-1" />
                    {evidencia.estado}
                  </Badge>
                  <span>Versión {evidencia.version}</span>
                  <span>•</span>
                  <span>{evidencia.tipo}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
            <TabsList className="flex-shrink-0">
              <TabsTrigger value="preview">Vista Previa</TabsTrigger>
              <TabsTrigger value="metadata">Información</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 min-h-0 mt-4">
              <div className="h-full overflow-auto bg-gray-50 rounded-lg border border-gray-200">
                {isPDF ? (
                  <PDFViewer url={evidencia.archivoUrl} />
                ) : isImage ? (
                  <ImageViewer url={evidencia.archivoUrl} alt={evidencia.nombreArchivo} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Vista previa no disponible
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Este tipo de archivo no se puede previsualizar en el navegador
                    </p>
                    <Button
                      onClick={() => window.open(evidencia.archivoUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir en nueva pestaña
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="flex-1 overflow-auto mt-4">
              <div className="space-y-6">
                {/* Información del Archivo */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Información del Archivo</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nombre:</span>
                      <p className="font-medium text-gray-900">{evidencia.nombreArchivo}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tipo:</span>
                      <p className="font-medium text-gray-900">{evidencia.tipo}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Versión:</span>
                      <p className="font-medium text-gray-900">{evidencia.version}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Estado:</span>
                      <Badge className={estadoConfig.badge}>
                        {evidencia.estado}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actividad Asociada */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Actividad Asociada</h4>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-gray-500">Nombre:</span>
                      <p className="font-medium text-gray-900">{evidencia.actividad?.nombre}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Fase:</span>
                      <p className="font-medium text-gray-900">{evidencia.actividad?.fase}</p>
                    </div>
                  </div>
                </div>

                {/* Historial */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Historial</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Subida</p>
                        <p className="text-gray-600">
                          Por {evidencia.usuario?.nombre} el {formatDate(evidencia.fechaSubida)}
                        </p>
                      </div>
                    </div>

                    {evidencia.fechaRevision && (
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5",
                          evidencia.estado === 'APROBADA' ? 'bg-green-600' : 'bg-red-600'
                        )}></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {evidencia.estado === 'APROBADA' ? 'Aprobada' : 'Rechazada'}
                          </p>
                          <p className="text-gray-600">
                            Por {evidencia.revisor?.nombre} el {formatDate(evidencia.fechaRevision)}
                          </p>
                          {evidencia.comentarioRevision && (
                            <p className="text-gray-700 mt-1 bg-gray-50 p-2 rounded">
                              💬 {evidencia.comentarioRevision}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions Footer */}
          <div className="flex-shrink-0 flex items-center justify-between gap-3 pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={() => window.open(evidencia.archivoUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>

            {evidencia.estado === 'PENDIENTE' && (
              <Button
                onClick={() => setReviewModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Revisar Evidencia
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Revisión */}
      <RevisarEvidenciaModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        evidencia={evidencia}
        onSuccess={() => {
          setReviewModalOpen(false)
          onUpdate()
          onClose()
        }}
      />
    </>
  )
}