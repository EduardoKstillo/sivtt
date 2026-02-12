import { useState } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@components/ui/dropdown-menu'
import { 
  CheckCircle2, Clock, AlertCircle, Calendar, FileText, Users, Paperclip, AlertTriangle, 
  MoreVertical, Trash2, Edit
} from 'lucide-react'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from '@components/ui/use-toast'

const ESTADO_CONFIG = {
  APROBADA: {
    icon: CheckCircle2,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40',
    borderClass: 'border-l-emerald-500',
  },
  EN_PROGRESO: {
    icon: Clock,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40',
    borderClass: 'border-l-transparent',
  },
  EN_REVISION: {
    icon: Clock,
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-950/40',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/40',
    borderClass: 'border-l-transparent',
  },
  OBSERVADA: {
    icon: AlertCircle,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40',
    borderClass: 'border-l-amber-500',
  },
  LISTA_PARA_CIERRE: {
    icon: CheckCircle2,
    colorClass: 'text-teal-600 dark:text-teal-400',
    bgClass: 'bg-teal-50 dark:bg-teal-950/40',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/40',
    borderClass: 'border-l-teal-500',
  },
  CREADA: {
    icon: FileText,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    borderClass: 'border-l-transparent',
  },
  RECHAZADA: {
    icon: AlertCircle,
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40',
    borderClass: 'border-l-rose-500',
  },
}

const TIPO_ICONS = {
  DOCUMENTO: FileText, REUNION: Users, TAREA: CheckCircle2, REVISION: Clock, OTRO: FileText
}

export const ActividadCard = ({ actividad, onClick, onRefresh, onEdit, compact = false }) => {
  const [loadingAction, setLoadingAction] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    
    if (actividad.evidencias?.total > 0) {
      toast({ variant: 'destructive', title: 'Acción bloqueada', description: 'No se puede eliminar una actividad con evidencias. Bórrelas primero.' })
      return
    }

    if (!confirm('¿Estás seguro de eliminar esta actividad permanentemente?')) return

    setLoadingAction(true)
    try {
      await actividadesAPI.delete(actividad.id)
      toast({ title: 'Actividad eliminada' })
      if (onRefresh) onRefresh()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    } finally {
      setLoadingAction(false)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    if (onEdit) onEdit(actividad)
  }

  const estadoConfig = ESTADO_CONFIG[actividad.estado] || ESTADO_CONFIG.CREADA
  const IconEstado = estadoConfig.icon
  const IconTipo = TIPO_ICONS[actividad.tipo] || FileText

  // --- COMPACT MODE ---
  if (compact) {
    return (
      <div 
        onClick={onClick}
        className="flex items-center justify-between p-2.5 bg-muted/30 border border-border rounded-md cursor-pointer hover:bg-muted/50 hover:border-border transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn(
            "w-2 h-2 rounded-full shrink-0",
            estadoConfig.colorClass.replace('text-', 'bg-').split(' ')[0]
          )} />
          <span className="text-sm font-medium text-muted-foreground truncate group-hover:text-foreground transition-colors">
            {actividad.nombre}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {actividad.evidencias?.total > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" /> {actividad.evidencias.total}
            </div>
          )}
          <Badge variant="outline" className="text-[10px] h-5 text-muted-foreground">
            {actividad.estado}
          </Badge>
        </div>
      </div>
    )
  }

  // --- NORMAL MODE ---
  const isVencida = actividad.fechaLimite && 
    new Date(actividad.fechaLimite) < new Date() && 
    actividad.estado !== 'APROBADA' && 
    actividad.estado !== 'LISTA_PARA_CIERRE'

  const responsable = actividad.responsables?.[0]
  const masResponsables = (actividad.responsables?.length || 0) - 1
  const evidenciasData = actividad.evidencias || { total: 0, aprobadas: 0, rechazadas: 0 }
  const tieneRechazos = evidenciasData.rechazadas > 0
  const isEditable = actividad.estado !== 'APROBADA'

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-all cursor-pointer border-l-4 group relative",
        estadoConfig.borderClass
      )}
      onClick={onClick}
    >
      {/* Floating options menu */}
      {isEditable && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
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
                disabled={evidenciasData.total > 0}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3.5">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
            estadoConfig.bgClass
          )}>
            <IconEstado className={cn("h-4 w-4", estadoConfig.colorClass)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1 pr-6">
              <h3 className="font-medium text-foreground leading-snug text-sm">
                {actividad.nombre}
              </h3>

              <div className="flex items-center gap-2 shrink-0">
                {actividad.obligatoria && (
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                    Obligatoria
                  </span>
                )}
                <Badge variant="outline" className={cn("text-[10px] font-medium border px-2 h-5", estadoConfig.badgeClass)}>
                  {actividad.estado.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            {actividad.descripcion && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2.5">
                {actividad.descripcion}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-1.5">
                <IconTipo className="h-3.5 w-3.5" />
                <span className="capitalize">{actividad.tipo.toLowerCase()}</span>
              </div>

              {responsable && (
                <div className="flex items-center gap-1.5" title="Responsable">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {responsable.nombres?.split(' ')[0]} {responsable.apellidos?.split(' ')[0]}
                    {masResponsables > 0 && ` +${masResponsables}`}
                  </span>
                </div>
              )}

              {evidenciasData.total > 0 && (
                <div className={cn(
                  "flex items-center gap-1.5 tabular-nums",
                  tieneRechazos && "text-rose-600 dark:text-rose-400 font-medium"
                )}>
                  {tieneRechazos ? <AlertTriangle className="h-3.5 w-3.5"/> : <Paperclip className="h-3.5 w-3.5" />}
                  <span>
                    {evidenciasData.aprobadas}/{evidenciasData.total}
                    {tieneRechazos && " (Revisar)"}
                  </span>
                </div>
              )}

              {actividad.fechaLimite && (
                <div className={cn(
                  "flex items-center gap-1.5 ml-auto tabular-nums",
                  isVencida && "text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded"
                )}>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(actividad.fechaLimite)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}