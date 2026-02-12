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
import { evidenciasAPI } from '@api/endpoints/evidencias'
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const ESTADO_EVIDENCIA = {
  APROBADA: {
    icon: CheckCircle2,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40',
  },
  PENDIENTE: {
    icon: Clock,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40',
  },
  RECHAZADA: {
    icon: XCircle,
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40',
  },
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
    rechazadas: evidencias.filter(e => e.estado === 'RECHAZADA').length,
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
      onUpdate()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditEvidencia = (evidencia) => {
    toast({ description: "Funcionalidad de edición pendiente de modal" })
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-foreground text-sm">
            Archivos Adjuntos
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            {stats.aprobadas > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {stats.aprobadas} aprobadas
              </span>
            )}
            {stats.pendientes > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {stats.pendientes} pendientes
              </span>
            )}
            {stats.rechazadas > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {stats.rechazadas} rechazadas
              </span>
            )}
            {evidencias.length === 0 && (
              <span className="text-[11px] text-muted-foreground">Sin archivos</span>
            )}
          </div>
        </div>

        {canUpload && (
          <Button
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            className="h-8 text-xs gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            Subir
          </Button>
        )}
      </div>

      {/* List */}
      {evidencias.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-6 text-center bg-dot-pattern">
          <AlertCircle className="h-5 w-5 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No hay evidencias cargadas.
          </p>
          {canUpload && (
            <p className="text-xs text-muted-foreground mt-1">
              Sube el primer archivo para documentar el avance.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {evidencias.map((evidencia) => {
            const config = ESTADO_EVIDENCIA[evidencia.estado] || ESTADO_EVIDENCIA.PENDIENTE
            const IconEstado = config.icon
            const isLink = evidencia.tipoEvidencia === 'ENLACE' || (evidencia.tipoEvidencia === 'OTRO' && evidencia.urlArchivo?.startsWith('http'))
            const canDelete = evidencia.estado === 'PENDIENTE' && actividad.estado !== 'APROBADA'

            return (
              <div
                key={evidencia.id}
                className="group border border-border rounded-lg p-3.5 hover:bg-muted/20 transition-colors relative"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    isLink ? "bg-blue-50 dark:bg-blue-950/40" : config.bgClass
                  )}>
                    {isLink
                      ? <LinkIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      : <FileText className={cn("h-4 w-4", config.colorClass)} />
                    }
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    {/* Name + badge */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <h5 className="font-medium text-foreground text-sm truncate" title={evidencia.nombreArchivo}>
                          {evidencia.nombreArchivo}
                        </h5>
                        <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                          v{evidencia.version} · {evidencia.tipoEvidencia}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn("text-[10px] h-5 px-1.5 shrink-0 gap-1 border", config.badgeClass)}
                      >
                        <IconEstado className="h-3 w-3" />
                        {evidencia.estado}
                      </Badge>
                    </div>

                    {/* Metadata */}
                    <div className="text-[11px] text-muted-foreground mt-2 space-y-1">
                      <p>
                        Por: <span className="font-medium text-foreground/80">{evidencia.subidoPor?.nombres || 'Usuario'}</span>
                        {' · '}
                        <span className="tabular-nums">{formatDate(evidencia.createdAt)}</span>
                      </p>
                      {evidencia.revisadoPor && (
                        <p className="text-muted-foreground/70">
                          Revisado por: {evidencia.revisadoPor.nombres}
                        </p>
                      )}
                      {evidencia.comentarioRevision && (
                        <div className="mt-2 p-2.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-md">
                          <p className="text-amber-800 dark:text-amber-300 italic text-[11px] leading-relaxed">
                            "{evidencia.comentarioRevision}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => window.open(evidencia.urlArchivo, '_blank')}
                      >
                        {isLink ? <ExternalLink className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        {isLink ? 'Abrir' : 'Ver'}
                      </Button>

                      {evidencia.estado === 'PENDIENTE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary"
                          onClick={() => handleReview(evidencia)}
                        >
                          Revisar
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Options menu */}
                  {canUpload && (
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditEvidencia(evidencia)}>
                            <Edit className="h-3.5 w-3.5 mr-2" /> Editar detalles
                          </DropdownMenuItem>
                          {canDelete ? (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEvidencia(evidencia)} 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              disabled={deletingId === evidencia.id}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Eliminar
                            </DropdownMenuItem>
                          ) : (
                            <div className="px-2 py-1.5 text-[11px] text-muted-foreground italic">
                              No se puede eliminar (ya revisada).
                            </div>
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

      {/* Modals */}
      <SubirEvidenciaModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        actividad={actividad}
        onSuccess={() => { setUploadModalOpen(false); onUpdate() }}
      />

      {selectedEvidencia && (
        <RevisarEvidenciaModal
          open={reviewModalOpen}
          onOpenChange={(open) => { setReviewModalOpen(open); if (!open) setSelectedEvidencia(null) }}
          evidencia={selectedEvidencia}
          onSuccess={() => { setReviewModalOpen(false); onUpdate() }}
        />
      )}
    </div>
  )
}