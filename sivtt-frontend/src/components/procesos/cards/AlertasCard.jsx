import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Alert, AlertDescription } from '@components/ui/alert'
import { AlertCircle, Clock, FileWarning, BellRing, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const AlertasCard = ({ proceso }) => {
  const alertas = []

  if (proceso.actividadesObservadas > 0) {
    alertas.push({
      type: 'warning',
      icon: AlertCircle,
      message: `${proceso.actividadesObservadas} actividad${proceso.actividadesObservadas > 1 ? 'es' : ''} observada${proceso.actividadesObservadas > 1 ? 's' : ''} requiere${proceso.actividadesObservadas > 1 ? 'n' : ''} atención`
    })
  }

  if (proceso.actividadesPendientes > 0) {
    alertas.push({
      type: 'info',
      icon: Clock,
      message: `${proceso.actividadesPendientes} actividad${proceso.actividadesPendientes > 1 ? 'es' : ''} pendiente${proceso.actividadesPendientes > 1 ? 's' : ''} de completar`
    })
  }

  if (!proceso.usuarios || proceso.usuarios.length === 0) {
    alertas.push({
      type: 'critical',
      icon: FileWarning,
      message: 'El proceso no tiene equipo asignado. Asigne un responsable.'
    })
  }

  const alertStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200/60 dark:bg-blue-950/30 dark:border-blue-800/40',
      text: 'text-blue-800 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-800/40',
      text: 'text-amber-800 dark:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400',
    },
    critical: {
      container: 'bg-rose-50 border-rose-200/60 dark:bg-rose-950/30 dark:border-rose-800/40',
      text: 'text-rose-800 dark:text-rose-300',
      icon: 'text-rose-600 dark:text-rose-400',
    },
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <BellRing className="h-5 w-5 text-muted-foreground" />
          Estado y Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {alertas.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-foreground">Todo en orden</p>
            <p className="text-xs text-muted-foreground mt-1">No hay alertas pendientes</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alertas.map((alerta, index) => {
              const Icon = alerta.icon
              const styles = alertStyles[alerta.type] || alertStyles.info

              return (
                <Alert
                  key={index}
                  className={cn('border', styles.container)}
                >
                  <Icon className={cn('h-4 w-4', styles.icon)} />
                  <AlertDescription className={cn('ml-2 text-sm', styles.text)}>
                    {alerta.message}
                  </AlertDescription>
                </Alert>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}