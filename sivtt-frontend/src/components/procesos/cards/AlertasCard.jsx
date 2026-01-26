import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Alert, AlertDescription } from '@components/ui/alert'
import { AlertCircle, Clock, FileWarning, BellRing, CheckCircle2 } from 'lucide-react'

export const AlertasCard = ({ proceso }) => {
  const alertas = []

  // 1. Actividades observadas
  if (proceso.actividadesObservadas > 0) {
    alertas.push({
      type: 'warning',
      icon: AlertCircle,
      message: `${proceso.actividadesObservadas} actividad${proceso.actividadesObservadas > 1 ? 'es' : ''} observada${proceso.actividadesObservadas > 1 ? 's' : ''} requiere${proceso.actividadesObservadas > 1 ? 'n' : ''} atención`
    })
  }

  // 2. Actividades pendientes (solo informativo si son muchas)
  if (proceso.actividadesPendientes > 0) {
    alertas.push({
      type: 'info',
      icon: Clock,
      message: `${proceso.actividadesPendientes} actividad${proceso.actividadesPendientes > 1 ? 'es' : ''} pendiente${proceso.actividadesPendientes > 1 ? 's' : ''} de completar`
    })
  }

  // 3. Sin equipo (Critical)
  if (!proceso.usuarios || proceso.usuarios.length === 0) {
    alertas.push({
      type: 'critical', // Custom type logic below
      icon: FileWarning,
      message: 'El proceso no tiene equipo asignado. Asigne un responsable.'
    })
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <BellRing className="h-5 w-5 text-gray-500" />
          Estado y Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {alertas.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Todo en orden</p>
            <p className="text-xs text-gray-500 mt-1">No hay alertas pendientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertas.map((alerta, index) => {
              const Icon = alerta.icon
              
              // Estilos dinámicos
              let styles = "bg-blue-50 border-blue-200 text-blue-900"
              let iconColor = "text-blue-600"
              
              if (alerta.type === 'warning') {
                styles = "bg-orange-50 border-orange-200 text-orange-900"
                iconColor = "text-orange-600"
              } else if (alerta.type === 'critical') {
                styles = "bg-red-50 border-red-200 text-red-900"
                iconColor = "text-red-600"
              }

              return (
                <Alert key={index} className={`border ${styles}`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                  <AlertDescription className="ml-2">
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