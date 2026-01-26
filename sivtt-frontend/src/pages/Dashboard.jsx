export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Bienvenido al Sistema de Vinculación y Transferencia Tecnológica
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder cards */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800 text-center">
          📊 El módulo Dashboard se implementará en la Fase 12
        </p>
      </div>
    </div>
  )
}