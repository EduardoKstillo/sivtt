import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
import { CheckCircle2, Loader2, Clock, AlertCircle, FileText, Zap } from 'lucide-react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

const ESTADO_FLOW = {
  CREADA: {
    icon: FileText,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
    description: 'La actividad ha sido creada. Se iniciará cuando se suba el primer archivo.',
  },
  EN_PROGRESO: {
    icon: Clock,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    description: 'El responsable está trabajando. Faltan entregar documentos o asignar revisor.',
  },
  EN_REVISION: {
    icon: Clock,
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-950/40',
    descriptionFn: (p) => `Hay ${p} documento(s) pendiente(s) de revisión.`,
  },
  OBSERVADA: {
    icon: AlertCircle,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    descriptionFn: (_, r) => `Hay ${r} documento(s) rechazado(s) que requieren corrección.`,
  },
  LISTA_PARA_CIERRE: {
    icon: CheckCircle2,
    colorClass: 'text-teal-600 dark:text-teal-400',
    bgClass: 'bg-teal-50 dark:bg-teal-950/40',
    description: 'Todos los documentos han sido aprobados. Lista para cierre formal.',
  },
  APROBADA: {
    icon: CheckCircle2,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    description: 'Actividad finalizada y cerrada.',
  },
}

const FLOW_ORDER = ['CREADA', 'EN_PROGRESO', 'EN_REVISION', 'LISTA_PARA_CIERRE', 'APROBADA']

export const ActividadEstadoMachine = ({ actividad, onUpdate }) => {
  const [loading, setLoading] = useState(false)

  const evidencias = Array.isArray(actividad.evidencias) ? actividad.evidencias : []

  const ultimasVersiones = Object.values(
    evidencias.reduce((acc, ev) => {
      const key = ev.requisitoId ? `req-${ev.requisitoId}` : `extra-${ev.id}`
      if (!acc[key] || ev.version > acc[key].version) {
        acc[key] = ev
      }
      return acc
    }, {})
  )

  const pendientes = ultimasVersiones.filter(e => e.estado === 'PENDIENTE').length
  const rechazadas = ultimasVersiones.filter(e => e.estado === 'RECHAZADA').length
  const puedeAprobar = actividad.estado === 'LISTA_PARA_CIERRE' && pendientes === 0 && rechazadas === 0

  const currentConfig = ESTADO_FLOW[actividad.estado] || ESTADO_FLOW.CREADA
  const CurrentIcon = currentConfig.icon
  const currentIndex = FLOW_ORDER.indexOf(actividad.estado)

  const description = currentConfig.descriptionFn
    ? currentConfig.descriptionFn(pendientes, rechazadas)
    : currentConfig.description

  const handleAprobar = async () => {
    setLoading(true)
    try {
      const { data } = await actividadesAPI.aprobar(actividad.id)
      const actividadActualizada = data.data || data
      toast({ title: "Actividad Aprobada", description: "El ciclo de vida de la actividad ha finalizado." })
      onUpdate(actividadActualizada)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Error al aprobar" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 pt-2">
      {/* Current state card */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 border-b border-border">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
            Estado Actual
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", currentConfig.bgClass)}>
              <CurrentIcon className={cn("h-5 w-5", currentConfig.colorClass)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-sm font-semibold", currentConfig.colorClass)}>
                  {actividad.estado.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress flow visualization */}
      <div className="flex items-center gap-1 px-1">
        {FLOW_ORDER.map((estado, index) => {
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex
          const isObservada = actividad.estado === 'OBSERVADA' && estado === 'EN_REVISION'
          const config = ESTADO_FLOW[estado]
          const Icon = config.icon

          return (
            <div key={estado} className="flex items-center flex-1 gap-1 last:flex-initial">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-all",
                  isActive ? "w-8 h-8" : "w-6 h-6",
                  isCompleted && "bg-emerald-100 dark:bg-emerald-950/40",
                  isActive && config.bgClass,
                  !isCompleted && !isActive && "bg-muted/50",
                  isObservada && "bg-amber-50 dark:bg-amber-950/40"
                )}
                title={estado.replace(/_/g, ' ')}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Icon className={cn(
                    isActive ? "h-4 w-4" : "h-3 w-3",
                    isActive ? config.colorClass : "text-muted-foreground/40",
                    isObservada && "text-amber-600 dark:text-amber-400"
                  )} />
                )}
              </div>
              {index < FLOW_ORDER.length - 1 && (
                <div className={cn(
                  "h-0.5 flex-1 rounded-full",
                  isCompleted ? "bg-emerald-300 dark:bg-emerald-700" : "bg-border"
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Approval action */}
      {actividad.estado === 'LISTA_PARA_CIERRE' && (
        <div className="pt-1">
          <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/40 mb-4">
            <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <AlertDescription className="text-emerald-800 dark:text-emerald-300 text-xs">
              Todas las evidencias están correctas. Puedes proceder al cierre.
            </AlertDescription>
          </Alert>
          <Button 
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white" 
            onClick={handleAprobar} 
            disabled={loading || !puedeAprobar}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle2 className="h-4 w-4"/>}
            Aprobar y Cerrar Actividad
          </Button>
        </div>
      )}
    </div>
  )
}