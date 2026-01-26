import { useState } from 'react'
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
import { MoreVertical, Mail, Edit, Power } from 'lucide-react'
import { EditarUsuarioModal } from '../modals/EditarUsuarioModal'
import { usersAPI } from '@api/endpoints/users'
import { toast } from '@components/ui/use-toast'

/**
 * Configuración visual por código de rol (backend)
 */
const ROL_CONFIG = {
  ADMIN_SISTEMA: {
    label: 'Administrador',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: '👑',
  },
  GESTOR_VINCULACION: {
    label: 'Gestor',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: '🔗',
  },
  INVESTIGADOR: {
    label: 'Investigador',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: '🔬',
  },
  EMPRESA: {
    label: 'Empresa',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: '🏢',
  },
  EVALUADOR: {
    label: 'Evaluador',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '📝',
  },
  REVISOR: {
    label: 'Revisor',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: '🔍',
  },
  RESPONSABLE_FASE: {
    label: 'Resp. Fase',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: '📍',
  },
  OBSERVADOR: {
    label: 'Observador',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: '👁️',
  },
  DEFAULT: {
    label: 'Rol',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: '👤',
  },
}

export const UsuarioTableRow = ({ usuario, onUpdate }) => {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggleActivo = async () => {
    setLoading(true)
    try {
      await usersAPI.toggleEstado(usuario.id, {
        activo: !usuario.activo,
      })

      toast({
        title: !usuario.activo
          ? 'Usuario activado'
          : 'Usuario desactivado',
        description: !usuario.activo
          ? 'El usuario puede acceder nuevamente al sistema'
          : 'El usuario ya no podrá acceder al sistema',
      })

      onUpdate()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cambiar estado',
        description:
          error.response?.data?.message || 'Intente nuevamente',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        {/* Usuario */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold">
                {usuario.nombres?.charAt(0)}{usuario.apellidos?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {usuario.nombres} {usuario.apellidos}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{usuario.email}</span>
              </div>
            </div>
          </div>
        </td>

        {/* Roles */}
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-1.5">
            {usuario.roles?.map((rol) => {
              const config = ROL_CONFIG[rol.codigo] || ROL_CONFIG.DEFAULT
              return (
                <Badge 
                  key={rol.id} 
                  variant="outline"
                  className={`${config.color} border font-medium text-xs`}
                >
                  {config.icon} {config.label}
                </Badge>
              )
            })}
          </div>
        </td>

        {/* Estado */}
        <td className="px-6 py-4">
          <Badge 
            variant="outline"
            className={usuario.activo 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium' 
              : 'bg-gray-100 text-gray-600 border-gray-200 font-medium'
            }
          >
            {usuario.activo ? '● Activo' : '○ Inactivo'}
          </Badge>
        </td>

        {/* Procesos */}
        <td className="px-6 py-4">
          <div className="text-sm space-y-1">
            {usuario._count?.procesos > 0 && (
              <p className="text-gray-600">
                <span className="font-medium text-gray-900">{usuario._count.procesos}</span> procesos
              </p>
            )}
            {usuario.procesosActivos > 0 && (
              <p className="text-emerald-600">
                <span className="font-medium">{usuario.procesosActivos}</span> activos
              </p>
            )}
            {!usuario._count?.procesos && !usuario.procesosActivos && (
              <p className="text-gray-400 text-xs">Sin procesos</p>
            )}
          </div>
        </td>

        {/* Acciones */}
        <td className="px-6 py-4 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={loading} className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleToggleActivo}>
                <Power className="mr-2 h-4 w-4" />
                {usuario.activo ? 'Desactivar' : 'Activar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {/* Modal */}
      <EditarUsuarioModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        usuario={usuario}
        onSuccess={() => {
          setEditModalOpen(false)
          onUpdate()
        }}
      />
    </>
  )
}