import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Plus, UserX, Info } from 'lucide-react'
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
  const [removing, setRemoving] = useState(null)

  // ✅ CORRECCIÓN: Filtrar desde el array 'asignaciones' que devuelve getById
  const asignaciones = actividad.asignaciones || []
  
  const responsables = asignaciones.filter(a => a.rol === 'RESPONSABLE')
  const revisores = asignaciones.filter(a => a.rol === 'REVISOR')
  const participantes = asignaciones.filter(a => a.rol === 'PARTICIPANTE')

  const handleRemove = async (usuarioId) => {
    setRemoving(usuarioId)
    try {
      await actividadesAPI.removeUser(actividad.id, usuarioId)
      toast({ title: "Usuario removido de la actividad" })
      onUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al remover",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200 text-blue-900">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          <strong>Importante:</strong> Un usuario no puede ser responsable y revisor al mismo tiempo.
        </AlertDescription>
      </Alert>

      {/* Botón Principal de Agregar */}
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Asignar Usuario
        </Button>
      </div>

      <div className="space-y-6">
        {/* Responsables */}
        <RoleSection 
            title="Responsables" 
            items={responsables} 
            onRemove={handleRemove} 
            removing={removing} 
            emptyText="Sin responsables asignados"
        />

        {/* Revisores */}
        <RoleSection 
            title="Revisores" 
            items={revisores} 
            onRemove={handleRemove} 
            removing={removing} 
            emptyText="Sin revisores asignados"
        />

        {/* Participantes */}
        <RoleSection 
            title="Participantes" 
            items={participantes} 
            onRemove={handleRemove} 
            removing={removing} 
            emptyText="Sin participantes adicionales"
        />
      </div>

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
    </div>
  )
}

// Componente auxiliar para secciones
const RoleSection = ({ title, items, onRemove, removing, emptyText }) => (
    <div>
        <h4 className="font-medium text-gray-900 text-sm mb-3 uppercase tracking-wide text-gray-500">
            {title} ({items.length})
        </h4>
        {items.length === 0 ? (
            <div className="text-sm text-gray-400 italic pl-2 border-l-2 border-gray-100">
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
                        removing={removing === asignacion.usuario.id}
                    />
                ))}
            </div>
        )}
    </div>
)

// Tarjeta individual
const AsignacionCard = ({ usuario, rol, onRemove, removing }) => {
  const rolConfig = ROL_BADGES[rol]
  const initials = `${usuario.nombres?.charAt(0) || ''}${usuario.apellidos?.charAt(0) || ''}`

  return (
    <div className="flex items-center justify-between p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 bg-gray-100 border border-gray-200">
          <AvatarFallback className="text-xs text-gray-600 font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm text-gray-900">
            {usuario.nombres} {usuario.apellidos}
          </p>
          <p className="text-xs text-gray-500">
            {usuario.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`text-[10px] h-5 ${rolConfig.color} border-0`}>
          {rolConfig.label}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
          onClick={() => onRemove(usuario.id)}
          disabled={removing}
        >
          <UserX className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}