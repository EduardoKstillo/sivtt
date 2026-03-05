import { Card, CardContent } from '@components/ui/card'
import {
  FolderKanban,
  Building2,
  Users,
  TrendingUp,
  FileText,
  CheckCircle2,
  TrendingDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mapa de icono → clase de color semántica del sistema
// Usa bg-*-500/10 text-*-500 para adaptarse a dark mode
const KPI_COLORS = {
  blue:    'bg-blue-500/10 text-blue-500',
  violet:  'bg-violet-500/10 text-violet-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  amber:   'bg-amber-500/10 text-amber-500',
  indigo:  'bg-indigo-500/10 text-indigo-500',
  pink:    'bg-pink-500/10 text-pink-500',
}

const KPICard = ({ title, value, subtitle, icon: Icon, colorKey = 'blue', trend }) => {
  const colorClass = KPI_COLORS[colorKey] ?? KPI_COLORS.blue
  const trendPositive = trend > 0
  const trendNegative = trend < 0

  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* text-muted-foreground en lugar de text-gray-600 */}
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold text-foreground mb-1 tabular-nums leading-none">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Ícono — bg semántico sin hardcode de color sólido */}
          <div className={cn(
            'w-11 h-11 rounded-lg flex items-center justify-center shrink-0',
            colorClass
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Trend — emerald/destructive semánticos */}
        {trend !== undefined && trend !== null && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {trendPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : trendNegative ? (
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            ) : null}
            <span className={cn(
              'font-medium',
              trendPositive  && 'text-emerald-500',
              trendNegative  && 'text-destructive',
              !trendPositive && !trendNegative && 'text-muted-foreground'
            )}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-muted-foreground">vs. mes anterior</span>
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
        colorKey="blue"
        trend={kpis.trendProcesos}
      />

      <KPICard
        title="Empresas Vinculadas"
        value={kpis.totalEmpresas}
        subtitle={`${kpis.empresasVerificadas} verificadas`}
        icon={Building2}
        colorKey="violet"
        trend={kpis.trendEmpresas}
      />

      <KPICard
        title="Grupos de Investigación"
        value={kpis.totalGrupos}
        subtitle={`${kpis.gruposActivos} activos`}
        icon={Users}
        colorKey="emerald"
        trend={kpis.trendGrupos}
      />

      <KPICard
        title="Actividades Aprobadas"
        value={kpis.actividadesAprobadas}
        subtitle={`${kpis.actividadesPendientes} pendientes`}
        icon={CheckCircle2}
        colorKey="amber"
      />

      {metricasPorTipo && (
        <>
          <KPICard
            title="Patentes"
            value={metricasPorTipo.patentes.total}
            subtitle={`TRL promedio: ${metricasPorTipo.patentes.trlPromedio.toFixed(1)}`}
            icon={FileText}
            colorKey="indigo"
          />

          <KPICard
            title="Requerimientos"
            value={metricasPorTipo.requerimientos.total}
            subtitle={`${metricasPorTipo.requerimientos.conGanador} con ganador`}
            icon={FileText}
            colorKey="pink"
          />
        </>
      )}
    </div>
  )
}