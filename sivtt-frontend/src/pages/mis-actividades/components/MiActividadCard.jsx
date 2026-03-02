import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import {
  FileText, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, Calendar, Eye, Pencil, BookOpen
} from 'lucide-react'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

// ── Configuración visual por estado ───────────────────────
const ESTADO_CONFIG = {
  CREADA:            { label: 'Creada',             className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700', dot: 'bg-slate-400' },
  EN_PROGRESO:       { label: 'En Progreso',        className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40',   dot: 'bg-blue-500' },
  EN_REVISION:       { label: 'En Revisión',        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40', dot: 'bg-amber-500' },
  OBSERVADA:         { label: 'Observada',          className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40',         dot: 'bg-red-500' },
  LISTA_PARA_CIERRE: { label: 'Lista para Cierre',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40', dot: 'bg-emerald-500' },
  APROBADA:          { label: 'Aprobada',           className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40', dot: 'bg-emerald-600' },
  RECHAZADA:         { label: 'Rechazada',          className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40',         dot: 'bg-red-600' },
}

// ── Configuración visual por rol ───────────────────────────
const ROL_CONFIG = {
  RESPONSABLE_TAREA:  { label: 'Responsable', className: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/30',       icon: Pencil },
  REVISOR_TAREA:      { label: 'Revisor',     className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40', icon: Eye },
  PARTICIPANTE_TAREA: { label: 'Participante',className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',       icon: BookOpen },
}

// ── Ícono por tipo de actividad ────────────────────────────
const TIPO_ICON = {
  DOCUMENTO: FileText,
  TAREA:     CheckCircle2,
  REUNION:   Clock,
  REVISION:  Eye,
  OTRO:      FileText,
}

const DEFAULT_ESTADO = { label: 'Desconocido', className: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' }
const DEFAULT_ROL    = { label: 'Asignado',    className: 'bg-muted text-muted-foreground border-border', icon: FileText }

export const MiActividadCard = ({ actividad, onClick }) => {
  const estadoCfg  = ESTADO_CONFIG[actividad.estado]  || DEFAULT_ESTADO
  const rolCfg     = ROL_CONFIG[actividad.miRol?.codigo] || DEFAULT_ROL
  const RolIcon    = rolCfg.icon
  const TipoIcon   = TIPO_ICON[actividad.tipo] || FileText

  const hoy           = new Date()
  const fechaLimite   = actividad.fechaLimite ? new Date(actividad.fechaLimite) : null
  const estaVencida   = fechaLimite && fechaLimite < hoy && actividad.estado !== 'APROBADA'
  const venceHoy      = fechaLimite && fechaLimite.toDateString() === hoy.toDateString()
  const diasRestantes = fechaLimite
    ? Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24))
    : null

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left group',
        'flex items-center gap-4 p-3.5',
        'bg-card border border-border rounded-lg',
        'hover:border-primary/30 hover:bg-muted/20',
        'transition-all duration-150',
        actividad.requiereAccion && 'border-l-2 border-l-amber-400 dark:border-l-amber-500',
        actividad.estado === 'OBSERVADA' && 'border-l-2 border-l-red-400 dark:border-l-red-500',
        actividad.estado === 'APROBADA' && 'opacity-60'
      )}
    >
      {/* Ícono tipo */}
      <div className={cn(
        'w-8 h-8 rounded-md flex items-center justify-center shrink-0',
        'bg-muted/50 group-hover:bg-primary/10 transition-colors'
      )}>
        <TipoIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground leading-snug truncate">
              {actividad.nombre}
            </p>
            {/* Badges de estado y rol */}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Badge
                variant="outline"
                className={cn('text-[10px] h-4 px-1.5 border gap-1', estadoCfg.className)}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', estadoCfg.dot)} />
                {estadoCfg.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn('text-[10px] h-4 px-1.5 border gap-1', rolCfg.className)}
              >
                <RolIcon className="h-2.5 w-2.5 shrink-0" />
                {rolCfg.label}
              </Badge>
            </div>
          </div>

          {/* Fecha límite + flecha */}
          <div className="flex items-center gap-2 shrink-0">
            {fechaLimite && (
              <div className={cn(
                'flex items-center gap-1 text-xs tabular-nums',
                estaVencida  ? 'text-red-600 dark:text-red-400 font-medium' :
                venceHoy     ? 'text-amber-600 dark:text-amber-400 font-medium' :
                diasRestantes !== null && diasRestantes <= 3 ? 'text-amber-500' :
                'text-muted-foreground'
              )}>
                {estaVencida && <AlertTriangle className="h-3 w-3" />}
                {!estaVencida && <Calendar className="h-3 w-3" />}
                {estaVencida
                  ? 'Vencida'
                  : venceHoy
                    ? 'Hoy'
                    : formatDate(actividad.fechaLimite)
                }
              </div>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          </div>
        </div>

        {/* Evidencias resumen — solo si tiene alguna o hay requisitos */}
        {(actividad.evidencias?.total > 0 || actividad.requisitos?.length > 0) && (
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
            {actividad.evidencias?.pendientes > 0 && (
              <span className="text-amber-600 dark:text-amber-500">
                {actividad.evidencias.pendientes} pendiente{actividad.evidencias.pendientes !== 1 ? 's' : ''}
              </span>
            )}
            {actividad.evidencias?.rechazadas > 0 && (
              <span className="text-red-600 dark:text-red-500">
                {actividad.evidencias.rechazadas} rechazada{actividad.evidencias.rechazadas !== 1 ? 's' : ''}
              </span>
            )}
            {actividad.evidencias?.aprobadas > 0 && (
              <span className="text-emerald-600 dark:text-emerald-500">
                {actividad.evidencias.aprobadas} aprobada{actividad.evidencias.aprobadas !== 1 ? 's' : ''}
              </span>
            )}
            {actividad.requisitos?.length > 0 && actividad.evidencias?.total === 0 && (
              <span>
                {actividad.requisitos.length} entregable{actividad.requisitos.length !== 1 ? 's' : ''} esperado{actividad.requisitos.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}