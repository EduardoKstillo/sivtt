import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Calendar, User, Building2 } from 'lucide-react'
import { TIPO_ACTIVO, ESTADO_PROCESO } from '@utils/constants'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

export const ProcesoCard = ({ proceso }) => {
  const isPatente = proceso.tipoActivo === TIPO_ACTIVO.PATENTE

  const responsable = proceso.usuarios?.[0]?.usuario
  const responsableNombre = responsable
    ? `${responsable.nombres} ${responsable.apellidos}`
    : 'Sin responsable'

  const getEstadoBadgeVariant = (estado) => {
    switch (estado) {
      case ESTADO_PROCESO.ACTIVO:
        return 'default'
      case ESTADO_PROCESO.PAUSADO:
        return 'secondary'
      case ESTADO_PROCESO.FINALIZADO:
        return 'outline'
      case ESTADO_PROCESO.CANCELADO:
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Link to={`/procesos/${proceso.id}`}>
      <Card className="h-full hover:shadow-lg transition cursor-pointer group">
        <CardHeader className="pb-2">
          <Badge
            className={cn(
              'mb-2 text-white border-0',
              isPatente
                ? 'bg-blue-600'
                : 'bg-purple-600'
            )}
          >
            {isPatente ? 'PATENTE' : 'REQUERIMIENTO'}
          </Badge>

          <p className="text-xs text-gray-500">{proceso.codigo}</p>

          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600">
            {proceso.titulo}
          </h3>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Fase</span>
            <Badge variant="outline">{proceso.faseActual}</Badge>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Actividades</span>
            <span className="font-medium">{proceso.actividadesTotales}</span>
          </div>

          {isPatente && proceso.empresasVinculadas > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Empresas</span>
              <span className="font-medium">{proceso.empresasVinculadas}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-3 text-xs text-gray-500 flex-col gap-2">
          <div className="flex justify-between w-full">
            <Badge variant={getEstadoBadgeVariant(proceso.estado)}>
              {proceso.estado}
            </Badge>
          </div>

          <div className="flex justify-between w-full">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[140px]">
                {responsableNombre}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(proceso.createdAt)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
