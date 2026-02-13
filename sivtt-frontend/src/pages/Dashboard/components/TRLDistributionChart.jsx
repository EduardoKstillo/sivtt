import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TRL_COLORS = {
  1: '#ef4444', 2: '#ef4444', 3: '#ef4444', // Básico (rojo)
  4: '#f59e0b', 5: '#f59e0b', 6: '#f59e0b', // Desarrollo (naranja)
  7: '#10b981', 8: '#10b981', 9: '#10b981'  // Demostración (verde)
}

export const TRLDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

  const chartData = data.map(item => ({
    trl: `TRL ${item.nivel}`,
    cantidad: item.cantidad,
    nivel: item.nivel
  }))

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="trl" fontSize={12} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={TRL_COLORS[entry.nivel] || '#6b7280'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">TRL 1-3: Investigación Básica</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span className="text-gray-600">TRL 4-6: Desarrollo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">TRL 7-9: Demostración</span>
        </div>
      </div>
    </div>
  )
}