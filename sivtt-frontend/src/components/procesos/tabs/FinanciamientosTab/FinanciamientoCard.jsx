import { useState } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { 
  MoreVertical, 
  DollarSign, 
  Calendar, 
  Building2,
  FileText,
  Edit,
  Trash2
} from 'lucide-react'
import { financiamientosAPI } from '@api/endpoints/financiamientos'
import { toast } from '@components/ui/use-toast'
import { formatCurrency, formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const TIPO_CONFIG = {
  INSTITUCIONAL: { 
    label: 'Institucional',
    color: 'bg-blue-100 text-blue-700',
    icon: '🏛️'
  },
  EMPRESARIAL: { 
    label: 'Empresarial',
    color: 'bg-purple-100 text-purple-700',
    icon: '🏢'
  },
  GRANT_EXTERNO: { 
    label: 'Grant Externo',
    color: 'bg-green-100 text-green-700',
    icon: '🌍'
  },
  CONCURSO: { 
    label: 'Concurso',
    color: 'bg-orange-100 text-orange-700',
    icon: '🏆'
  },
  OTRO: { 
    label: 'Otro',
    color: 'bg-gray-100 text-gray-700',
    icon: '💰'
  }
}

const ESTADO_CONFIG = {
  COMPROMETIDO: { label: 'Comprometido', color: 'bg-yellow-100 text-yellow-700' },
  RECIBIDO: { label: 'Recibido', color: 'bg-green-100 text-green-700' },
  EJECUTADO: { label: 'Ejecutado', color: 'bg-blue-100 text-blue-700' }
}

export const FinanciamientoCard = ({ financiamiento, proceso, onUpdate }) => {
  const [loading, setLoading] = useState(false)

  const tipoConfig = TIPO_CONFIG[financiamiento.tipo] || TIPO_CONFIG.OTRO
  const estadoConfig = ESTADO_CONFIG[financiamiento.estado]

  const handleDelete = async () => {
    if (!confirm('¿Está seguro de eliminar este financiamiento?')) return

    setLoading(true)
    try {
      await financiamientosAPI.delete(financiamiento.id)

      toast({
        title: "Financiamiento eliminado",
        description: "El registro fue eliminado exitosamente"
      })

      onUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          {/* Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center text-white text-2xl">
                {tipoConfig.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {financiamiento.fuente}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={tipoConfig.color}>
                    {tipoConfig.label}
                  </Badge>
                  <Badge className={estadoConfig.color}>
                    {estadoConfig.label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Monto */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Monto</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(financiamiento.monto)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {financiamiento.fechaRecepcion && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Fecha de recepción</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(financiamiento.fechaRecepcion)}
                    </p>
                  </div>
                </div>
              )}

              {financiamiento.entidadFinanciadora && (
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Entidad financiadora</p>
                    <p className="font-medium text-gray-900">
                      {financiamiento.entidadFinanciadora}
                    </p>
                  </div>
                </div>
              )}

              {financiamiento.numeroConvenio && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">N° Convenio/Contrato</p>
                    <p className="font-medium text-gray-900">
                      {financiamiento.numeroConvenio}
                    </p>
                  </div>
                </div>
              )}

              {financiamiento.vigencia && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Vigencia</p>
                    <p className="font-medium text-gray-900">
                      {financiamiento.vigencia}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Observaciones */}
            {financiamiento.observaciones && (
              <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-700 mb-1">Observaciones:</p>
                <p>{financiamiento.observaciones}</p>
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={loading}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}