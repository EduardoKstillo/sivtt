import { useState } from 'react'
import { Badge } from '@components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import {
  CheckCircle2, Clock, AlertCircle, Calendar, FileText, Users, Paperclip,
  AlertTriangle, MoreVertical, Trash2, Edit
} from 'lucide-react'
import { formatDate } from '@utils/formatters'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Configuración de Estados ──────────────────────────────────────────────────
const ESTADO_CONFIG = {
  APROBADA: {
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40',
    borderClass: 'border-l-[3px] border-l-emerald-500',
  },
  EN_PROGRESO: {
    icon: Clock,
    dot: 'bg-blue-500',
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40',
    borderClass: 'border-l-[3px] border-l-transparent',
  },
  EN_REVISION: {
    icon: Clock,
    dot: 'bg-violet-500',
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-950/40',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/40',
    borderClass: 'border-l-[3px] border-l-transparent',
  },
  OBSERVADA: {
    icon: AlertCircle,
    dot: 'bg-amber-500',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40',
    borderClass: 'border-l-[3px] border-l-amber-500',
  },
  LISTA_PARA_CIERRE: {
    icon: CheckCircle2,
    dot: 'bg-teal-500',
    colorClass: 'text-teal-600 dark:text-teal-400',
    bgClass: 'bg-teal-50 dark:bg-teal-950/40',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/40',
    borderClass: 'border-l-[3px] border-l-teal-500',
  },
  CREADA: {
    icon: FileText,
    dot: 'bg-slate-400',
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    borderClass: 'border-l-[3px] border-l-transparent',
  },
  RECHAZADA: {
    icon: AlertCircle,
    dot: 'bg-rose-500',
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40',
    borderClass: 'border-l-[3px] border-l-rose-500',
  },
}

const TIPO_ICONS = {
  DOCUMENTO: FileText, REUNION: Users, TAREA: CheckCircle2, REVISION: Clock, OTRO: FileText
}

