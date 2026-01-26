import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Plus, Info } from 'lucide-react'
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
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar empresas"
        message="No se pudo cargar la información de las empresas"
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Empresas Vinculadas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona las empresas interesadas en esta patente
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
          Las empresas pueden tener diferentes roles: <strong>Interesada</strong> (en exploración),
          <strong> Aliada</strong> (comprometida con el desarrollo) o <strong>Financiadora</strong> (aporta recursos).
        </AlertDescription>
      </Alert>

      {/* Empresas Activas */}
      <div>
        <h3 className="font-medium text-gray-900 mb-4">
          Empresas Activas ({empresasActivas.length})
        </h3>

        {empresasActivas.length === 0 ? (
          <EmptyState
            title="No hay empresas vinculadas"
            description="Comienza vinculando empresas interesadas en esta tecnología"
            action={() => setVincularModalOpen(true)}
            actionLabel="Vincular primera empresa"
          />
        ) : (
          <div className="space-y-4">
            {empresasActivas.map((empresa) => (
              <EmpresaCard
                key={empresa.empresaId}
                empresa={empresa}
                proceso={proceso}
                onUpdate={refetch}
              />
            ))}
          </div>
        )}
      </div>

      {/* Empresas Retiradas */}
      {empresasRetiradas.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-4">
            Empresas Retiradas ({empresasRetiradas.length})
          </h3>
          <div className="space-y-4 opacity-60">
            {empresasRetiradas.map((empresa) => (
              <EmpresaCard
                key={empresa.empresaId}
                empresa={empresa}
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
        }}
      />
    </div>
  )
}