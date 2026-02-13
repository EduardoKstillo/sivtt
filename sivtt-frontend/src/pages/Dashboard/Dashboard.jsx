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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            Dashboard Analítico
          </h1>
          <p className="text-gray-500 mt-1">
            Métricas y estadísticas del sistema de transferencia tecnológica
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
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

          <Button variant="outline" size="icon" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <KPICards kpis={data.kpis} metricasPorTipo={data.metricasPorTipo} />

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="procesos">Procesos</TabsTrigger>
          <TabsTrigger value="actividades">Actividades</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Procesos Creados en el Tiempo</CardTitle>
              </CardHeader>
              <CardContent>
                <TimelineChart data={data.timeline} />
              </CardContent>
            </Card>

            {/* Procesos por Estado */}
            <Card>
              <CardHeader>
                <CardTitle>Procesos por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <ProcesosPorEstadoChart data={data.procesosPorEstado} />
              </CardContent>
            </Card>

            {/* Procesos por Fase */}
            <Card>
              <CardHeader>
                <CardTitle>Procesos por Fase</CardTitle>
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
            {/* TRL Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de TRL (Patentes)</CardTitle>
              </CardHeader>
              <CardContent>
                <TRLDistributionChart data={data.trlDistribution} />
              </CardContent>
            </Card>

            {/* Actividad Reciente */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
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
            {/* Actividades por Estado */}
            <Card>
              <CardHeader>
                <CardTitle>Actividades por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <ActividadesPorEstadoChart data={data.actividadesPorEstado} />
              </CardContent>
            </Card>

            {/* Placeholder para más métricas */}
            <Card>
              <CardHeader>
                <CardTitle>Eficiencia de Actividades</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px] text-gray-500">
                Próximamente
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Empresas Tab */}
        <TabsContent value="empresas" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Empresas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Empresas Vinculadas</CardTitle>
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
