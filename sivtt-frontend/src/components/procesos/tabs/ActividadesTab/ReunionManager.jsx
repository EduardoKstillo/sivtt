import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Card, CardContent } from '@components/ui/card'
import { Alert, AlertDescription } from '@components/ui/alert'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  CheckCircle2, 
  Users,
  FileText,
  Plus
} from 'lucide-react'
import { CrearReunionModal } from './modals/CrearReunionModal'
import { CompletarReunionModal } from './modals/CompletarReunionModal'
import { AgregarAsignacionModal } from './modals/AgregarAsignacionModal'
import { formatDate, formatDateTime } from '@utils/formatters'
import { reunionesAPI } from '@api/endpoints/reuniones' // Asegúrate de tener este endpoint
import { toast } from '@components/ui/use-toast'

export const ReunionManager = ({ actividad, onUpdate }) => {
  const [crearModalOpen, setCrearModalOpen] = useState(false)
  const [completarModalOpen, setCompletarModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const reunion = actividad.reunion // Viene del include en getById
  const participantes = reunion?.participantes || []

  // Si no hay reunión, mostrar estado vacío
  if (!reunion) {
    return (
      <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-lg bg-gray-50">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <Calendar className="h-6 w-6 text-blue-600" />
        </div>
        <h4 className="text-lg font-medium text-gray-900">No hay reunión programada</h4>
        <p className="text-sm text-gray-500 mb-4 text-center max-w-sm">
          Esta actividad requiere una reunión. Programa la fecha y los detalles para comenzar.
        </p>
        {actividad.estado !== 'APROBADA' && (
          <Button onClick={() => setCrearModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Programar Reunión
          </Button>
        )}
        
        <CrearReunionModal 
          open={crearModalOpen} 
          onOpenChange={setCrearModalOpen}
          actividad={actividad}
          onSuccess={onUpdate}
        />
      </div>
    )
  }

  const isRealizada = reunion.realizada

  return (
    <div className="space-y-6 pt-2">
      {/* Estado de la Reunión */}
      <div className="flex items-center justify-between bg-white p-4 border rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isRealizada ? 'bg-green-100' : 'bg-blue-100'}`}>
            <Calendar className={`h-6 w-6 ${isRealizada ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">
              {isRealizada ? 'Reunión Realizada' : 'Reunión Programada'}
            </h4>
            <p className="text-sm text-gray-500">
              {formatDate(reunion.fechaProgramada)} • {formatDateTime(reunion.fechaProgramada).split(' ')[1]}
            </p>
          </div>
        </div>
        
        {!isRealizada && actividad.estado !== 'APROBADA' && (
          <Button onClick={() => setCompletarModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Marcar como Realizada
          </Button>
        )}
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h5 className="font-medium text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" /> Detalles
            </h5>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="font-medium block text-gray-700">Duración</span>
                  <span className="text-gray-600">{reunion.duracionMinutos} minutos</span>
                </div>
              </div>

              {reunion.lugar && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="font-medium block text-gray-700">Lugar</span>
                    <span className="text-gray-600">{reunion.lugar}</span>
                  </div>
                </div>
              )}

              {(reunion.meetLink || reunion.enlaceVirtual) && (
                <div className="flex items-start gap-3">
                  <Video className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="font-medium block text-gray-700">Enlace Virtual</span>
                    <a 
                      href={reunion.meetLink || reunion.enlaceVirtual} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {reunion.meetLink || reunion.enlaceVirtual}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {reunion.resumen && (
              <div className="mt-4 pt-4 border-t">
                <span className="font-medium block text-gray-700 mb-1">Agenda / Resumen</span>
                <p className="text-sm text-gray-600 whitespace-pre-line">{reunion.resumen}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resultados (Solo si realizada) */}
        {isRealizada && (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6 space-y-4">
              <h5 className="font-medium text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" /> Resultados
              </h5>
              
              {reunion.acuerdos ? (
                <div className="text-sm text-gray-700">
                  <span className="font-medium block mb-2">Acuerdos:</span>
                  <p className="whitespace-pre-line">{reunion.acuerdos}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No se registraron acuerdos específicos.</p>
              )}

              {reunion.fechaRealizacion && (
                <div className="pt-4 mt-2 border-t border-gray-200 text-xs text-gray-500">
                  Realizada el: {formatDateTime(reunion.fechaRealizacion)}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Participantes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-medium text-gray-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" /> Participantes ({participantes.length})
          </h5>
          {!isRealizada && actividad.estado !== 'APROBADA' && (
             <Button variant="outline" size="sm" onClick={() => setInviteModalOpen(true)}>
                <Plus className="h-3 w-3 mr-1" /> Invitar
             </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {participantes.map((p, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
              <div>
                <p className="text-sm font-medium text-gray-900">{p.nombre || p.email}</p>
                <p className="text-xs text-gray-500">{p.email}</p>
              </div>
              {isRealizada ? (
                <Badge variant={p.asistio ? "default" : "secondary"} className={p.asistio ? "bg-green-100 text-green-700" : ""}>
                  {p.asistio ? "Asistió" : "Ausente"}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">Pendiente</Badge>
              )}
            </div>
          ))}
          {participantes.length === 0 && (
            <p className="text-sm text-gray-500 italic col-span-2 text-center py-4">
              No hay participantes registrados.
            </p>
          )}
        </div>
      </div>

      {/* Modales */}
      <CompletarReunionModal 
        open={completarModalOpen} 
        onOpenChange={setCompletarModalOpen}
        reunion={reunion}
        onSuccess={onUpdate}
      />

      {/* Reutilizamos AgregarAsignacionModal pero adaptado si es necesario, 
          o creamos un AgregarParticipanteReunionModal específico si la lógica difiere mucho */}
    </div>
  )
}