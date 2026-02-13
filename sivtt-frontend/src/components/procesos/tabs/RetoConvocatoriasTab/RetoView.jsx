// src/components/procesos/tabs/RetoConvocatoriasTab/RetoView.jsx

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
  Plus,
  Lock,
  AlertTriangle,
  Target
} from 'lucide-react'
import { CrearRetoModal } from './modals/CrearRetoModal'
import { EditarRetoModal } from './modals/EditarRetoModal'
import { EmptyState } from '@components/common/EmptyState'
import { formatCurrency } from '@utils/formatters'

const CONFIDENCIALIDAD_CONFIG = {
  PUBLICO: { label: 'Público', color: 'bg-green-100 text-green-700', icon: '🌍' },
  RESTRINGIDO: { label: 'Restringido', color: 'bg-yellow-100 text-yellow-700', icon: '🔒' },
  CONFIDENCIAL: { label: 'Confidencial', color: 'bg-red-100 text-red-700', icon: '🔐' }
}

const PRIORIDAD_CONFIG = {
  1: { label: 'Muy Baja', color: 'bg-gray-100 text-gray-700' },
  2: { label: 'Baja', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'Media', color: 'bg-yellow-100 text-yellow-700' },
  4: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  5: { label: 'Muy Alta', color: 'bg-red-100 text-red-700' }
}

export const RetoView = ({ reto, retoExists, proceso, onRetoCreated, onRetoUpdated }) => {
  const [crearModalOpen, setCrearModalOpen] = useState(false)
  const [editarModalOpen, setEditarModalOpen] = useState(false)

  if (!retoExists) {
    return (
      <>
        <EmptyState
          title="No hay reto registrado"
          description="Crea el reto tecnológico para este proceso de requerimiento"
          action={() => setCrearModalOpen(true)}
          actionLabel="Crear Reto Tecnológico"
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

  const confidencialidad = CONFIDENCIALIDAD_CONFIG[reto.nivelConfidencialidad] || CONFIDENCIALIDAD_CONFIG.PUBLICO
  const prioridad = PRIORIDAD_CONFIG[reto.prioridad] || PRIORIDAD_CONFIG[3]

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {reto.titulo}
            </h3>
            <Badge className={confidencialidad.color}>
              {confidencialidad.icon} {confidencialidad.label}
            </Badge>
            <Badge className={prioridad.color}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              Prioridad {reto.prioridad}
            </Badge>
          </div>
          <Button
            onClick={() => setEditarModalOpen(true)}
            variant="outline"
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Reto
          </Button>
        </div>

        {/* Descripción */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              Descripción General
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap">
              {reto.descripcion}
            </p>
          </CardContent>
        </Card>

        {/* Problema */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Problema a Resolver
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap">
              {reto.problema}
            </p>
          </CardContent>
        </Card>

        {/* Objetivos */}
        {reto.objetivos && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Objetivos
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">
                {reto.objetivos}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ficha Técnica */}
        {reto.fichaTecnica && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Ficha Técnica
              </h4>

              {reto.fichaTecnica.empresaSolicitante && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Empresa Solicitante</p>
                    <h5 className="text-lg font-semibold text-gray-900">
                      {reto.fichaTecnica.empresaSolicitante}
                    </h5>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reto.fichaTecnica.presupuestoEstimado && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-700 font-medium">Presupuesto</p>
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(reto.fichaTecnica.presupuestoEstimado)}
                      </p>
                    </div>
                  </div>
                )}

                {reto.fichaTecnica.duracionEstimada && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Duración</p>
                      <p className="text-lg font-bold text-blue-900">
                        {reto.fichaTecnica.duracionEstimada} meses
                      </p>
                    </div>
                  </div>
                )}

                {reto.timelineEstimado && (
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Timeline</p>
                      <p className="text-lg font-bold text-purple-900">
                        {reto.timelineEstimado} días
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {reto.fichaTecnica.equipoDisponible && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Equipo Disponible:</span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {reto.fichaTecnica.equipoDisponible}
                  </p>
                </div>
              )}
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
              <p className="text-gray-700 whitespace-pre-wrap">
                {reto.resultadosEsperados}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Restricciones */}
        {reto.restricciones && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Restricciones
              </h4>
              <p className="text-orange-800 whitespace-pre-wrap">
                {reto.restricciones}
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