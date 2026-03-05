import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { KPICards } from './components/KPICards'
import { ProcesosPorEstadoChart } from './components/ProcesosPorEstadoChart'
import { ProcesosPorFaseChart } from './components/ProcesosPorFaseChart'
import { TRLDistributionChart } from './components/TRLDistributionChart'
import { ActividadesPorEstadoChart } from './components/ActividadesPorEstadoChart'
import { TimelineChart } from './components/TimelineChart'
import { TopEmpresasTable } from './components/TopEmpresasTable'
import { RecentActivityFeed } from './components/RecentActivityFeed'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { useDashboardData } from '@hooks/useDashboardData'
import { BarChart3, RefreshCw } from 'lucide-react'
import { Button } from '@components/ui/button'

const Dashboard = () => {
  const { data, loading, error, refetch } = useDashboardData()
  const [periodo, setPeriodo] = useState('ultimo_ano')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar dashboard"
        message="No se pudo cargar la información del dashboard"
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="space-y-6">

      {/* Header — patrón EvidenciasTab con selector y botón refresh a la derecha */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg shrink-0">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard Analítico</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Métricas y estadísticas del sistema de transferencia tecnológica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* h-9 text-sm — consistente con todos los SelectTrigger del sistema */}
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ultimo_mes">Último mes</SelectItem>
              <SelectItem value="ultimo_trimestre">Último trimestre</SelectItem>
              <SelectItem value="ultimo_semestre">Último semestre</SelectItem>
              <SelectItem value="ultimo_ano">Último año</SelectItem>
              <SelectItem value="todo">Todo el tiempo</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={refetch} className="h-9 w-9">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <KPICards kpis={data.kpis} metricasPorTipo={data.metricasPorTipo} />

      {/* Tabs — bg-muted/30 border-border en lugar de bg-white border-gray-200 */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/30 border border-border">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="procesos">Procesos</TabsTrigger>
          <TabsTrigger value="actividades">Actividades</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  Procesos Creados en el Tiempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TimelineChart data={data.timeline} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  Procesos por Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProcesosPorEstadoChart data={data.procesosPorEstado} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  Procesos por Fase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProcesosPorFaseChart data={data.procesosPorFase} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Procesos Tab */}
        <TabsContent value="procesos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  Distribución de TRL (Patentes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TRLDistributionChart data={data.trlDistribution} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivityFeed activities={data.recentActivity} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Actividades Tab */}
        <TabsContent value="actividades" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  Actividades por Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActividadesPorEstadoChart data={data.actividadesPorEstado} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  Eficiencia de Actividades
                </CardTitle>
              </CardHeader>
              {/* text-muted-foreground en lugar de text-gray-500 */}
              <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                Próximamente
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Empresas Tab */}
        <TabsContent value="empresas" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  Top Empresas Vinculadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopEmpresasTable empresas={data.topEmpresas} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard