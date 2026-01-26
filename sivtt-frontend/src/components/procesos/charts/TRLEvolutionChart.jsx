import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useHistorialTRL } from '@hooks/useHistorialTRL'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { formatDate } from '@utils/formatters'
import { TrendingUp, AlertCircle } from 'lucide-react'

export const TRLEvolutionChart = ({ procesoId }) => {
  const { historialTRL, loading, error } = useHistorialTRL(procesoId)

  // Procesamiento de datos memorizado
  const chartData = useMemo(() => {
    if (!historialTRL || historialTRL.length === 0) return []

    // 1. Crear copia para no mutar el estado
    // 2. Ordenar cronológicamente (Backend devuelve DESC, necesitamos ASC para el gráfico)
    // 3. Mapear a formato del gráfico
    return [...historialTRL]
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .map((entry) => ({
        fecha: formatDate(entry.fecha, 'dd/MM'),
        fullDate: formatDate(entry.fecha, 'dd/MM/yyyy HH:mm'),
        trl: entry.trlNuevo,
        fase: entry.fase,
        usuario: entry.usuario ? `${entry.usuario.nombres} ${entry.usuario.apellidos}` : 'Sistema'
      }))
  }, [historialTRL])

  if (loading) {
    return (
      <Card className="h-full min-h-[400px] flex items-center justify-center">
        <LoadingSpinner />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-red-500 gap-2">
        <AlertCircle className="h-8 w-8" />
        <p>Error al cargar el historial</p>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 gap-2">
        <TrendingUp className="h-8 w-8 opacity-50" />
        <p>No hay registros de evolución de TRL</p>
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
          <p className="text-sm font-bold text-blue-700 mb-1">
            TRL {data.trl} / 9
          </p>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">
              Fase: {data.fase}
            </p>
            <p className="text-xs text-gray-500">
              {data.fullDate}
            </p>
            <p className="text-xs text-gray-400 italic">
              Por: {data.usuario}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gray-500" />
          Evolución del TRL
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border">
          <span className="font-semibold text-gray-900">{chartData.length}</span>
          <span>cambios</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="fecha" 
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dy={10}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                domain={[0, 9]}
                ticks={[1, 3, 5, 7, 9]}
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }} />
              <Line 
                type="stepAfter" // 'stepAfter' suele ser mejor para niveles discretos como TRL
                dataKey="trl" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: '#ffffff', stroke: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leyenda de Niveles */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-[10px] sm:text-xs">
          <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded border border-blue-100 text-center">
            <span className="font-bold block mb-0.5">TRL 1-3</span>
            Investigación
          </div>
          <div className="bg-purple-50 text-purple-800 px-3 py-2 rounded border border-purple-100 text-center">
            <span className="font-bold block mb-0.5">TRL 4-6</span>
            Desarrollo
          </div>
          <div className="bg-green-50 text-green-800 px-3 py-2 rounded border border-green-100 text-center">
            <span className="font-bold block mb-0.5">TRL 7-9</span>
            Despliegue
          </div>
        </div>
      </CardContent>
    </Card>
  )
}