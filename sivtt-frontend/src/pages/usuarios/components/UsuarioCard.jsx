import { useState } from 'react'
import { Card, CardContent } from '@components/ui/card'
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

export const UsuarioCard = ({ usuario, onUpdate }) => {
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
      <Card className={cn(
        'group relative overflow-hidden transition-all hover:shadow-md',
        !usuario.activo && 'opacity-60'
      )}>
        {/* Status accent */}
        <div className={cn(
          'h-0.5 w-full',
          usuario.activo ? 'bg-primary' : 'bg-muted-foreground/30'
        )} />

        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-400 dark:from-indigo-500 dark:to-violet-400 text-white font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Active dot */}
              <span className={cn(
                'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card',
                usuario.activo ? 'bg-emerald-500' : 'bg-muted-foreground/50'
              )} />
            </div>

            {/* Actions */}
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
          </div>

          {/* Name + email */}
          <div className="mb-3">
            <h3 className="font-semibold text-foreground leading-snug line-clamp-1">
              {usuario.nombres} {usuario.apellidos}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{usuario.email}</span>
            </div>
          </div>

          {/* Roles */}
          {usuario.roles?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-3">
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
            <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground/60 italic">
              <ShieldCheck className="h-3 w-3" />
              Sin roles asignados
            </div>
          )}

          {/* Procesos footer */}
          {(usuario._count?.procesos > 0 || usuario.procesosActivos > 0) && (
            <div className="pt-3 border-t border-border flex items-center gap-3 text-xs text-muted-foreground">
              {usuario._count?.procesos > 0 && (
                <span className="tabular-nums">
                  <span className="font-medium text-foreground">{usuario._count.procesos}</span> procesos
                </span>
              )}
              {usuario.procesosActivos > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                  <span className="font-medium">{usuario.procesosActivos}</span> activos
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <EditarUsuarioModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        usuario={usuario}
        onSuccess={() => { setEditModalOpen(false); onUpdate() }}
      />
    </>
  )
}