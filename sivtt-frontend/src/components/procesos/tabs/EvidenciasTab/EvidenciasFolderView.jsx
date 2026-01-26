import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { ChevronDown, ChevronRight, Folder } from 'lucide-react'
import { EvidenciaItem } from './EvidenciaItem'
import { cn } from '@/lib/utils'

export const EvidenciasFolderView = ({ fase, evidencias, onEvidenciaClick }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  // Estadísticas
  const total = evidencias.length
  const aprobadas = evidencias.filter(e => e.estado === 'APROBADA').length
  const pendientes = evidencias.filter(e => e.estado === 'PENDIENTE').length
  const rechazadas = evidencias.filter(e => e.estado === 'RECHAZADA').length

  return (
    <Card>
      <CardHeader className="cursor-pointer hover:bg-gray-50" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              )}
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Folder className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{fase}</h3>
                <p className="text-sm text-gray-500">{total} evidencia{total !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aprobadas > 0 && (
              <Badge className="bg-green-100 text-green-700">
                ✅ {aprobadas}
              </Badge>
            )}
            {pendientes > 0 && (
              <Badge className="bg-yellow-100 text-yellow-700">
                ⏳ {pendientes}
              </Badge>
            )}
            {rechazadas > 0 && (
              <Badge className="bg-red-100 text-red-700">
                ❌ {rechazadas}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {evidencias.map((evidencia) => (
              <EvidenciaItem
                key={evidencia.id}
                evidencia={evidencia}
                onClick={() => onEvidenciaClick(evidencia)}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}