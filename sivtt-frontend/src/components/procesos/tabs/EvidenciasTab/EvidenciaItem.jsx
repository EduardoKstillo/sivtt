import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { 
  FileText, Image as ImageIcon, Video, FileSpreadsheet, File, Download, Eye,
  CheckCircle2, Clock, XCircle, Link as LinkIcon, ExternalLink, MessageSquare
} from 'lucide-react'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const TIPO_ICONS = {
  DOCUMENTO: FileText, IMAGEN: ImageIcon, VIDEO: Video,
  PRESENTACION: FileSpreadsheet, INFORME: FileText, ENLACE: LinkIcon, OTRO: File,
}

const ESTADO_CONFIG = {
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

export const EvidenciaItem = ({ evidencia, onClick }) => {
  const IconTipo = TIPO_ICONS[evidencia.tipoEvidencia] || File
  const estadoConfig = ESTADO_CONFIG[evidencia.estado] || ESTADO_CONFIG.PENDIENTE
  const IconEstado = estadoConfig.icon

  const isLink = evidencia.tipoEvidencia === 'ENLACE' || 
    (evidencia.tipoEvidencia === 'OTRO' && evidencia.urlArchivo?.startsWith('http'))

  const handleMainAction = (e) => {
    e.stopPropagation()
    if (isLink) window.open(evidencia.urlArchivo, '_blank')
    else onClick()
  }

  const handleDownload = (e) => {
    e.stopPropagation()
    window.open(evidencia.urlArchivo, '_blank') 
  }

  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/20 hover:border-border transition-all">
      
      {/* Icon */}
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
        isLink
          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
          : cn(estadoConfig.bgClass, estadoConfig.colorClass)
      )}>
        <IconTipo className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-foreground text-sm truncate max-w-[300px]" title={evidencia.nombreArchivo}>
            {evidencia.nombreArchivo}
          </h4>
          <Badge
            variant="secondary"
            className={cn("text-[10px] h-5 px-1.5 shrink-0 gap-1 border", estadoConfig.badgeClass)}
          >
            <IconEstado className="h-3 w-3" />
            {evidencia.estado}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] tabular-nums">
            v{evidencia.version}
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="truncate max-w-[150px]">
            {evidencia.actividad?.nombre || 'Actividad general'}
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="tabular-nums">{formatDate(evidencia.createdAt)}</span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="font-medium text-foreground/70">
            {evidencia.subidoPor?.nombres || 'Usuario'}
          </span>
        </div>

        {/* Review comment */}
        {evidencia.comentarioRevision && (
          <div className="mt-2 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-md border border-amber-100 dark:border-amber-900/30">
            <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
            <p className="line-clamp-2 italic leading-relaxed">
              {evidencia.comentarioRevision}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-xs gap-1"
          onClick={handleMainAction}
        >
          {isLink ? <ExternalLink className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {isLink ? 'Abrir' : 'Ver'}
        </Button>
        
        {!isLink && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleDownload}
            title="Descargar"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}