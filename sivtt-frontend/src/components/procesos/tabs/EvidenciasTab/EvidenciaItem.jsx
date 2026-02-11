import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  FileSpreadsheet,
  File,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Link as LinkIcon,
  ExternalLink,
  MessageSquare
} from 'lucide-react'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const TIPO_ICONS = {
  DOCUMENTO: FileText,
  IMAGEN: ImageIcon,
  VIDEO: Video,
  PRESENTACION: FileSpreadsheet,
  INFORME: FileText,
  ENLACE: LinkIcon, // Icono para links
  OTRO: File
}

const ESTADO_CONFIG = {
  APROBADA: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', badge: 'bg-green-100 text-green-700 border-green-200' },
  PENDIENTE: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  RECHAZADA: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700 border-red-200' }
}

export const EvidenciaItem = ({ evidencia, onClick }) => {
  const IconTipo = TIPO_ICONS[evidencia.tipoEvidencia] || File
  const estadoConfig = ESTADO_CONFIG[evidencia.estado] || ESTADO_CONFIG.PENDIENTE
  const IconEstado = estadoConfig.icon

  // Lógica para detectar si es enlace (por tipo o por URL)
  const isLink = evidencia.tipoEvidencia === 'ENLACE' || 
                 (evidencia.tipoEvidencia === 'OTRO' && evidencia.urlArchivo?.startsWith('http'))

  // Manejar acción principal
  const handleMainAction = (e) => {
    e.stopPropagation()
    if (isLink) {
        window.open(evidencia.urlArchivo, '_blank')
    } else {
        onClick() // Abrir visor interno para archivos
    }
  }

  // Descargar (solo para archivos)
  const handleDownload = (e) => {
    e.stopPropagation()
    // Si tu backend tiene un endpoint de descarga específico o el link directo
    window.open(evidencia.urlArchivo, '_blank') 
  }

  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all">
      
      {/* Icono Principal */}
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1", isLink ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600")}>
        <IconTipo className="h-5 w-5" />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-gray-900 text-sm truncate max-w-[300px]" title={evidencia.nombreArchivo}>
            {evidencia.nombreArchivo}
          </h4>
          <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", estadoConfig.badge)}>
            <IconEstado className="h-3 w-3 mr-1" />
            {evidencia.estado}
          </Badge>
        </div>

        {/* Metadatos - Corrección de propiedades del backend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="font-mono bg-gray-100 px-1 rounded">v{evidencia.version}</span>
          
          <span className="hidden sm:inline">•</span>
          <span className="truncate max-w-[150px]">
            {evidencia.actividad?.nombre || 'Actividad general'}
          </span>
          
          <span className="hidden sm:inline">•</span>
          <span>{formatDate(evidencia.createdAt)}</span>
          
          <span className="hidden sm:inline">•</span>
          <span className="font-medium text-gray-700">
            {evidencia.subidoPor?.nombres || 'Usuario'}
          </span>
        </div>

        {/* Comentario de revisión (Feedback) */}
        {evidencia.comentarioRevision && (
          <div className="mt-2 flex items-start gap-2 text-xs text-amber-800 bg-amber-50/50 p-1.5 rounded border border-amber-100">
            <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <p className="line-clamp-2 italic">
              {evidencia.comentarioRevision}
            </p>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs bg-white"
          onClick={handleMainAction}
        >
          {isLink ? <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
          {isLink ? 'Abrir' : 'Ver'}
        </Button>
        
        {!isLink && (
            <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
            onClick={handleDownload}
            title="Descargar"
            >
            <Download className="h-4 w-4" />
            </Button>
        )}
      </div>
    </div>
  )
}