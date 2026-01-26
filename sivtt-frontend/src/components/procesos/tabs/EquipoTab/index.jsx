import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Plus, Users, Info } from 'lucide-react'
import { MiembroEquipoCard } from './MiembroEquipoCard'
import { GestionarEquipoModal } from './modals/GestionarEquipoModal'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { EmptyState } from '@components/common/EmptyState'
import { useEquipo } from '@hooks/useEquipo'

export const EquipoTab = ({ proceso }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const {
    equipo,
    loading,
    error,
    refetch
  } = useEquipo(proceso.id)

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar equipo"
        message="No se pudo cargar la información del equipo"
        onRetry={refetch}
      />
    )
  }

  // Agrupar por rol
  const responsables = equipo.filter(m => m.rolProceso === 'RESPONSABLE_PROCESO')
  const apoyos = equipo.filter(m => m.rolProceso === 'APOYO')
  const observadores = equipo.filter(m => m.rolProceso === 'OBSERVADOR')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Equipo del Proceso
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los miembros que participan en este proceso
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Miembro
        </Button>
      </div>

      {/* Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          El equipo del proceso incluye al responsable principal, personal de apoyo y observadores.
          Los roles determinan los permisos y responsabilidades de cada miembro.
        </AlertDescription>
      </Alert>

      {/* Team Stats */}
      {equipo.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  Miembros del Equipo
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {equipo.length}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-blue-700">
              <p>{responsables.length} Responsable{responsables.length !== 1 ? 's' : ''}</p>
              <p>{apoyos.length} Apoyo{apoyos.length !== 1 ? 's' : ''}</p>
              <p>{observadores.length} Observador{observadores.length !== 1 ? 'es' : ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Equipo List */}
      {equipo.length === 0 ? (
        <EmptyState
          title="No hay miembros en el equipo"
          description="Comienza agregando miembros al equipo del proceso"
          action={() => setModalOpen(true)}
          actionLabel="Agregar primer miembro"
        />
      ) : (
        <div className="space-y-6">
          {/* Responsables */}
          {responsables.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Responsables ({responsables.length})
              </h3>
              <div className="space-y-3">
                {responsables.map((miembro) => (
                  <MiembroEquipoCard
                    key={miembro.usuarioId}
                    miembro={miembro}
                    proceso={proceso}
                    onUpdate={refetch}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Apoyo */}
          {apoyos.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Personal de Apoyo ({apoyos.length})
              </h3>
              <div className="space-y-3">
                {apoyos.map((miembro) => (
                  <MiembroEquipoCard
                    key={miembro.usuarioId}
                    miembro={miembro}
                    proceso={proceso}
                    onUpdate={refetch}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Observadores */}
          {observadores.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Observadores ({observadores.length})
              </h3>
              <div className="space-y-3">
                {observadores.map((miembro) => (
                  <MiembroEquipoCard
                    key={miembro.usuarioId}
                    miembro={miembro}
                    proceso={proceso}
                    onUpdate={refetch}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <GestionarEquipoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        proceso={proceso}
        equipoActual={equipo}
        onSuccess={() => {
          setModalOpen(false)
          refetch()
        }}
      />
    </div>
  )
}