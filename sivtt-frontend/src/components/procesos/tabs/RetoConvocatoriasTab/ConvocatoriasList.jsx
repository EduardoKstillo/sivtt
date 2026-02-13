import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion'
import { 
  Plus, 
  MoreVertical,
  Calendar,
  FileText,
  Send,
  XCircle,
  RefreshCw,
  Info,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { PostulacionesList } from './PostulacionesList'
import { CrearConvocatoriaModal } from './modals/CrearConvocatoriaModal'
import { RelanzarConvocatoriaModal } from './modals/RelanzarConvocatoriaModal'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { EmptyState } from '@components/common/EmptyState'
import { convocatoriasAPI } from '@api/endpoints/convocatorias'
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'

const ESTADO_CONFIG = {
  BORRADOR: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: Clock },
  PUBLICADA: { label: 'Publicada', color: 'bg-blue-100 text-blue-700', icon: Send },
  CERRADA: { label: 'Cerrada', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: XCircle }
}

export const ConvocatoriasList = ({ convocatorias, loading, reto, proceso, onConvocatoriaCreated, onUpdate }) => {
  const [crearModalOpen, setCrearModalOpen] = useState(false)
  const [relanzarModalOpen, setRelanzarModalOpen] = useState(false)
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const handlePublicar = async (convocatoria) => {
    if (!confirm(`¿Publicar la convocatoria ${convocatoria.codigo}?`)) return

    setActionLoading(true)
    try {
      await convocatoriasAPI.publicar(convocatoria.id)
      
      toast({
        title: "Convocatoria publicada",
        description: "La convocatoria está ahora visible para los grupos"
      })
      
      onUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al publicar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCerrar = async (convocatoria) => {
    if (!confirm(`¿Cerrar la convocatoria ${convocatoria.codigo}?`)) return

    setActionLoading(true)
    try {
      await convocatoriasAPI.cerrar(convocatoria.id)
      
      toast({
        title: "Convocatoria cerrada",
        description: "No se aceptarán más postulaciones"
      })
      
      onUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cerrar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRelanzar = (convocatoria) => {
    setSelectedConvocatoria(convocatoria)
    setRelanzarModalOpen(true)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">
            Convocatorias ({convocatorias.length})
          </h3>
          <p className="text-sm text-gray-500">
            Gestiona las convocatorias para este reto
          </p>
        </div>
        <Button
          onClick={() => setCrearModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Convocatoria
        </Button>
      </div>

      {/* Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          Las convocatorias pasan por tres estados: <strong>BORRADOR</strong> (editable) → 
          <strong> PUBLICADA</strong> (grupos pueden postular) → <strong>CERRADA</strong> (se evalúan postulaciones)
        </AlertDescription>
      </Alert>

      {/* Lista */}
      {convocatorias.length === 0 ? (
        <EmptyState
          title="No hay convocatorias"
          description="Crea la primera convocatoria para este reto"
          action={() => setCrearModalOpen(true)}
          actionLabel="Crear convocatoria"
        />
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {convocatorias.map((convocatoria) => {
            const estadoConfig = ESTADO_CONFIG[convocatoria.estatus]
            const IconEstado = estadoConfig.icon

            return (
              <AccordionItem 
                key={convocatoria.id} 
                value={convocatoria.id.toString()}
                className="border rounded-lg bg-white"
              >
                <div className="flex items-center gap-3 px-4">
                  <AccordionTrigger className="flex-1 hover:no-underline py-4">
                    <div className="flex items-center gap-4 w-full">
                      {/* Código */}
                      <div className="flex-shrink-0">
                        <p className="font-mono font-semibold text-gray-900">
                          {convocatoria.codigo}
                        </p>
                      </div>

                      {/* Estado */}
                      <Badge className={estadoConfig.color}>
                        <IconEstado className="h-3 w-3 mr-1" />
                        {estadoConfig.label}
                      </Badge>

                      {/* Relanzamiento */}
                      {convocatoria.esRelanzamiento && (
                        <Badge variant="outline" className="bg-orange-50">
                          🔄 Relanzamiento #{convocatoria.numeroRelanzamiento}
                        </Badge>
                      )}

                      {/* Fechas */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 ml-auto">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(convocatoria.fechaApertura)}</span>
                        </div>
                        <span>→</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(convocatoria.fechaCierre)}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-1 text-sm">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {convocatoria.postulaciones?.total || 0}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={actionLoading}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {convocatoria.estatus === 'BORRADOR' && (
                        <>
                          <DropdownMenuItem onClick={() => handlePublicar(convocatoria)}>
                            <Send className="mr-2 h-4 w-4" />
                            Publicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}

                      {convocatoria.estatus === 'PUBLICADA' && (
                        <>
                          <DropdownMenuItem onClick={() => handleCerrar(convocatoria)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Cerrar convocatoria
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}

                      {convocatoria.estatus === 'CERRADA' && (
                        <>
                          <DropdownMenuItem onClick={() => handleRelanzar(convocatoria)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Relanzar convocatoria
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}

                      <DropdownMenuItem disabled>
                        Ver detalles
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content */}
                <AccordionContent className="px-4 pb-4">
                  {/* Motivo de Relanzamiento */}
                  {convocatoria.esRelanzamiento && convocatoria.motivoRelanzamiento && (
                    <Alert className="mb-4 bg-orange-50 border-orange-200">
                      <Info className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-900 text-sm">
                        <strong>Motivo de relanzamiento:</strong> {convocatoria.motivoRelanzamiento}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Postulaciones */}
                  <PostulacionesList
                    convocatoria={convocatoria}
                    proceso={proceso}
                    onUpdate={onUpdate}
                  />
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}

      {/* Modales */}
      <CrearConvocatoriaModal
        open={crearModalOpen}
        onOpenChange={setCrearModalOpen}
        reto={reto}
        onSuccess={() => {
          setCrearModalOpen(false)
          onConvocatoriaCreated()
        }}
      />

      <RelanzarConvocatoriaModal
        open={relanzarModalOpen}
        onOpenChange={setRelanzarModalOpen}
        convocatoria={selectedConvocatoria}
        onSuccess={() => {
          setRelanzarModalOpen(false)
          setSelectedConvocatoria(null)
          onUpdate()
        }}
      />
    </div>
  )
}