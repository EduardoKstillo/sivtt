import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Plus, DollarSign, Info, TrendingUp } from 'lucide-react'
import { FinanciamientoCard } from './FinanciamientoCard'
import { RegistrarFinanciamientoModal } from './modals/RegistrarFinanciamientoModal'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { EmptyState } from '@components/common/EmptyState'
import { useFinanciamientos } from '@hooks/useFinanciamientos'
import { formatCurrency } from '@utils/formatters'

export const FinanciamientosTab = ({ proceso }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const {
    financiamientos,
    totalFinanciamiento,
    loading,
    error,
    refetch
  } = useFinanciamientos(proceso.id)

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar financiamientos"
        message="No se pudo cargar la información de financiamientos"
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
            Financiamientos
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los fondos y recursos económicos del proceso
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar Financiamiento
        </Button>
      </div>

      {/* Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          Registra todas las fuentes de financiamiento del proceso: fondos institucionales,
          aportes empresariales, grants externos, etc.
        </AlertDescription>
      </Alert>

      {/* Total Summary */}
      {financiamientos.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">
                  Financiamiento Total
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {formatCurrency(totalFinanciamiento)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">
                {financiamientos.length} fuente{financiamientos.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Financiamientos List */}
      {financiamientos.length === 0 ? (
        <EmptyState
          title="No hay financiamientos registrados"
          description="Comienza registrando la primera fuente de financiamiento"
          action={() => setModalOpen(true)}
          actionLabel="Registrar financiamiento"
        />
      ) : (
        <div className="space-y-4">
          {financiamientos.map((financiamiento) => (
            <FinanciamientoCard
              key={financiamiento.id}
              financiamiento={financiamiento}
              proceso={proceso}
              onUpdate={refetch}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <RegistrarFinanciamientoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        proceso={proceso}
        onSuccess={() => {
          setModalOpen(false)
          refetch()
        }}
      />
    </div>
  )
}