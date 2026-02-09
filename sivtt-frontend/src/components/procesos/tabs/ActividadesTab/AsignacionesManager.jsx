import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { Alert, AlertDescription } from '@components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog"
import { Plus, UserX, Info, ShieldAlert } from 'lucide-react'
import { AgregarAsignacionModal } from './modals/AgregarAsignacionModal'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from '@components/ui/use-toast'

const ROL_BADGES = {
  RESPONSABLE: { label: 'Responsable', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  REVISOR: { label: 'Revisor', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  PARTICIPANTE: { label: 'Participante', color: 'bg-gray-100 text-gray-700 border-gray-200' }
}

export const AsignacionesManager = ({ actividad, proceso, onUpdate }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null) // ID del usuario a eliminar
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
      toast({ title: "Usuario removido", description: "El acceso del usuario ha sido revocado." })
      onUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al remover",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
      setUserToDelete(null)
    }
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Reglas de Negocio */}
      <Alert className="bg-blue-50 border-blue-200 text-blue-900">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-xs">
          <strong>Regla:</strong> Para cambiar el rol de un usuario, primero debes removerlo y luego asignarlo nuevamente con el nuevo rol.
        </AlertDescription>
      </Alert>

      {/* Botón Principal */}
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setModalOpen(true)} className="border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Asignar Usuario
        </Button>
      </div>

      <div className="space-y-6">
        <RoleSection 
            title="Responsables (Ejecución)" 
            items={responsables} 
            onRemove={setUserToDelete} 
            emptyText="Nadie asignado para ejecutar esta actividad."
        />
        <RoleSection 
            title="Revisores (Control de Calidad)" 
            items={revisores} 
            onRemove={setUserToDelete} 
            emptyText="Sin revisores. La actividad podría aprobarse automáticamente."
        />
        <RoleSection 
            title="Participantes (Apoyo)" 
            items={participantes} 
            onRemove={setUserToDelete} 
            emptyText="No hay participantes adicionales."
        />
      </div>

      {/* Modals */}
      <AgregarAsignacionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        actividad={actividad}
        asignacionesActuales={asignaciones}
        onSuccess={() => {
          setModalOpen(false)
          onUpdate()
        }}
      />

      {/* Confirmación de Eliminación */}
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
                onClick={(e) => { e.preventDefault(); confirmRemove(); }} 
                className="bg-red-600 hover:bg-red-700"
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

const RoleSection = ({ title, items, onRemove, emptyText }) => (
    <div>
        <h4 className="font-medium text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            {title} <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{items.length}</Badge>
        </h4>
        {items.length === 0 ? (
            <div className="text-sm text-gray-400 italic pl-3 border-l-2 border-gray-100 py-1">
                {emptyText}
            </div>
        ) : (
            <div className="grid gap-2">
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
  const rolConfig = ROL_BADGES[rol] || ROL_BADGES.PARTICIPANTE
  const initials = `${usuario.nombres?.charAt(0) || ''}${usuario.apellidos?.charAt(0) || ''}`

  return (
    <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all group shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 bg-gray-50 border border-gray-100">
          <AvatarFallback className="text-xs text-gray-600 font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-sm text-gray-900 leading-none">
            {usuario.nombres} {usuario.apellidos}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {usuario.email}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline" className={`text-[10px] h-5 ${rolConfig.color} border-0 font-medium`}>
          {rolConfig.label}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
          onClick={() => onRemove(usuario.id)}
        >
          <UserX className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}