import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export const ProcesosPorFaseChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

  const chartData = data.map(item => ({
    fase: item.fase.replace('_', ' '),
    Patentes: item.patentes || 0,
    Requerimientos: item.requerimientos || 0,
    total: (item.patentes || 0) + (item.requerimientos || 0)
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="fase" 
          angle={-45}
          textAnchor="end"
          height={100}
          fontSize={12}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Patentes" fill="#3b82f6" />
        <Bar dataKey="Requerimientos" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  )
}