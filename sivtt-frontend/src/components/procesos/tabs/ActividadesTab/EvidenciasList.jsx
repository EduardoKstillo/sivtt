import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { Upload, FileText, Eye, CheckCircle2, XCircle, Clock, AlertCircle, Link as LinkIcon, ExternalLink, MoreVertical, Trash2, Edit, Check } from 'lucide-react'
import { SubirEvidenciaModal } from './modals/SubirEvidenciaModal'
import { RevisarEvidenciaModal } from './modals/RevisarEvidenciaModal'
import { evidenciasAPI } from '@api/endpoints/evidencias'
import { toast } from '@components/ui/use-toast'
import { formatDate, getFileUrl } from '@utils/formatters'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@store/authStore'
import { ROLES } from '@utils/permissions'

const ESTADO_EVIDENCIA = {
  APROBADA: { icon: CheckCircle2, colorClass: 'text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-950/40', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PENDIENTE: { icon: Clock, colorClass: 'text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-50 dark:bg-amber-950/40', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  RECHAZADA: { icon: XCircle, colorClass: 'text-rose-600 dark:text-rose-400', bgClass: 'bg-rose-50 dark:bg-rose-950/40', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
}

export const EvidenciasList = ({ actividad, proceso, onUpdate }) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedEvidencia, setSelectedEvidencia] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const { user } = useAuthStore()
  
  const isAdmin = user?.roles?.includes(ROLES.ADMIN_SISTEMA)
  const isGestorOLider = proceso?.usuarios?.some(u => u.id === user?.id && ['GESTOR_PROCESO', 'LIDER_FASE'].includes(u.rol?.codigo))
  const isResponsable = actividad.asignaciones?.some(a => a.usuario?.id === user?.id && a.rol?.codigo === 'RESPONSABLE_TAREA')
  const isRevisor = actividad.asignaciones?.some(a => a.usuario?.id === user?.id && a.rol?.codigo === 'REVISOR_TAREA')

  const canUpload = (isAdmin || isGestorOLider || isResponsable) && actividad.estado !== 'APROBADA'
const canReview = (isAdmin || isGestorOLider || isRevisor) && 
                    ['EN_REVISION', 'OBSERVADA'].includes(actividad.estado)

  const evidencias = Array.isArray(actividad.evidencias) ? actividad.evidencias : []
  const stats = {
    aprobadas:  evidencias.filter(e => e.estado === 'APROBADA').length,
    pendientes: evidencias.filter(e => e.estado === 'PENDIENTE').length,
    rechazadas: evidencias.filter(e => e.estado === 'RECHAZADA').length,
  }

  // ✅ NUEVO: Averiguar la versión máxima de cada requisito
  const maxVersions = {};
  evidencias.forEach(e => {
    const key = e.requisitoId || `extra-${e.id}`;
    if (!maxVersions[key] || e.version > maxVersions[key]) {
      maxVersions[key] = e.version;
    }
  });

  const handleReview = (evidencia) => { setSelectedEvidencia(evidencia); setReviewModalOpen(true) }

  const handleDeleteEvidencia = async (evidencia) => {
    if (!confirm('¿Eliminar esta evidencia?')) return
    setDeletingId(evidencia.id)
    try {
      await evidenciasAPI.delete(evidencia.id)
      toast({ title: 'Evidencia eliminada' })
      onUpdate()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-foreground text-sm">Archivos Adjuntos</h4>
          <div className="flex items-center gap-2 mt-1.5">
            {stats.aprobadas > 0 && <span className="flex items-center gap-1 text-[11px] text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{stats.aprobadas} aprobadas</span>}
            {stats.pendientes > 0 && <span className="flex items-center gap-1 text-[11px] text-amber-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{stats.pendientes} pendientes</span>}
            {stats.rechazadas > 0 && <span className="flex items-center gap-1 text-[11px] text-rose-600"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{stats.rechazadas} rechazadas</span>}
            {evidencias.length === 0 && <span className="text-[11px] text-muted-foreground">Sin archivos</span>}
          </div>
        </div>

        {canUpload && (
          <Button size="sm" onClick={() => setUploadModalOpen(true)} className="h-8 text-xs gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Subir
          </Button>
        )}
      </div>

      {evidencias.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-6 text-center bg-dot-pattern">
          <AlertCircle className="h-5 w-5 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay evidencias cargadas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {evidencias.map(evidencia => {
            const config   = ESTADO_EVIDENCIA[evidencia.estado] || ESTADO_EVIDENCIA.PENDIENTE

            // ✅ NUEVO: ¿Es esta la última versión?
            const key = evidencia.requisitoId || `extra-${evidencia.id}`;
            const isLatestVersion = evidencia.version === maxVersions[key];

            const IconEstado = config.icon
            const isLink   = evidencia.tipoEvidencia === 'ENLACE' || (evidencia.tipoEvidencia === 'OTRO' && evidencia.urlArchivo?.startsWith('http'))
            const absoluteUrl = getFileUrl(evidencia.urlArchivo)
            
            const isUploader = evidencia.subidoPor?.id === user?.id
            const canDeleteThis = (isAdmin || isGestorOLider || isUploader) && evidencia.estado === 'PENDIENTE' && actividad.estado !== 'APROBADA'

            // ✅ RESUMEN DE VOTOS (EVALUACIONES)
            const evaluaciones = evidencia.evaluaciones || []
            const miVoto = evaluaciones.find(e => e.revisorId === user?.id)

            return (
              <div key={evidencia.id} className="group border border-border rounded-lg p-3.5 hover:bg-muted/20 transition-colors relative">
                <div className="flex items-start gap-3">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', isLink ? 'bg-blue-50' : config.bgClass)}>
                    {isLink ? <LinkIcon className="h-4 w-4 text-blue-600" /> : <FileText className={cn('h-4 w-4', config.colorClass)} />}
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <h5 className="font-medium text-foreground text-sm truncate" title={evidencia.nombreArchivo}>{evidencia.nombreArchivo}</h5>
                        <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">v{evidencia.version} · {evidencia.tipoEvidencia}</p>
                      </div>
                      <Badge variant="secondary" className={cn('text-[10px] h-5 px-1.5 shrink-0 gap-1 border', config.badgeClass)}>
                        <IconEstado className="h-3 w-3" /> {evidencia.estado}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-muted-foreground mt-2 space-y-1">
                      <p>Por: <span className="font-medium text-foreground/80">{evidencia.subidoPor?.nombres || 'Usuario'}</span> {' · '} <span className="tabular-nums">{formatDate(evidencia.createdAt)}</span></p>
                      
                      {/* ✅ MOSTRAR LISTA DE VOTOS DE LOS REVISORES */}
                      {evaluaciones.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {evaluaciones.map(evaluacion => (
                            <Badge key={evaluacion.id} variant="outline" className={cn(
                              "text-[9px] h-5 px-1.5 font-normal border",
                              evaluacion.estado === 'APROBADA' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                            )}>
                              {evaluacion.estado === 'APROBADA' ? <Check className="h-2.5 w-2.5 mr-1"/> : <XCircle className="h-2.5 w-2.5 mr-1"/>}
                              {evaluacion.revisor?.nombres?.split(' ')[0]} {/* Solo primer nombre para no saturar */}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => window.open(absoluteUrl, '_blank')}>
                        {isLink ? <ExternalLink className="h-3 w-3" /> : <Eye className="h-3 w-3" />} Abrir
                      </Button>

                      {/* ✅ BOTÓN REVISAR: Habilitado para todos los revisores en EN_REVISION */}
                      {canReview && isLatestVersion && (
                        <Button 
                          variant={miVoto ? "outline" : "ghost"} 
                          size="sm" 
                          className={cn("h-7 text-xs gap-1", miVoto ? "border-primary text-primary" : "text-primary bg-primary/10 hover:bg-primary/20")}
                          onClick={() => handleReview(evidencia)}
                        >
                          {miVoto ? (miVoto.estado === 'APROBADA' ? 'Cambiar Voto' : 'Cambiar Rechazo') : 'Revisar y Votar'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {(canUpload || canDeleteThis) && (
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><MoreVertical className="h-3.5 w-3.5" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canDeleteThis ? (
                            <DropdownMenuItem onClick={() => handleDeleteEvidencia(evidencia)} className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled={deletingId === evidencia.id}>
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Eliminar
                            </DropdownMenuItem>
                          ) : (
                            <div className="px-2 py-1.5 text-[11px] text-muted-foreground italic">No se puede eliminar.</div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <SubirEvidenciaModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} actividad={actividad} onSuccess={() => { setUploadModalOpen(false); onUpdate() }} />
      {selectedEvidencia && (
        <RevisarEvidenciaModal open={reviewModalOpen} onOpenChange={open => { setReviewModalOpen(open); if (!open) setSelectedEvidencia(null) }} evidencia={selectedEvidencia} onSuccess={() => { setReviewModalOpen(false); onUpdate() }} />
      )}
    </div>
  )
}