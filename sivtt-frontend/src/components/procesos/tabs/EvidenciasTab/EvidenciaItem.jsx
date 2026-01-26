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
  XCircle
} from 'lucide-react'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const TIPO_ICONS = {
  DOCUMENTO: FileText,
  IMAGEN: ImageIcon,
  VIDEO: Video,
  PRESENTACION: FileSpreadsheet,
  INFORME: FileText,
  OTRO: File
}

const ESTADO_CONFIG = {
  APROBADA: { 
    icon: CheckCircle2, 
    color: 'text-green-600', 
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-700'
  },
  PENDIENTE: { 
    icon: Clock, 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-700'
  },
  RECHAZADA: { 
    icon: XCircle, 
    color: 'text-red-600', 
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700'
  }
}

export const EvidenciaItem = ({ evidencia, onClick }) => {
  const IconTipo = TIPO_ICONS[evidencia.tipo] || File
  const estadoConfig = ESTADO_CONFIG[evidencia.estado] || ESTADO_CONFIG.PENDIENTE
  const IconEstado = estadoConfig.icon

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Icon */}
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", estadoConfig.bg)}>
        <IconTipo className={cn("h-5 w-5", estadoConfig.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-gray-900 text-sm truncate">
            {evidencia.nombreArchivo}
          </h4>
          <Badge className={estadoConfig.badge}>
            <IconEstado className="h-3 w-3 mr-1" />
            {evidencia.estado}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span>v{evidencia.version}</span>
          <span>•</span>
          <span>{evidencia.tipo}</span>
          <span>•</span>
          <span>Actividad: {evidencia.actividad?.nombre}</span>
          <span>•</span>
          <span>Subido: {formatDate(evidencia.fechaSubida)}</span>
          <span>•</span>
          <span>Por: {evidencia.usuario?.nombre}</span>
        </div>

        {evidencia.comentarioRevision && (
          <p className="text-xs text-gray-700 mt-1 line-clamp-1">
            💬 {evidencia.comentarioRevision}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            window.open(evidencia.archivoUrl, '_blank')
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}