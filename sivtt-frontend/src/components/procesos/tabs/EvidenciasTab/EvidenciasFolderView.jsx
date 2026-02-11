import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { ChevronDown, ChevronRight, Folder, FileText, Link as LinkIcon } from 'lucide-react'
import { EvidenciaItem } from './EvidenciaItem'
import { cn } from '@/lib/utils'

export const EvidenciasFolderView = ({ fase, evidencias, onEvidenciaClick }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  // Estadísticas
  const total = evidencias.length
  const aprobadas = evidencias.filter(e => e.estado === 'APROBADA').length
  const pendientes = evidencias.filter(e => e.estado === 'PENDIENTE').length
  const rechazadas = evidencias.filter(e => e.estado === 'RECHAZADA').length
  
  // Tipos
  const links = evidencias.filter(e => e.tipoEvidencia === 'ENLACE').length
  const archivos = total - links

  return (
    <Card className={cn("transition-all border-l-4", isExpanded ? "border-l-blue-500 ring-1 ring-blue-100" : "border-l-transparent")}>
      <CardHeader 
        className="py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-0 h-6 w-6 rounded-full hover:bg-gray-200">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </Button>

            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", isExpanded ? "bg-blue-100" : "bg-gray-100")}>
                <Folder className={cn("h-5 w-5", isExpanded ? "text-blue-600" : "text-gray-500")} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{fase}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3"/> {archivos}</span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1"><LinkIcon className="h-3 w-3"/> {links}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aprobadas > 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-6">
                ✅ {aprobadas}
              </Badge>
            )}
            {pendientes > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 h-6">
                ⏳ {pendientes}
              </Badge>
            )}
            {rechazadas > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 h-6">
                ❌ {rechazadas}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-3 px-3">
          <div className="space-y-1 mt-2 pl-2 sm:pl-4 border-l-2 border-gray-100 ml-6">
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