import { useState } from 'react'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@components/ui/alert-dialog'
import { Mail, Calendar, UserX } from 'lucide-react'
import { equiposAPI } from '@api/endpoints/equipos'
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

/**
 * Config visual por rol.codigo (ámbito PROCESO).
 *
 * ⚠️  OBSERVADOR_PROCESO — no OBSERVADOR (seed actualizado).
 */
const ROL_CONFIG = {
  RESPONSABLE_PROCESO: {
    label:          'Responsable',
    className:      'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/30',
    avatarGradient: 'from-primary to-indigo-500 dark:from-indigo-500 dark:to-violet-500',
  },
  APOYO: {
    label:          'Apoyo',
    className:      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/40',
    avatarGradient: 'from-violet-500 to-purple-500',
  },
  OBSERVADOR_PROCESO: {
    label:          'Observador',
    className:      'bg-muted text-muted-foreground border-border',
    avatarGradient: 'from-slate-400 to-slate-500',
  },
}

const DEFAULT_CONFIG = {
  label:          'Miembro',
  className:      'bg-muted text-muted-foreground border-border',
  avatarGradient: 'from-slate-400 to-slate-500',
}

export const MiembroEquipoCard = ({ miembro, proceso, canEdit, onUpdate }) => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading]         = useState(false)

  // ✅ miembro llega normalizado desde useEquipo:
  //    { usuarioId, usuario: { id, nombres, apellidos, email }, rol: { id, codigo, nombre } }
  const cfg      = ROL_CONFIG[miembro.rol?.codigo] || DEFAULT_CONFIG
  const nombres  = miembro.usuario?.nombres  || ''
  const apellidos = miembro.usuario?.apellidos || ''
  const fullName = `${nombres} ${apellidos}`.trim() || 'Usuario desconocido'
  const initials = `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase()

  const handleRemove = async () => {
    setLoading(true)
    try {
      await equiposAPI.removeMiembro(proceso.id, miembro.usuarioId)
      toast({ title: 'Miembro removido del equipo' })
      onUpdate()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al remover',
        description: error.response?.data?.message || 'Intente nuevamente'
      })
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-3.5 bg-card border border-border rounded-lg hover:bg-muted/20 transition-colors group">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <Avatar className="h-9 w-9 shrink-0 border border-border">
            <AvatarFallback className={cn(
              'text-xs text-white font-semibold bg-gradient-to-br',
              cfg.avatarGradient
            )}>
              {initials || '?'}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground leading-snug">
                {fullName}
              </span>
              <Badge
                variant="outline"
                className={cn('text-[10px] h-5 px-1.5 font-medium border shrink-0', cfg.className)}
              >
                {/* Preferimos rol.nombre del backend si existe, sino el label mapeado */}
                {miembro.rol?.nombre || cfg.label}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {miembro.usuario?.email && (
                <a
                  href={`mailto:${miembro.usuario.email}`}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[200px]">{miembro.usuario.email}</span>
                </a>
              )}
              {miembro.asignadoAt && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                  <Calendar className="h-3 w-3 shrink-0" />
                  Desde {formatDate(miembro.asignadoAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Botón remover — solo si canEdit (calculado en EquipoTab, no repetimos hook) */}
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            disabled={loading}
            onClick={() => setConfirmOpen(true)}
            className="h-7 w-7 text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 ml-2"
          >
            <UserX className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Confirm dialog — reemplaza confirm() nativo */}
      <AlertDialog open={confirmOpen} onOpenChange={open => !loading && setConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Remover a {fullName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Perderá su acceso al proceso y dejará de figurar en el equipo.
              Puedes volver a asignarlo en cualquier momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => { e.preventDefault(); handleRemove() }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={loading}
            >
              {loading ? 'Removiendo...' : 'Sí, remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}