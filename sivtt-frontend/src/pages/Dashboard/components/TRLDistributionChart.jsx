import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TRL_COLORS = {
  1: '#ef4444', 2: '#ef4444', 3: '#ef4444', // destructive — investigación básica
  4: '#f59e0b', 5: '#f59e0b', 6: '#f59e0b', // amber-500  — desarrollo
  7: '#10b981', 8: '#10b981', 9: '#10b981'  // emerald-500 — demostración
}

export const TRLDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No hay datos disponibles
      </div>
    )
  }

  const chartData = data.map(item => ({
    trl:      `TRL ${item.nivel}`,
    cantidad: item.cantidad,
    nivel:    item.nivel
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

      {/* Leyenda — text-muted-foreground en lugar de text-gray-600 */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
          <span>TRL 1-3: Investigación Básica</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span>TRL 4-6: Desarrollo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span>TRL 7-9: Demostración</span>
        </div>
      </div>
    </div>
  )
}