import { Card, CardContent } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Calendar, FileText, Award, Clock, Send, CheckCircle2, XCircle } from 'lucide-react'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

// Colores semánticos con opacidad — adaptan dark mode
const ESTADO_CONFIG = {
  BORRADOR:  {
    label: 'Borrador',
    badge: 'bg-muted text-muted-foreground',
    dot:   'bg-muted-foreground',
    icon:  Clock
  },
  PUBLICADA: {
    label: 'Publicada',
    badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    dot:   'bg-blue-500',
    icon:  Send
  },
  CERRADA:   {
    label: 'Cerrada',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    dot:   'bg-emerald-500',
    icon:  CheckCircle2
  },
  CANCELADA: {
    label: 'Cancelada',
    badge: 'bg-destructive/10 text-destructive border-destructive/20',
    dot:   'bg-destructive',
    icon:  XCircle
  }
}

export const ConvocatoriaCard = ({ convocatoria, onClick }) => {
  const estadoConfig = ESTADO_CONFIG[convocatoria.estatus] || ESTADO_CONFIG.BORRADOR
  const IconEstado   = estadoConfig.icon

  const totalPostulaciones = convocatoria.postulaciones?.total || 0
  const tieneGanador       = convocatoria.postulaciones?.seleccionadas > 0

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group bg-card border-border overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="space-y-3">

          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              {/* hover:text-primary en lugar de hover:text-blue-600 hardcodeado */}
              <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {convocatoria.codigo}
              </h3>
              <Badge
                variant="secondary"
                className={cn('text-[10px] h-5 flex-shrink-0 gap-1', estadoConfig.badge)}
              >
                <IconEstado className="h-2.5 w-2.5" />
                {estadoConfig.label}
              </Badge>
            </div>

            <h4
              className="text-xs font-medium text-foreground line-clamp-2 mb-1"
              title={convocatoria.titulo}
            >
              {convocatoria.titulo}
            </h4>

            {convocatoria.reto?.proceso && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                Proceso: {convocatoria.reto.proceso.titulo}
              </p>
            )}
          </div>

          {/* Fechas — bg-muted/40 en lugar de bg-gray-50 hardcodeado */}
          <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-2 rounded-md">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>Apertura: {formatDate(convocatoria.fechaApertura)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>Cierre: {formatDate(convocatoria.fechaCierre)}</span>
            </div>
          </div>

          {/* Stats footer — border-border del sistema */}
          <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span className="font-medium tabular-nums">{totalPostulaciones}</span>
              <span>postulaciones</span>
            </div>

            {tieneGanador && (
              // emerald semántico consistente con estado "Cerrada" y "Activo" del sistema
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Award className="h-3 w-3" />
                <span className="font-medium">Ganador</span>
              </div>
            )}
          </div>

          {/* Relanzamiento — amber semántico, sin emoji */}
          {convocatoria.esRelanzamiento && (
            <Badge
              variant="outline"
              className="w-full justify-center text-[10px] h-5 bg-amber-500/10 text-amber-600 border-amber-500/20"
            >
              Relanzamiento #{convocatoria.numeroRelanzamiento}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}