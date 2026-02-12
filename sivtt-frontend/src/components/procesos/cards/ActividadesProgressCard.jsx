import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Progress } from '@components/ui/progress'
import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react'
import { cn } from '@/lib/utils'

export const ActividadesProgressCard = ({ proceso }) => {
  const total = proceso.actividadesTotales || 0
  const completadas = proceso.actividadesCompletadas || 0
  
  const progress = total > 0 ? Math.round((completadas / total) * 100) : 0

  const stats = [
    {
      label: 'Completadas',
      value: completadas,
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      label: 'Pendientes',
      value: proceso.actividadesPendientes || 0,
      icon: Clock,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      label: 'Observadas',
      value: proceso.actividadesObservadas || 0,
      icon: AlertCircle,
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-muted-foreground" />
          Progreso de Actividades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">
              Avance General
            </span>
            <span className="font-bold text-foreground tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />
          <p className="text-xs text-muted-foreground text-right tabular-nums">
            {completadas} de {total} actividades finalizadas
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex flex-col md:flex-row items-center md:items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  stat.bgClass
                )}>
                  <Icon className={cn("h-4 w-4", stat.colorClass)} />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl font-bold text-foreground leading-none tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}