import { Card, CardContent } from '@components/ui/card'
import { 
  FolderKanban, 
  Building2, 
  Users, 
  TrendingUp,
  FileText,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const KPICard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            color
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1 text-sm">
            <TrendingUp className={cn(
              "h-4 w-4",
              trend > 0 ? "text-green-600" : "text-red-600"
            )} />
            <span className={trend > 0 ? "text-green-600" : "text-red-600"}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-gray-500">vs. mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const KPICards = ({ kpis, metricasPorTipo }) => {
  if (!kpis) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total Procesos"
        value={kpis.totalProcesos}
        subtitle={`${kpis.procesosActivos} activos`}
        icon={FolderKanban}
        color="bg-blue-600"
        trend={kpis.trendProcesos}
      />

      <KPICard
        title="Empresas Vinculadas"
        value={kpis.totalEmpresas}
        subtitle={`${kpis.empresasVerificadas} verificadas`}
        icon={Building2}
        color="bg-purple-600"
        trend={kpis.trendEmpresas}
      />

      <KPICard
        title="Grupos de Investigación"
        value={kpis.totalGrupos}
        subtitle={`${kpis.gruposActivos} activos`}
        icon={Users}
        color="bg-green-600"
        trend={kpis.trendGrupos}
      />

      <KPICard
        title="Actividades Aprobadas"
        value={kpis.actividadesAprobadas}
        subtitle={`${kpis.actividadesPendientes} pendientes`}
        icon={CheckCircle2}
        color="bg-orange-600"
      />

      {/* Cards adicionales por tipo de proceso */}
      {metricasPorTipo && (
        <>
          <KPICard
            title="Patentes"
            value={metricasPorTipo.patentes.total}
            subtitle={`TRL promedio: ${metricasPorTipo.patentes.trlPromedio.toFixed(1)}`}
            icon={FileText}
            color="bg-indigo-600"
          />

          <KPICard
            title="Requerimientos"
            value={metricasPorTipo.requerimientos.total}
            subtitle={`${metricasPorTipo.requerimientos.conGanador} con ganador`}
            icon={FileText}
            color="bg-pink-600"
          />
        </>
      )}
    </div>
  )
}