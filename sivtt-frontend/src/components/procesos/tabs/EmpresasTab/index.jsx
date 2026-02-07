import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Plus, Info, Building2 } from 'lucide-react'

import { EmpresaCard } from './EmpresaCard'
import { VincularEmpresaModal } from './modals/VincularEmpresaModal'

import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { EmptyState } from '@components/common/EmptyState'

import { useEmpresasProceso } from '@hooks/useEmpresasProceso'

export const EmpresasTab = ({ proceso, onUpdate }) => {
  const [vincularModalOpen, setVincularModalOpen] = useState(false)

  const {
    empresasActivas,
    empresasRetiradas,
    loading,
    error,
    refetch
  } = useEmpresasProceso(proceso.id)

  if (loading) {
    return (
      <div className="py-10">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar empresas"
        message="No se pudo cargar la información de las empresas vinculadas"
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="space-y-6 fade-in animate-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Empresas Vinculadas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de aliados estratégicos y financiamiento
          </p>
        </div>

        <Button
          onClick={() => setVincularModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Vincular Empresa
        </Button>
      </div>

      {/* Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          Define el rol de cada empresa:
          <strong> Interesada</strong> (exploración),
          <strong> Aliada</strong> (compromiso técnico) o
          <strong> Financiadora</strong> (aporta recursos).
        </AlertDescription>
      </Alert>

      {/* Empresas Activas */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          Activas
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
            {empresasActivas.length}
          </span>
        </h3>

        {empresasActivas.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No hay empresas vinculadas"
            description="Vincular empresas aumenta la viabilidad de la transferencia tecnológica."
            action={() => setVincularModalOpen(true)}
            actionLabel="Vincular primera empresa"
          />
        ) : (
          <div className="space-y-4">
            {empresasActivas.map((vinculacion) => (
              <EmpresaCard
                key={vinculacion.id}              // ✅ ID de ProcesoEmpresa
                vinculacion={vinculacion}         // ✅ Objeto correcto
                proceso={proceso}
                onUpdate={() => {
                  refetch()
                  onUpdate?.()                    // ✅ refresca contadores del proceso
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Empresas Retiradas / Inactivas */}
      {empresasRetiradas.length > 0 && (
        <div className="pt-6 border-t">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            Historial de Retiros
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {empresasRetiradas.length}
            </span>
          </h3>

          <div className="space-y-4 opacity-70 hover:opacity-100 transition-opacity">
            {empresasRetiradas.map((vinculacion) => (
              <EmpresaCard
                key={vinculacion.id}
                vinculacion={vinculacion}
                proceso={proceso}
                onUpdate={refetch}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <VincularEmpresaModal
        open={vincularModalOpen}
        onOpenChange={setVincularModalOpen}
        proceso={proceso}
        onSuccess={() => {
          setVincularModalOpen(false)
          refetch()
          onUpdate?.()
        }}
      />
    </div>
  )
}
