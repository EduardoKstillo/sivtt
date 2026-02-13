import { useState } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { 
  Building2, 
  DollarSign, 
  Calendar, 
  Users,
  FileText,
  Edit,
  Plus
} from 'lucide-react'
import { CrearRetoModal } from './modals/CrearRetoModal'
import { EditarRetoModal } from './modals/EditarRetoModal'
import { EmptyState } from '@components/common/EmptyState'
import { formatCurrency } from '@utils/formatters'

export const RetoView = ({ reto, retoExists, proceso, onRetoCreated, onRetoUpdated }) => {
  const [crearModalOpen, setCrearModalOpen] = useState(false)
  const [editarModalOpen, setEditarModalOpen] = useState(false)

  // Si no existe el reto, mostrar opción para crearlo
  if (!retoExists) {
    return (
      <>
        <EmptyState
          title="No hay reto registrado"
          description="Crea el reto empresarial para este proceso de requerimiento"
          action={() => setCrearModalOpen(true)}
          actionLabel="Crear Reto Empresarial"
          icon={FileText}
        />

        <CrearRetoModal
          open={crearModalOpen}
          onOpenChange={setCrearModalOpen}
          proceso={proceso}
          onSuccess={() => {
            setCrearModalOpen(false)
            onRetoCreated()
          }}
        />
      </>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Información del Reto
          </h3>
          <Button
            onClick={() => setEditarModalOpen(true)}
            variant="outline"
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Reto
          </Button>
        </div>

        {/* Empresa Solicitante */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Empresa Solicitante</p>
                <h4 className="text-lg font-semibold text-gray-900">
                  {reto.empresaSolicitante}
                </h4>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Descripción del Problema */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              Descripción del Problema
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap">
              {reto.descripcionProblema}
            </p>
          </CardContent>
        </Card>

        {/* Detalles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reto.alcance && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Alcance del Proyecto
                </h4>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {reto.alcance}
                </p>
              </CardContent>
            </Card>
          )}

          {reto.requisitos && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Requisitos Técnicos
                </h4>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {reto.requisitos}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recursos Disponibles */}
        {(reto.presupuestoEstimado || reto.duracionEstimada || reto.equipoDisponible) && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Recursos Disponibles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reto.presupuestoEstimado && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-700 font-medium">Presupuesto</p>
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(reto.presupuestoEstimado)}
                      </p>
                    </div>
                  </div>
                )}

                {reto.duracionEstimada && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Duración</p>
                      <p className="text-lg font-bold text-blue-900">
                        {reto.duracionEstimada} meses
                      </p>
                    </div>
                  </div>
                )}

                {reto.equipoDisponible && (
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Equipo</p>
                      <p className="text-sm font-medium text-purple-900">
                        {reto.equipoDisponible}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultados Esperados */}
        {reto.resultadosEsperados && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Resultados Esperados
              </h4>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {reto.resultadosEsperados}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Editar */}
      <EditarRetoModal
        open={editarModalOpen}
        onOpenChange={setEditarModalOpen}
        reto={reto}
        proceso={proceso}
        onSuccess={() => {
          setEditarModalOpen(false)
          onRetoUpdated()
        }}
      />
    </>
  )
}