export const ActividadCard = ({ actividad, onClick, onRefresh, onEdit, compact = false, canManage }) => {
  const [loadingAction, setLoadingAction] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()

    if (actividad.evidencias?.total > 0) {
      toast.error('Acción bloqueada', {
        description: 'No se puede eliminar una actividad con evidencias. Bórrelas primero.'
      })
      return
    }

    if (!confirm('¿Estás seguro de eliminar esta actividad permanentemente?')) return

    setLoadingAction(true)
    try {
      await actividadesAPI.delete(actividad.id)
      toast.success('Actividad eliminada')
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error('Error', { description: error.response?.data?.message })
    } finally {
      setLoadingAction(false)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    if (onEdit) onEdit(actividad)
  }

  const estadoConfig = ESTADO_CONFIG[actividad.estado] || ESTADO_CONFIG.CREADA
  const IconEstado   = estadoConfig.icon
  const IconTipo     = TIPO_ICONS[actividad.tipo] || FileText

  const isEditable   = actividad.estado !== 'APROBADA'
  const showMenu     = isEditable && canManage

  // ── MODO COMPACTO (Para Historial) ──────────────────────────────────────────
  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 group",
          "bg-background border border-border",
          "hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn('w-2 h-2 rounded-full shrink-0', estadoConfig.dot)} />
          <span className="text-[13px] font-medium text-muted-foreground truncate group-hover:text-primary transition-colors">
            {actividad.nombre}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
          {actividad.evidencias?.total > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" /> {actividad.evidencias.total}
            </div>
          )}
          <Badge variant="outline" className="text-[10px] h-4.5 px-2 capitalize">
            {actividad.estado.replace(/_/g, ' ').toLowerCase()}
          </Badge>
        </div>
      </div>
    )
  }

  // ── MODO NORMAL ────────────────────────────────────────────────────────────
  const isVencida = actividad.fechaLimite &&
    new Date(actividad.fechaLimite) < new Date() &&
    actividad.estado !== 'APROBADA' &&
    actividad.estado !== 'LISTA_PARA_CIERRE'

  const responsable     = actividad.responsables?.[0]
  const masResponsables = (actividad.responsables?.length || 0) - 1
  const evidenciasData  = actividad.evidencias || { total: 0, aprobadas: 0, rechazadas: 0 }
  const tieneRechazos   = evidenciasData.rechazadas > 0

  return (
    <div
      onClick={onClick}
      className={cn(
        'w-full text-left group relative',
        'flex items-start gap-3.5 p-3',
        'bg-background border border-border rounded-lg',
        'hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm',
        'transition-all duration-200 cursor-pointer',
        estadoConfig.borderClass,
        actividad.estado === 'APROBADA' && 'opacity-65 hover:opacity-100'
      )}
    >
      {/* Menú de Acciones */}
      {showMenu && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-3.5 w-3.5 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                disabled={evidenciasData.total > 0 || loadingAction}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                {loadingAction ? 'Eliminando...' : 'Eliminar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Ícono de Estado */}
      <div className={cn(
        'w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors mt-0.5',
        estadoConfig.bgClass,
        'group-hover:bg-primary/10'
      )}>
        <IconEstado className={cn('h-4 w-4 transition-colors', estadoConfig.colorClass, 'group-hover:text-primary')} />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 min-w-0 py-0.5 pr-8">
        
        {/* Título y Badges */}
        <div className="flex flex-col gap-1.5 mb-2">
          <h3 className="text-[13px] font-semibold text-foreground leading-snug truncate group-hover:text-primary transition-colors">
            {actividad.nombre}
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap">
            {actividad.obligatoria && (
              <Badge variant="outline" className="text-[10px] font-semibold text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40 h-4.5 px-2">
                Obligatoria
              </Badge>
            )}
            <Badge variant="outline" className={cn('text-[10px] font-medium border h-4.5 px-2 gap-1.5 capitalize', estadoConfig.badgeClass)}>
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', estadoConfig.dot)} />
              {actividad.estado.replace(/_/g, ' ').toLowerCase()}
            </Badge>
          </div>
        </div>

        {/* Descripción */}
        {actividad.descripcion && (
          <p className="text-[12px] text-muted-foreground line-clamp-1 mb-2.5">
            {actividad.descripcion}
          </p>
        )}

        {/* Fila de Metadatos Inferior */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-muted-foreground mt-2 border-t border-border/50 pt-2.5">
          <div className="flex items-center gap-1.5">
            <IconTipo className="h-3.5 w-3.5" />
            <span className="capitalize">{actividad.tipo.toLowerCase()}</span>
          </div>

          {responsable && (
            <div className="flex items-center gap-1.5 text-foreground/80" title="Responsable">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {responsable.nombres?.split(' ')[0]} {responsable.apellidos?.split(' ')[0]}
                {masResponsables > 0 && ` +${masResponsables}`}
              </span>
            </div>
          )}

          {(evidenciasData.total > 0 || actividad.requisitos?.length > 0) && (
            <div className="flex items-center gap-2.5">
              {tieneRechazos && (
                <span className="text-red-600 dark:text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> {evidenciasData.rechazadas} recha.
                </span>
              )}
              {!tieneRechazos && evidenciasData.total > 0 && (
                <span className="text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {evidenciasData.aprobadas}/{evidenciasData.total}
                </span>
              )}
              {actividad.requisitos?.length > 0 && evidenciasData.total === 0 && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> {actividad.requisitos.length} reqs.
                </span>
              )}
            </div>
          )}

          {actividad.fechaLimite && (
            <div className={cn(
              'flex items-center gap-1.5 ml-auto tabular-nums',
              isVencida ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-muted-foreground'
            )}>
              {isVencida ? <AlertTriangle className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
              <span>{formatDate(actividad.fechaLimite)}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}