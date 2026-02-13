import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Card, CardContent } from '@components/ui/card'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import {
  CheckCircle2,
  XCircle,
  MoreVertical,
  Star,
  Award,
  FileText,
  Calendar,
  TrendingUp,
  Clock // Agregado Clock para pendientes
} from 'lucide-react'
import { EvaluarPostulacionModal } from './modals/EvaluarPostulacionModal'
import { SeleccionarGanadorModal } from './modals/SeleccionarGanadorModal'
import { RechazarPostulacionModal } from './modals/RechazarPostulacionModal'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { EmptyState } from '@components/common/EmptyState'
import { usePostulaciones } from '@hooks/usePostulaciones'
import { formatDate } from '@utils/formatters'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Info } from 'lucide-react'

export const PostulacionesList = ({ convocatoria, proceso, onUpdate }) => {
  const { postulaciones, estadisticas, loading, refetch } = usePostulaciones(convocatoria.id)
  const [evaluarModalOpen, setEvaluarModalOpen] = useState(false)
  const [seleccionarModalOpen, setSeleccionarModalOpen] = useState(false)
  const [rechazarModalOpen, setRechazarModalOpen] = useState(false)
  const [selectedPostulacion, setSelectedPostulacion] = useState(null)

  const handleEvaluar = (postulacion) => {
    setSelectedPostulacion(postulacion)
    setEvaluarModalOpen(true)
  }

  const handleSeleccionar = (postulacion) => {
    setSelectedPostulacion(postulacion)
    setSeleccionarModalOpen(true)
  }

  const handleRechazar = (postulacion) => {
    setSelectedPostulacion(postulacion)
    setRechazarModalOpen(true)
  }

  const handleSuccess = () => {
    refetch()
    onUpdate()
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const postulacionSeleccionada = postulaciones.find(p => p.seleccionado)

  // Cálculo de pendientes
  const pendientesEvaluar = estadisticas ? (estadisticas.total - estadisticas.seleccionadas - estadisticas.rechazadas) : 0

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {estadisticas.total}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                {/* ✅ CORRECCIÓN: Etiqueta correcta (Pendientes) */}
                <div>
                  <p className="text-sm text-gray-500">Pendientes</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {pendientesEvaluar}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Seleccionadas</p>
                  <p className="text-2xl font-bold text-green-900">
                    {estadisticas.seleccionadas}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Promedio</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {estadisticas.puntajePromedio.toFixed(1)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ganador Seleccionado */}
      {postulacionSeleccionada && (
        <Alert className="bg-green-50 border-green-200">
          <Award className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            <strong>Grupo seleccionado:</strong> {postulacionSeleccionada.grupo.nombre} 
            {postulacionSeleccionada.puntajeTotal && (
              <span> - Puntaje: {postulacionSeleccionada.puntajeTotal}/100</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Info sobre evaluación */}
      {convocatoria.estatus === 'CERRADA' && !postulacionSeleccionada && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 text-sm">
            La convocatoria está cerrada. Evalúa las postulaciones y selecciona al grupo ganador.
            El puntaje mínimo requerido es: <strong>{convocatoria.criteriosSeleccion?.puntajeMinimo || 60}/100</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Postulaciones */}
      {postulaciones.length === 0 ? (
        <EmptyState
          title="No hay postulaciones"
          description="Aún no hay grupos que hayan postulado a esta convocatoria"
        />
      ) : (
        <div className="space-y-4">
          {postulaciones.map((postulacion) => (
            <Card 
              key={postulacion.id}
              className={`hover:shadow-md transition-shadow ${
                postulacion.seleccionado ? 'border-green-300 bg-green-50' : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xl font-bold">
                      {postulacion.grupo.nombre.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {postulacion.grupo.nombre}
                          </h4>
                          {postulacion.seleccionado && (
                            <Badge className="bg-green-100 text-green-700">
                              <Award className="h-3 w-3 mr-1" />
                              Seleccionado
                            </Badge>
                          )}
                          {/* Mostrar badge de evaluada o rechazada */}
                          {postulacion.fechaEvaluacion && !postulacion.seleccionado && !postulacion.motivoRechazo && (
                            <Badge className="bg-blue-100 text-blue-700">
                              ✅ Evaluada
                            </Badge>
                          )}
                          {postulacion.motivoRechazo && (
                            <Badge variant="destructive">
                              Rechazada
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {postulacion.grupo.codigo} • {postulacion.grupo.facultad}
                        </p>
                      </div>

                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {!postulacion.fechaEvaluacion && !postulacion.motivoRechazo && (
                            <>
                              <DropdownMenuItem onClick={() => handleEvaluar(postulacion)}>
                                <Star className="mr-2 h-4 w-4" />
                                Evaluar postulación
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}

                          {/* Opciones cuando está cerrada y evaluada */}
                          {postulacion.fechaEvaluacion && !postulacion.seleccionado && !postulacion.motivoRechazo && convocatoria.estatus === 'CERRADA' && (
                            <>
                              <DropdownMenuItem onClick={() => handleEvaluar(postulacion)}>
                                <Star className="mr-2 h-4 w-4" />
                                Re-evaluar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSeleccionar(postulacion)}>
                                <Award className="mr-2 h-4 w-4" />
                                Seleccionar como ganador
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}

                          {!postulacion.seleccionado && !postulacion.motivoRechazo && (
                            <DropdownMenuItem 
                              onClick={() => handleRechazar(postulacion)}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Rechazar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Coordinador */}
                    <p className="text-sm text-gray-600 mb-3">
                      👤 Coordinador: {postulacion.grupo.coordinador}
                    </p>

                    {/* Nota de Interés */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Nota de Interés:</p>
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {postulacion.notaInteres}
                      </p>
                    </div>

                    {/* Puntaje y Evaluación */}
                    {postulacion.fechaEvaluacion && (
                      <div className="flex items-center gap-6 p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="text-xs text-blue-700 mb-1">Puntaje Total</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {postulacion.puntajeTotal}/100
                          </p>
                        </div>

                        {postulacion.puntajesDetalle && (
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                            {Object.entries(postulacion.puntajesDetalle).map(([key, value]) => (
                              <div key={key}>
                                <p className="text-blue-600 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="font-semibold text-blue-900">{value}/100</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Observaciones */}
                    {postulacion.observaciones && (
                      <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400">
                        <p className="text-xs font-medium text-yellow-800">Observaciones:</p>
                        <p className="text-sm text-yellow-900">{postulacion.observaciones}</p>
                      </div>
                    )}

                    {/* Motivo Rechazo */}
                    {postulacion.motivoRechazo && (
                      <div className="mt-3 p-2 bg-red-50 border-l-4 border-red-400">
                        <p className="text-xs font-medium text-red-800">Motivo de Rechazo:</p>
                        <p className="text-sm text-red-900">{postulacion.motivoRechazo}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Postulado: {formatDate(postulacion.fechaPostulacion)}</span>
                      </div>
                      {postulacion.fechaEvaluacion && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>Evaluado: {formatDate(postulacion.fechaEvaluacion)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modales - Se mantienen igual */}
      <EvaluarPostulacionModal
        open={evaluarModalOpen}
        onOpenChange={setEvaluarModalOpen}
        postulacion={selectedPostulacion}
        convocatoria={convocatoria}
        onSuccess={() => {
          setEvaluarModalOpen(false)
          setSelectedPostulacion(null)
          handleSuccess()
        }}
      />

      <SeleccionarGanadorModal
        open={seleccionarModalOpen}
        onOpenChange={setSeleccionarModalOpen}
        postulacion={selectedPostulacion}
        convocatoria={convocatoria}
        onSuccess={() => {
          setSeleccionarModalOpen(false)
          setSelectedPostulacion(null)
          handleSuccess()
        }}
      />

      <RechazarPostulacionModal
        open={rechazarModalOpen}
        onOpenChange={setRechazarModalOpen}
        postulacion={selectedPostulacion}
        onSuccess={() => {
          setRechazarModalOpen(false)
          setSelectedPostulacion(null)
          handleSuccess()
        }}
      />
    </div>
  )
}