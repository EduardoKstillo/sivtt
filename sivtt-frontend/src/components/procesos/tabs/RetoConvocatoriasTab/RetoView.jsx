import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Edit, Building2, MapPin, Users, DollarSign, Calendar, Info } from 'lucide-react'
import { EditarRetoModal } from './modals/EditarRetoModal'
import { useReto } from '@hooks/useReto'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { formatDate, formatCurrency } from '@utils/formatters'

export const RetoView = ({ proceso, onUpdate }) => {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const { reto, loading, refetch } = useReto(proceso.id)

  if (loading) {
    return <LoadingSpinner />
  }

  if (!reto) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No se encontró información del reto empresarial
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Descripción del Reto
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditModalOpen(true)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar Reto
        </Button>
      </div>

      {/* Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Empresa Solicitante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {reto.empresa?.nombre?.charAt(0) || 'E'}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                {reto.empresa?.nombre}
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>RUC: {reto.empresa?.ruc}</span>
                </div>
                {reto.empresa?.sector && (
                  <div className="flex items-center gap-2">
                    <span>Sector: {reto.empresa.sector}</span>
                  </div>
                )}
                {reto.empresa?.ubicacion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{reto.empresa.ubicacion}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Descripción del Reto */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Descripción del Problema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {reto.descripcion}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alcance */}
        {reto.alcance && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alcance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {reto.alcance}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Requisitos */}
        {reto.requisitos && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Requisitos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {reto.requisitos}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recursos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recursos Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reto.presupuestoEstimado && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Presupuesto Estimado</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(reto.presupuestoEstimado)}
                  </p>
                </div>
              </div>
            )}

            {reto.duracionEstimada && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duración Estimada</p>
                  <p className="font-semibold text-gray-900">
                    {reto.duracionEstimada} meses
                  </p>
                </div>
              </div>
            )}

            {reto.equipoDisponible && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Equipo Disponible</p>
                  <p className="font-semibold text-gray-900">
                    {reto.equipoDisponible}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados Esperados */}
      {reto.resultadosEsperados && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultados Esperados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {reto.resultadosEsperados}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <EditarRetoModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        reto={reto}
        proceso={proceso}
        onSuccess={() => {
          setEditModalOpen(false)
          refetch()
        }}
      />
    </div>
  )
}