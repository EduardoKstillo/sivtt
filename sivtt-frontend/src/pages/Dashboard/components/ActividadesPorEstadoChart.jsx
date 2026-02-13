import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const ESTADO_COLORS = {
  APROBADA: '#10b981',
  EN_PROGRESO: '#3b82f6',
  EN_REVISION: '#f59e0b',
  OBSERVADA: '#ef4444',
  LISTA_PARA_CIERRE: '#8b5cf6',
  CREADA: '#6b7280'
}

const CUSTOM_LABEL = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null // No mostrar si es menos del 5%

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="font-semibold text-xs"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export const ActividadesPorEstadoChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

  const chartData = data.map(item => ({
    name: item.estado.replace('_', ' '),
    value: item.cantidad,
    color: ESTADO_COLORS[item.estado] || '#6b7280'
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CUSTOM_LABEL}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => `${value} (${entry.payload.value})`}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Total */}
      <div className="text-center">
        <p className="text-sm text-gray-500">Total de actividades</p>
        <p className="text-2xl font-bold text-gray-900">{total}</p>
      </div>
    </div>
  )
}