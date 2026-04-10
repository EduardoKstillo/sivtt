import { Badge } from '@components/ui/badge'
import {
  FileText, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, Calendar, Eye, Pencil, BookOpen,
} from 'lucide-react'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

// ── Estado ───────────────────────────────────────────────────────────────────
const ESTADO_CONFIG = {
  CREADA:            { label: 'Creada',            dot: 'bg-slate-400',    className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700' },
  EN_PROGRESO:       { label: 'En progreso',        dot: 'bg-blue-500',     className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40' },
  EN_REVISION:       { label: 'En revisión',        dot: 'bg-amber-500',    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40' },
  OBSERVADA:         { label: 'Observada',          dot: 'bg-red-500',      className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40' },
  LISTA_PARA_CIERRE: { label: 'Lista para cierre',  dot: 'bg-emerald-500',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40' },
  APROBADA:          { label: 'Aprobada',           dot: 'bg-emerald-600',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40' },
  RECHAZADA:         { label: 'Rechazada',          dot: 'bg-red-600',      className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40' },
}

// ── Rol ──────────────────────────────────────────────────────────────────────
const ROL_CONFIG = {
  RESPONSABLE_TAREA:  { label: 'Responsable',  icon: Pencil,   className: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/30' },
  REVISOR_TAREA:      { label: 'Revisor',      icon: Eye,      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40' },
  PARTICIPANTE_TAREA: { label: 'Participante', icon: BookOpen, className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
}

const TIPO_ICON = {
  DOCUMENTO: FileText,
  TAREA:     CheckCircle2,
  REUNION:   Clock,
  REVISION:  Eye,
  OTRO:      FileText,
}

const DEFAULT_ESTADO = { label: 'Desconocido', dot: 'bg-muted-foreground', className: 'bg-muted text-muted-foreground border-border' }
const DEFAULT_ROL    = { label: 'Asignado',    icon: FileText,             className: 'bg-muted text-muted-foreground border-border' }

export const MiActividadCard = ({ actividad, onClick }) => {
  const estadoCfg = ESTADO_CONFIG[actividad.estado]      || DEFAULT_ESTADO
  const rolCfg    = ROL_CONFIG[actividad.miRol?.codigo]  || DEFAULT_ROL
  const RolIcon   = rolCfg.icon
  const TipoIcon  = TIPO_ICON[actividad.tipo] || FileText

  const hoy           = new Date()
  const fechaLimite   = actividad.fechaLimite ? new Date(actividad.fechaLimite) : null
  const estaVencida   = fechaLimite && fechaLimite < hoy && actividad.estado !== 'APROBADA'
  const venceHoy      = fechaLimite && fechaLimite.toDateString() === hoy.toDateString()
  const diasRestantes = fechaLimite
    ? Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24))
    : null

  const isUrgent   = actividad.requiereAccion && actividad.estado !== 'APROBADA'
  const isObserved = actividad.estado === 'OBSERVADA'
  const isDone     = actividad.estado === 'APROBADA'

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left group',
        'flex items-center gap-3.5 p-3',
        'bg-background border border-border rounded-lg',
        'hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm',
        'transition-all duration-200',
        isUrgent   && !isObserved && 'border-l-[3px] border-l-amber-400 dark:border-l-amber-500',
        isObserved && 'border-l-[3px] border-l-red-400 dark:border-l-red-500',
        isDone     && 'opacity-60 hover:opacity-100',
      )}
    >
      {/* Ícono de tipo */}
      <div className={cn(
        'w-9 h-9 rounded-md flex items-center justify-center shrink-0',
        'bg-muted/80 group-hover:bg-primary/10 transition-colors',
      )}>
        <TipoIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      {/* Contenido central */}
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-[13px] font-semibold text-foreground leading-snug truncate mb-1.5 group-hover:text-primary transition-colors">
          {actividad.nombre}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn('text-[10px] h-4.5 px-2 gap-1.5', estadoCfg.className)}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', estadoCfg.dot)} />
            {estadoCfg.label}
          </Badge>

          <Badge
            variant="outline"
            className={cn('text-[10px] h-4.5 px-2 gap-1.5', rolCfg.className)}
          >
            <RolIcon className="h-3 w-3 shrink-0" />
            {rolCfg.label}
          </Badge>
        </div>

        {/* Evidencias (Solo se muestra si hay datos que aportar) */}
        {(actividad.evidencias?.total > 0 || actividad.requisitos?.length > 0) && (
          <div className="flex items-center gap-3 mt-2 text-[11px] font-medium">
            {actividad.evidencias?.pendientes > 0 && (
              <span className="text-amber-600 dark:text-amber-500 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {actividad.evidencias.pendientes} pdte.
              </span>
            )}
            {actividad.evidencias?.rechazadas > 0 && (
              <span className="text-red-600 dark:text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> {actividad.evidencias.rechazadas} recha.
              </span>
            )}
            {actividad.evidencias?.aprobadas > 0 && (
              <span className="text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {actividad.evidencias.aprobadas} aprob.
              </span>
            )}
            {actividad.requisitos?.length > 0 && actividad.evidencias?.total === 0 && (
              <span className="text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" /> {actividad.requisitos.length} reqs.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Fecha + flecha — zona fija a la derecha */}
      <div className="flex items-center gap-2.5 shrink-0 pl-2 border-l border-border/50">
        {fechaLimite && (
          <div className={cn(
            'flex flex-col items-end gap-0.5 text-right tabular-nums',
            estaVencida
              ? 'text-red-600 dark:text-red-400 font-semibold'
              : venceHoy
                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                : diasRestantes !== null && diasRestantes <= 3
                  ? 'text-amber-500 font-medium'
                  : 'text-muted-foreground',
          )}>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider">
              {estaVencida
                ? <AlertTriangle className="h-3 w-3" />
                : <Calendar className="h-3 w-3" />
              }
              {estaVencida ? 'Vencida' : venceHoy ? 'Vence Hoy' : 'Límite'}
            </div>
            <span className="text-[12px]">{formatDate(actividad.fechaLimite)}</span>
          </div>
        )}
        <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </button>
  )
}