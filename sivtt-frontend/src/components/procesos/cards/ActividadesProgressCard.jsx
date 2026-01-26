import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Progress } from '@components/ui/progress'
import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react'

export const ActividadesProgressCard = ({ proceso }) => {
  const total = proceso.actividadesTotales || 0
  const completadas = proceso.actividadesCompletadas || 0
  
  const progress = total > 0 ? Math.round((completadas / total) * 100) : 0

  const stats = [
    {
      label: 'Completadas',
      value: completadas,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Pendientes',
      value: proceso.actividadesPendientes || 0,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Observadas',
      value: proceso.actividadesObservadas || 0,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-gray-500" />
            Progreso de Actividades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barra Principal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">
              Avance General
            </span>
            <span className="font-bold text-gray-900">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-gray-500 text-right">
            {completadas} de {total} actividades finalizadas
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex flex-col md:flex-row items-center md:items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl font-bold text-gray-900 leading-none">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
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