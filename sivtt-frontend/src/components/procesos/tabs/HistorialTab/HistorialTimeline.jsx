import { Badge } from '@components/ui/badge'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import {
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Building2,
  Users,
  FileText,
  DollarSign,
  Settings,
  AlertCircle
} from 'lucide-react'
import { formatDate, formatDateTime } from '@utils/formatters'
import { cn } from '@/lib/utils'

// Colores semánticos usando clases del design system en lugar de hardcoded
const TIPO_CONFIG = {
  ESTADO:        { icon: CheckCircle2, color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
  FASE:          { icon: ArrowRight,   color: 'text-violet-500',  bg: 'bg-violet-500/10'  },
  TRL:           { icon: TrendingUp,   color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  DECISION:      { icon: AlertCircle,  color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
  EMPRESA:       { icon: Building2,    color: 'text-indigo-500',  bg: 'bg-indigo-500/10'  },
  EQUIPO:        { icon: Users,        color: 'text-pink-500',    bg: 'bg-pink-500/10'    },
  ACTIVIDAD:     { icon: FileText,     color: 'text-cyan-500',    bg: 'bg-cyan-500/10'    },
  EVIDENCIA:     { icon: FileText,     color: 'text-teal-500',    bg: 'bg-teal-500/10'    },
  FINANCIAMIENTO:{ icon: DollarSign,   color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  OTRO:          { icon: Settings,     color: 'text-muted-foreground', bg: 'bg-muted'     }
}

export const HistorialTimeline = ({ eventos }) => {
  // Agrupar por fecha (YYYY-MM-DD) para el timeline visual
  const eventosPorFecha = eventos.reduce((acc, evento) => {
    const fechaObj = new Date(evento.timestamp)
    const fechaKey = formatDate(fechaObj)
    if (!acc[fechaKey]) acc[fechaKey] = []
    acc[fechaKey].push(evento)
    return acc
  }, {})

  return (
    <div className="space-y-8 pl-2">
      {Object.entries(eventosPorFecha).map(([fecha, eventosDelDia]) => (
        <div key={fecha} className="relative">

          {/* Fecha header — usa bg-card en lugar de bg-white para respetar dark mode */}
          <div className="sticky top-0 z-10 flex items-center gap-4 mb-6 bg-card py-2">
            <div className="text-xs font-semibold text-muted-foreground w-24 text-right shrink-0 tabular-nums">
              {fecha}
            </div>
            {/* Línea separadora — usa border-border del sistema */}
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Línea vertical del timeline — border-border */}
          <div className="space-y-6 border-l-2 border-border ml-[6.5rem]">
            {eventosDelDia.map((evento) => {
              const config = TIPO_CONFIG[evento.tipo] || TIPO_CONFIG.OTRO
              const Icon = config.icon

              return (
                <div key={`${evento.tipo}-${evento.timestamp}`} className="relative pl-8">

                  {/* Nodo del timeline — usa bg-card en lugar de border-white */}
                  <div className={cn(
                    'absolute -left-4 top-1 w-8 h-8 rounded-full border-2 border-card flex items-center justify-center shadow-sm',
                    config.bg
                  )}>
                    <Icon className={cn('h-4 w-4', config.color)} />
                  </div>

                  {/* Contenido del evento */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Descripción principal */}
                        <p className="text-sm text-foreground font-medium leading-snug">
                          {evento.descripcion}
                        </p>

                        {/* Detalle según tipo */}
                        <DetalleEvento evento={evento} />
                      </div>

                      {/* Hora — alineada a la derecha */}
                      <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums shrink-0">
                        {formatDateTime(evento.timestamp).split(' ')[1]}
                      </span>
                    </div>

                    {/* Usuario */}
                    {evento.usuario && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                            {evento.usuario.nombres?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {evento.usuario.nombres} {evento.usuario.apellidos}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Sub-componente para detalles específicos por tipo
const DetalleEvento = ({ evento }) => {
  const { detalle } = evento
  if (!detalle) return null

  if (evento.tipo === 'TRL' && detalle.justificacion) {
    return <QuoteBox text={detalle.justificacion} />
  }

  if (evento.tipo === 'FASE' && detalle.motivo) {
    return <QuoteBox text={detalle.motivo} />
  }

  if (evento.tipo === 'ESTADO' && detalle.motivo) {
    return <QuoteBox text={detalle.motivo} />
  }

  if (evento.tipo === 'ACTIVIDAD' && (detalle.observaciones || detalle.nombreArchivo)) {
    return (
      // Caja de detalle — bg-muted/40 + border-border en lugar de hardcoded gray
      <div className="mt-2 bg-muted/40 rounded-md p-2.5 text-xs text-muted-foreground border border-border">
        {detalle.nombreArchivo && (
          <div className="flex items-center gap-1.5 mb-1 font-medium text-foreground">
            <FileText className="h-3 w-3 text-muted-foreground" />
            {detalle.nombreArchivo}
          </div>
        )}
        {detalle.observaciones && (
          <p className="italic">"{detalle.observaciones}"</p>
        )}
        {detalle.comentarioRevision && (
          <p className="text-amber-500 mt-1">Revisión: "{detalle.comentarioRevision}"</p>
        )}
      </div>
    )
  }

  if (evento.tipo === 'EMPRESA') {
    return (
      <div className="mt-1.5 flex items-center gap-2">
        <Badge variant="outline" className="text-[10px] h-5 bg-muted/30">
          RUC: {detalle.ruc}
        </Badge>
        {detalle.motivo && (
          <span className="text-xs text-muted-foreground italic">— {detalle.motivo}</span>
        )}
      </div>
    )
  }

  return null
}

// Caja de cita — border-l usa el color primario del sistema en lugar de gray
const QuoteBox = ({ text }) => (
  <div className="mt-2 text-xs text-muted-foreground italic bg-muted/40 px-3 py-2 rounded-md border-l-2 border-primary/40">
    "{text}"
  </div>
)