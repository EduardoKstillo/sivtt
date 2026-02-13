import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const ESTADO_COLORS = {
  ACTIVO: '#10b981',
  PAUSADO: '#f59e0b',
  FINALIZADO: '#3b82f6',
  CANCELADO: '#ef4444',
  ARCHIVADO: '#6b7280'
}

export const ProcesosPorEstadoChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

  const chartData = data.map(item => ({
    name: item.estado,
    value: item.cantidad,
    color: ESTADO_COLORS[item.estado] || '#6b7280'
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}