import { useState } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { MoreVertical, Mail, Calendar, UserX } from 'lucide-react'
import { equiposAPI } from '@api/endpoints/equipos'
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'

const ROL_CONFIG = {
  RESPONSABLE_PROCESO: {
    label: 'Responsable del Proceso',
    color: 'bg-blue-100 text-blue-700',
    icon: '⭐'
  },
  APOYO: {
    label: 'Apoyo',
    color: 'bg-purple-100 text-purple-700',
    icon: '🤝'
  },
  OBSERVADOR: {
    label: 'Observador',
    color: 'bg-gray-100 text-gray-700',
    icon: '👁️'
  }
}

export const MiembroEquipoCard = ({ miembro, proceso, onUpdate }) => {
  const [loading, setLoading] = useState(false)

  const rolConfig = ROL_CONFIG[miembro.rolProceso]

  const handleRemove = async () => {
    if (!confirm(`¿Está seguro de remover a ${miembro.usuario?.nombre} del equipo?`)) return

    setLoading(true)
    try {
      await equiposAPI.removeMiembro(proceso.id, miembro.usuarioId)

      toast({
        title: "Miembro removido",
        description: "El miembro fue removido del equipo exitosamente"
      })

      onUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al remover",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg">
                {miembro.usuario?.nombre?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">
                  {miembro.usuario?.nombre}
                </h4>
                <Badge className={rolConfig.color}>
                  {rolConfig.icon} {rolConfig.label}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <a 
                    href={`mailto:${miembro.usuario?.email}`}
                    className="hover:underline"
                  >
                    {miembro.usuario?.email}
                  </a>
                </div>

                {miembro.fechaAsignacion && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Desde {formatDate(miembro.fechaAsignacion)}</span>
                  </div>
                )}
              </div>

              {miembro.observaciones && (
                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                  💬 {miembro.observaciones}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={loading}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled>
                Ver perfil
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem 
                onClick={handleRemove}
                className="text-red-600 focus:text-red-600"
              >
                <UserX className="mr-2 h-4 w-4" />
                Remover del equipo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}