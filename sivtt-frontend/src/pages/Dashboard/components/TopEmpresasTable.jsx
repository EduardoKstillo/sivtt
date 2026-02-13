import { Badge } from '@components/ui/badge'
import { Building2, TrendingUp } from 'lucide-react'
import { Avatar, AvatarFallback } from '@components/ui/avatar'

export const TopEmpresasTable = ({ empresas }) => {
  if (!empresas || empresas.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {empresas.map((empresa, index) => (
        <div 
          key={empresa.id}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {/* Ranking */}
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full text-white font-bold text-sm">
            {index + 1}
          </div>

          {/* Logo/Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg font-bold">
              {empresa.nombre?.charAt(0) || 'E'}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 truncate">
                {empresa.nombre}
              </h4>
              {empresa.verificada && (
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  ✅ Verificada
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{empresa.sector || 'Sin sector'}</span>
              </div>
              {empresa.ubicacion && (
                <span>📍 {empresa.ubicacion}</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {empresa.procesosVinculados}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              proceso{empresa.procesosVinculados !== 1 ? 's' : ''} vinculado{empresa.procesosVinculados !== 1 ? 's' : ''}
            </p>
          </div>

          {/* NDA Status */}
          {empresa.ndaFirmados > 0 && (
            <Badge variant="outline" className="whitespace-nowrap">
              📄 {empresa.ndaFirmados} NDA
            </Badge>
          )}
        </div>
      ))}
    </div>
  )
}