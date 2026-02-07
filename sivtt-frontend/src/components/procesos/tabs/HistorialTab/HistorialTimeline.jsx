import { Badge } from '@components/ui/badge'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { 
  Circle,
  CheckCircle2,
  XCircle,
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

const TIPO_CONFIG = {
  ESTADO: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
  FASE: { icon: ArrowRight, color: 'text-purple-600', bg: 'bg-purple-50' },
  TRL: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  DECISION: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  EMPRESA: { icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  EQUIPO: { icon: Users, color: 'text-pink-600', bg: 'bg-pink-50' },
  ACTIVIDAD: { icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  EVIDENCIA: { icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
  FINANCIAMIENTO: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  OTRO: { icon: Settings, color: 'text-gray-600', bg: 'bg-gray-50' }
}

export const HistorialTimeline = ({ eventos }) => {
  // Agrupar por fecha (YYYY-MM-DD) para el timeline visual
  const eventosPorFecha = eventos.reduce((acc, evento) => {
    // Asumiendo que evento.timestamp es la fecha formateada o ISO
    const fechaObj = new Date(evento.timestamp)
    const fechaKey = formatDate(fechaObj) // Función que devuelve "DD/MM/YYYY" o similar
    
    if (!acc[fechaKey]) {
      acc[fechaKey] = []
    }
    acc[fechaKey].push(evento)
    return acc
  }, {})

  return (
    <div className="space-y-8 pl-2">
      {Object.entries(eventosPorFecha).map(([fecha, eventosDelDia]) => (
        <div key={fecha} className="relative">
          {/* Fecha Header Sticky */}
          <div className="sticky top-0 z-10 flex items-center gap-4 mb-6 bg-white py-2">
            <div className="w-24 text-sm font-bold text-gray-500 text-right shrink-0">
              {fecha}
            </div>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <div className="space-y-6 border-l-2 border-gray-100 ml-[6.5rem]">
            {eventosDelDia.map((evento) => {
              const config = TIPO_CONFIG[evento.tipo] || TIPO_CONFIG.OTRO
              const Icon = config.icon

              return (
                <div key={`${evento.tipo}-${evento.timestamp}`} className="relative pl-8">
                  {/* Icono en la línea de tiempo */}
                  <div className={cn(
                    "absolute -left-4 top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm",
                    config.bg
                  )}>
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>

                  {/* Contenido del Evento */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        {/* Descripción principal generada por el Backend */}
                        <p className="text-sm text-gray-900 font-medium">
                          {evento.descripcion}
                        </p>
                        
                        {/* Renderizar detalles específicos según el tipo */}
                        <DetalleEvento evento={evento} />
                        
                      </div>
                      
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                        {formatDateTime(evento.timestamp).split(' ')[1]} {/* Solo hora */}
                      </span>
                    </div>

                    {/* Usuario que realizó la acción */}
                    {evento.usuario && (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px] bg-gray-200">
                            {evento.usuario.nombres?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">
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

// Sub-componente para renderizar la caja gris con detalles
const DetalleEvento = ({ evento }) => {
  const { detalle } = evento
  if (!detalle) return null

  // Renderizado condicional basado en el tipo de evento
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
      <div className="mt-2 bg-gray-50 rounded p-2 text-xs text-gray-600 border border-gray-100">
        {detalle.nombreArchivo && (
          <div className="flex items-center gap-1 mb-1 font-medium">
            <FileText className="h-3 w-3" /> {detalle.nombreArchivo}
          </div>
        )}
        {detalle.observaciones && <p>"{detalle.observaciones}"</p>}
        {detalle.comentarioRevision && (
           <p className="text-orange-700">Revisión: "{detalle.comentarioRevision}"</p>
        )}
      </div>
    )
  }

  if (evento.tipo === 'EMPRESA') {
    return (
      <div className="mt-1 flex gap-2">
        <Badge variant="outline" className="text-[10px] h-5 bg-white">
          RUC: {detalle.ruc}
        </Badge>
        {detalle.motivo && <span className="text-xs text-gray-500 italic">- {detalle.motivo}</span>}
      </div>
    )
  }

  return null
}

const QuoteBox = ({ text }) => (
  <div className="mt-2 text-xs text-gray-600 italic bg-gray-50 p-2 rounded border-l-2 border-gray-300">
    "{text}"
  </div>
)