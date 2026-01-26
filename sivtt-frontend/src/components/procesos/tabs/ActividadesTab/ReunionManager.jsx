import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Calendar, Clock, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react'
import { CrearReunionModal } from './modals/CrearReunionModal'
import { CompletarReunionModal } from './modals/CompletarReunionModal'
import { formatDateTime } from '@utils/formatters'

export const ReunionManager = ({ actividad, onUpdate }) => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [completeModalOpen, setCompleteModalOpen] = useState(false)

  const reunion = actividad.reunion

  if (!reunion) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta actividad no tiene una reunión asociada. Crea una para programar y gestionar la reunión.
          </AlertDescription>
        </Alert>

        <Button
          onClick={() => setCreateModalOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Crear Reunión
        </Button>

        <CrearReunionModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          actividad={actividad}
          onSuccess={() => {
            setCreateModalOpen(false)
            onUpdate()
          }}
        />
      </div>
    )
  }

  const isCompleted = reunion.completada

  return (
    <div className="space-y-6">
      {/* Estado de la Reunión */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          Información de la Reunión
        </h4>
        <Badge className={isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
          {isCompleted ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completada
            </>
          ) : (
            <>
              <Clock className="h-3 w-3 mr-1" />
              Programada
            </>
          )}
        </Badge>
      </div>

      {/* Detalles */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Fecha y Hora</p>
            <p className="text-sm text-gray-600">
              {formatDateTime(reunion.fechaReunion)}
            </p>
          </div>
        </div>

        {reunion.duracionMinutos && (
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Duración</p>
              <p className="text-sm text-gray-600">
                {reunion.duracionMinutos} minutos
              </p>
            </div>
          </div>
        )}

        {reunion.lugar && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Lugar</p>
              <p className="text-sm text-gray-600">{reunion.lugar}</p>
            </div>
          </div>
        )}

        {reunion.enlaceVirtual && (
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Enlace Virtual</p>
              <a
                href={reunion.enlaceVirtual}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {reunion.enlaceVirtual}
              </a>
            </div>
          </div>
        )}

        {reunion.agenda && (
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Agenda</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {reunion.agenda}
            </p>
          </div>
        )}
      </div>

      {/* Participantes */}
      {reunion.participantes && reunion.participantes.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-3">
            Participantes ({reunion.participantes.length})
          </h5>
          <div className="space-y-2">
            {reunion.participantes.map((participante) => (
              <div
                key={participante.id}
                className="flex items-center justify-between p-2 border border-gray-200 rounded-lg"
              >
                <span className="text-sm text-gray-900">
                  {participante.usuario?.nombre}
                </span>
                {participante.asistio !== null && (
                  <Badge variant={participante.asistio ? 'default' : 'secondary'}>
                    {participante.asistio ? '✓ Asistió' : '✗ No asistió'}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados (si está completada) */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-green-900 mb-2">
            Resultados de la Reunión
          </h5>
          {reunion.acuerdos && (
            <div className="mb-3">
              <p className="text-xs font-medium text-green-800 mb-1">Acuerdos:</p>
              <p className="text-sm text-green-900 whitespace-pre-wrap">
                {reunion.acuerdos}
              </p>
            </div>
          )}
          {reunion.observaciones && (
            <div>
              <p className="text-xs font-medium text-green-800 mb-1">Observaciones:</p>
              <p className="text-sm text-green-900 whitespace-pre-wrap">
                {reunion.observaciones}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Acciones */}
      {!isCompleted && (
        <Button
          onClick={() => setCompleteModalOpen(true)}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Completar Reunión
        </Button>
      )}

      {/* Modals */}
      <CompletarReunionModal
        open={completeModalOpen}
        onOpenChange={setCompleteModalOpen}
        reunion={reunion}
        onSuccess={() => {
          setCompleteModalOpen(false)
          onUpdate()
        }}
      />
    </div>
  )
}