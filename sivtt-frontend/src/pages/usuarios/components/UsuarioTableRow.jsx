import { useState } from 'react'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { MoreVertical, Mail, Edit, Power, ShieldCheck } from 'lucide-react'
import { EditarUsuarioModal } from '../modals/EditarUsuarioModal'
import { usersAPI } from '@api/endpoints/users'
import { useAuth } from '@hooks/useAuth'
import { PERMISOS } from '@utils/permissions'
import { ROL_CONFIG_SISTEMA } from '../components/rolConfig'
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

export const UsuarioTableRow = ({ usuario, onUpdate }) => {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { can } = useAuth()
  const canManage = can(PERMISOS.GESTIONAR_USUARIOS)

  const handleToggleActivo = async () => {
    setLoading(true)
    try {
      await usersAPI.toggleEstado(usuario.id, { activo: !usuario.activo })
      toast({
        title: usuario.activo ? 'Usuario desactivado' : 'Usuario activado',
        description: usuario.activo
          ? 'El usuario ya no puede acceder al sistema'
          : 'El usuario puede acceder nuevamente'
      })
      onUpdate()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cambiar estado',
        description: error.response?.data?.message || 'Intente nuevamente'
      })
    } finally {
      setLoading(false)
    }
  }

  const initials = `${usuario.nombres?.charAt(0) || ''}${usuario.apellidos?.charAt(0) || ''}`

  return (
    <>
      <tr className={cn(
        'hover:bg-muted/30 transition-colors group',
        !usuario.activo && 'opacity-60'
      )}>
        {/* Usuario */}
        <td className="px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-400 dark:from-indigo-500 dark:to-violet-400 text-white font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className={cn(
                'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card',
                usuario.activo ? 'bg-emerald-500' : 'bg-muted-foreground/40'
              )} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm truncate leading-snug">
                {usuario.nombres} {usuario.apellidos}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{usuario.email}</span>
              </div>
            </div>
          </div>
        </td>

        {/* Roles */}
        <td className="px-6 py-3.5">
          {usuario.roles?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {usuario.roles.map(rol => {
                const cfg = ROL_CONFIG_SISTEMA[rol.codigo] || ROL_CONFIG_SISTEMA.DEFAULT
                return (
                  <Badge
                    key={rol.id}
                    variant="outline"
                    className={cn('text-[10px] h-5 px-1.5 font-medium border', cfg.className)}
                  >
                    {cfg.label}
                  </Badge>
                )
              })}
            </div>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground/60 italic">
              <ShieldCheck className="h-3 w-3" />
              Sin roles
            </span>
          )}
        </td>

        {/* Estado */}
        <td className="px-6 py-3.5">
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] h-5 px-1.5 font-medium border gap-1',
              usuario.activo
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
                : 'bg-muted text-muted-foreground border-border'
            )}
          >
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              usuario.activo ? 'bg-emerald-500' : 'bg-muted-foreground/50'
            )} />
            {usuario.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </td>

        {/* Procesos */}
        <td className="px-6 py-3.5">
          <div className="text-xs space-y-0.5">
            {usuario._count?.procesos > 0 ? (
              <p className="text-muted-foreground tabular-nums">
                <span className="font-medium text-foreground">{usuario._count.procesos}</span> procesos
              </p>
            ) : null}
            {usuario.procesosActivos > 0 ? (
              <p className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                <span className="font-medium">{usuario.procesosActivos}</span> activos
              </p>
            ) : null}
            {!usuario._count?.procesos && !usuario.procesosActivos && (
              <span className="text-muted-foreground/50 italic">—</span>
            )}
          </div>
        </td>

        {/* Acciones */}
        <td className="px-6 py-3.5 text-right">
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={loading}
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleToggleActivo}
                  className={usuario.activo
                    ? 'text-destructive focus:text-destructive focus:bg-destructive/10'
                    : 'text-emerald-600 dark:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-950/40'
                  }
                >
                  <Power className="mr-2 h-3.5 w-3.5" />
                  {usuario.activo ? 'Desactivar' : 'Activar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </td>
      </tr>

      <EditarUsuarioModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        usuario={usuario}
        onSuccess={() => { setEditModalOpen(false); onUpdate() }}
      />
    </>
  )
}