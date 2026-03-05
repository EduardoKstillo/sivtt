// ─────────────────────────────────────────────
// ProcesosPorEstadoChart.jsx
// ─────────────────────────────────────────────
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

// Colores de gráfica: valores fijos HEX son correctos aquí porque son
// colores de datos visuales en un canvas SVG, no clases de UI.
// Se alinean a la paleta semántica del sistema (blue, amber, emerald, destructive, muted)
const ESTADO_COLORS = {
  ACTIVO:     '#10b981', // emerald-500
  PAUSADO:    '#f59e0b', // amber-500
  FINALIZADO: '#3b82f6', // blue-500
  CANCELADO:  '#ef4444', // destructive
  ARCHIVADO:  '#6b7280'  // muted
}

export const ProcesosPorEstadoChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      // text-muted-foreground en lugar de text-gray-500
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No hay datos disponibles
      </div>
    )
  }

  const chartData = data.map(item => ({
    name:  item.estado,
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