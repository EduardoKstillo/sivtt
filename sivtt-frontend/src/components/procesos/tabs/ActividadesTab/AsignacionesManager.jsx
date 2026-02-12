import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { Alert, AlertDescription } from '@components/ui/alert'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@components/ui/alert-dialog"
import { Plus, UserX, Info } from 'lucide-react'
import { AgregarAsignacionModal } from './modals/AgregarAsignacionModal'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

const ROL_CONFIG = {
  RESPONSABLE: {
    label: 'Responsable',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40',
    avatarGradient: 'from-indigo-500 to-blue-500',
  },
  REVISOR: {
    label: 'Revisor',
    className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/40',
    avatarGradient: 'from-violet-500 to-purple-500',
  },
  PARTICIPANTE: {
    label: 'Participante',
    className: 'bg-muted text-muted-foreground border-border',
    avatarGradient: 'from-slate-400 to-slate-500',
  },
}

export const AsignacionesManager = ({ actividad, proceso, onUpdate }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [loading, setLoading] = useState(false)

  const asignaciones = actividad.asignaciones || []
  const responsables = asignaciones.filter(a => a.rol === 'RESPONSABLE')
  const revisores = asignaciones.filter(a => a.rol === 'REVISOR')
  const participantes = asignaciones.filter(a => a.rol === 'PARTICIPANTE')

  const confirmRemove = async () => {
    if (!userToDelete) return
    setLoading(true)
    try {
      await actividadesAPI.removeUser(actividad.id, userToDelete)
      toast({ title: "Usuario removido" })
      onUpdate()
    } catch (error) {
      toast({ variant: "destructive", title: "Error al remover", description: error.response?.data?.message })
    } finally {
      setLoading(false)
      setUserToDelete(null)
    }
  }

  return (
    <div className="space-y-5 pt-2">
      {/* Info */}
      <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-muted-foreground text-xs">
          Para cambiar el rol de un usuario, primero remuévalo y luego asígnelo con el nuevo rol.
        </AlertDescription>
      </Alert>

      {/* Add button */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setModalOpen(true)}
          className="border-dashed text-primary hover:text-primary hover:border-primary/40 hover:bg-primary/5 gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Asignar Usuario
        </Button>
      </div>

      <div className="space-y-5">
        <RoleSection 
          title="Responsables" subtitle="Ejecución"
          items={responsables} onRemove={setUserToDelete}
          emptyText="Nadie asignado para ejecutar."
        />
        <RoleSection 
          title="Revisores" subtitle="Control de Calidad"
          items={revisores} onRemove={setUserToDelete}
          emptyText="Sin revisores asignados."
        />
        <RoleSection 
          title="Participantes" subtitle="Apoyo"
          items={participantes} onRemove={setUserToDelete}
          emptyText="No hay participantes adicionales."
        />
      </div>

      {/* Modals */}
      <AgregarAsignacionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        actividad={actividad}
        asignacionesActuales={asignaciones}
        onSuccess={() => { setModalOpen(false); onUpdate() }}
      />

      <AlertDialog open={!!userToDelete} onOpenChange={() => !loading && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Remover usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              El usuario perderá acceso a esta actividad y no podrá subir evidencias ni realizar revisiones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); confirmRemove() }} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={loading}
            >
              {loading ? "Removiendo..." : "Sí, remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const RoleSection = ({ title, subtitle, items, onRemove, emptyText }) => (
  <div>
    <div className="flex items-center gap-2 mb-2.5">
      <h4 className="text-xs font-semibold text-foreground">{title}</h4>
      <span className="text-[10px] text-muted-foreground">{subtitle}</span>
      <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-auto tabular-nums">
        {items.length}
      </Badge>
    </div>
    {items.length === 0 ? (
      <div className="text-xs text-muted-foreground/60 italic pl-3 border-l-2 border-border py-1.5">
        {emptyText}
      </div>
    ) : (
      <div className="grid gap-1.5">
        {items.map((asignacion) => (
          <AsignacionCard
            key={asignacion.usuario.id}
            usuario={asignacion.usuario}
            rol={asignacion.rol}
            onRemove={onRemove}
          />
        ))}
      </div>
    )}
  </div>
)

const AsignacionCard = ({ usuario, rol, onRemove }) => {
  const config = ROL_CONFIG[rol] || ROL_CONFIG.PARTICIPANTE
  const initials = `${usuario.nombres?.charAt(0) || ''}${usuario.apellidos?.charAt(0) || ''}`

  return (
    <div className="flex items-center justify-between p-2.5 bg-card border border-border rounded-lg hover:bg-muted/30 transition-colors group">
      <div className="flex items-center gap-2.5">
        <Avatar className="h-7 w-7 border border-border">
          <AvatarFallback className={cn(
            "text-[10px] text-white font-medium bg-gradient-to-br",
            config.avatarGradient
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <span className="text-sm font-medium text-foreground leading-none block">
            {usuario.nombres} {usuario.apellidos}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {usuario.email}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("text-[10px] h-5 border font-medium", config.className)}>
          {config.label}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
          onClick={() => onRemove(usuario.id)}
        >
          <UserX className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}