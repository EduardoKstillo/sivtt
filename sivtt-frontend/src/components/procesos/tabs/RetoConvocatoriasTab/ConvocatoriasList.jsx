import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import {
  Plus, MoreVertical, Calendar, FileText, Send,
  XCircle, RefreshCw, Info, Clock, CheckCircle2
} from 'lucide-react'
import { PostulacionesList } from './PostulacionesList'
import { CrearConvocatoriaModal } from './modals/CrearConvocatoriaModal'
import { RelanzarConvocatoriaModal } from './modals/RelanzarConvocatoriaModal'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { EmptyState } from '@components/common/EmptyState'
import { convocatoriasAPI } from '@api/endpoints/convocatorias'
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

// ✅ Importaciones para ReBAC
import { useAuthStore } from '@store/authStore'
import { ROLES } from '@utils/permissions'

// Colores semánticos — idéntico al patrón de ConvocatoriaCard
const ESTADO_CONFIG = {
  BORRADOR:  { label: 'Borrador',  badge: 'bg-muted text-muted-foreground',               icon: Clock        },
  PUBLICADA: { label: 'Publicada', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',    icon: Send         },
  CERRADA:   { label: 'Cerrada',   badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
  CANCELADA: { label: 'Cancelada', badge: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle     }
}

export const ConvocatoriasList = ({ convocatorias, loading, reto, proceso, onConvocatoriaCreated, onUpdate }) => {
  const [crearModalOpen, setCrearModalOpen]       = useState(false)
  const [relanzarModalOpen, setRelanzarModalOpen] = useState(false)
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null)
  const [actionLoading, setActionLoading]         = useState(false)

  // ✅ LÓGICA ReBAC
  const { user } = useAuthStore()
  const isAdmin = user?.roles?.includes(ROLES.ADMIN_SISTEMA)
  const isGestorProceso = proceso?.usuarios?.some(
    u => u.id === user?.id && u.rol?.codigo === 'GESTOR_PROCESO'
  )
  const canManageConvocatoria = isAdmin || isGestorProceso

  const handlePublicar = async (convocatoria) => {
    if (!confirm(`¿Publicar la convocatoria ${convocatoria.codigo}?`)) return
    setActionLoading(true)
    try {
      await convocatoriasAPI.publicar(convocatoria.id)
      toast({ title: 'Convocatoria publicada', description: 'La convocatoria está ahora visible para los grupos' })
      onUpdate()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al publicar', description: error.response?.data?.message || 'Intente nuevamente' })
    } finally { setActionLoading(false) }
  }

  const handleCerrar = async (convocatoria) => {
    if (!confirm(`¿Cerrar la convocatoria ${convocatoria.codigo}?`)) return
    setActionLoading(true)
    try {
      await convocatoriasAPI.cerrar(convocatoria.id)
      toast({ title: 'Convocatoria cerrada', description: 'No se aceptarán más postulaciones' })
      onUpdate()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al cerrar', description: error.response?.data?.message || 'Intente nuevamente' })
    } finally { setActionLoading(false) }
  }

  const handleRelanzar = (convocatoria) => {
    setSelectedConvocatoria(convocatoria)
    setRelanzarModalOpen(true)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Convocatorias ({convocatorias.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestiona las convocatorias para este reto
          </p>
        </div>
        {canManageConvocatoria && (
          <Button onClick={() => setCrearModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Convocatoria
          </Button>
        )}
      </div>

      {/* Info — bg-primary/5 del sistema */}
      <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20 py-2.5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-muted-foreground text-xs ml-2">
          Las convocatorias pasan por tres estados: <strong className="text-foreground">BORRADOR</strong> (editable) →{' '}
          <strong className="text-foreground">PUBLICADA</strong> (grupos pueden postular) →{' '}
          <strong className="text-foreground">CERRADA</strong> (se evalúan postulaciones)
        </AlertDescription>
      </Alert>

      {/* Lista */}
      {convocatorias.length === 0 ? (
        <EmptyState
          title="No hay convocatorias"
          description="Crea la primera convocatoria para este reto"
          action={canManageConvocatoria ? () => setCrearModalOpen(true) : undefined}
          actionLabel="Crear convocatoria"
        />
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {convocatorias.map((convocatoria) => {
            const estadoConfig = ESTADO_CONFIG[convocatoria.estatus] || ESTADO_CONFIG.BORRADOR
            const IconEstado   = estadoConfig.icon

            return (
              <AccordionItem
                key={convocatoria.id}
                value={convocatoria.id.toString()}
                // bg-card border-border en lugar de bg-white
                className="border border-border rounded-lg bg-card overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4">
                  <AccordionTrigger className="flex-1 hover:no-underline py-4">
                    <div className="flex items-center gap-3 w-full flex-wrap">

                      {/* Código */}
                      <p className="font-mono font-semibold text-sm text-foreground shrink-0">
                        {convocatoria.codigo}
                      </p>

                      {/* Estado */}
                      <Badge
                        variant="secondary"
                        className={cn('text-[10px] h-5 gap-1 shrink-0', estadoConfig.badge)}
                      >
                        <IconEstado className="h-2.5 w-2.5" />
                        {estadoConfig.label}
                      </Badge>

                      {/* Relanzamiento — amber semántico, sin emoji */}
                      {convocatoria.esRelanzamiento && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0"
                        >
                          Relanzamiento #{convocatoria.numeroRelanzamiento}
                        </Badge>
                      )}

                      {/* Fechas — text-muted-foreground en lugar de text-gray-600 */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(convocatoria.fechaApertura)}</span>
                        </div>
                        <span>→</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(convocatoria.fechaCierre)}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground tabular-nums">
                          {convocatoria.postulaciones?.total || 0}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>

                  {/* Actions — solo para gestores */}
                  {canManageConvocatoria && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={actionLoading} className="h-8 w-8 text-muted-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        {convocatoria.estatus === 'BORRADOR' && (
                          <>
                            <DropdownMenuItem onClick={() => handlePublicar(convocatoria)}>
                              <Send className="mr-2 h-4 w-4" /> Publicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {convocatoria.estatus === 'PUBLICADA' && (
                          <>
                            <DropdownMenuItem onClick={() => handleCerrar(convocatoria)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Cerrar convocatoria
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {convocatoria.estatus === 'CERRADA' && (
                          <>
                            <DropdownMenuItem onClick={() => handleRelanzar(convocatoria)}>
                              <RefreshCw className="mr-2 h-4 w-4" /> Relanzar convocatoria
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem disabled>Ver detalles</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <AccordionContent className="px-4 pb-4">
                  {/* Motivo relanzamiento — amber semántico */}
                  {convocatoria.esRelanzamiento && convocatoria.motivoRelanzamiento && (
                    <Alert className="mb-4 bg-amber-500/10 border-amber-500/20 py-2.5">
                      <Info className="h-4 w-4 text-amber-500" />
                      <AlertDescription className="text-muted-foreground text-xs ml-2">
                        <span className="font-medium text-foreground">Motivo de relanzamiento:</span>{' '}
                        {convocatoria.motivoRelanzamiento}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* ✅ Permiso hacia abajo */}
                  <PostulacionesList
                    convocatoria={convocatoria}
                    proceso={proceso}
                    onUpdate={onUpdate}
                    canManage={canManageConvocatoria}
                  />
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}

      {canManageConvocatoria && (
        <>
          <CrearConvocatoriaModal
            open={crearModalOpen}
            onOpenChange={setCrearModalOpen}
            reto={reto}
            onSuccess={() => { setCrearModalOpen(false); onConvocatoriaCreated() }}
          />
          <RelanzarConvocatoriaModal
            open={relanzarModalOpen}
            onOpenChange={setRelanzarModalOpen}
            convocatoria={selectedConvocatoria}
            onSuccess={() => { setRelanzarModalOpen(false); setSelectedConvocatoria(null); onUpdate() }}
          />
        </>
      )}
    </div>
  )
}