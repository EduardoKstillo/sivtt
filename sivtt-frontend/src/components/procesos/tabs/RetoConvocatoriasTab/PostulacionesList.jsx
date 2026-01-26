import { useState, useEffect } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { 
  Users, 
  FileText, 
  Star,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react'
import { EvaluarPostulacionModal } from './modals/EvaluarPostulacionModal'
import { SeleccionarGanadorModal } from './modals/SeleccionarGanadorModal'
import { postulacionesAPI } from '@api/endpoints/postulaciones'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'

const ESTADO_CONFIG = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  EVALUADA: { label: 'Evaluada', color: 'bg-blue-100 text-blue-700' },
  SELECCIONADA: { label: 'Seleccionada', color: 'bg-green-100 text-green-700' },
  RECHAZADA: { label: 'Rechazada', color: 'bg-red-100 text-red-700' }
}

export const PostulacionesList = ({ convocatoria, proceso, onUpdate }) => {
  const [loading, setLoading] = useState(true)
  const [postulaciones, setPostulaciones] = useState([])
  const [evaluarModalOpen, setEvaluarModalOpen] = useState(false)
  const [seleccionarModalOpen, setSeleccionarModalOpen] = useState(false)
  const [selectedPostulacion, setSelectedPostulacion] = useState(null)

  useEffect(() => {
    fetchPostulaciones()
  }, [convocatoria.id])

  const fetchPostulaciones = async () => {
    setLoading(true)
    try {
      const { data } = await postulacionesAPI.listByConvocatoria(convocatoria.id)
      setPostulaciones(data.data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cargar postulaciones",
        description: error.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluar = (postulacion) => {
    setSelectedPostulacion(postulacion)
    setEvaluarModalOpen(true)
  }

  const handleSeleccionar = (postulacion) => {
    setSelectedPostulacion(postulacion)
    setSeleccionarModalOpen(true)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (postulaciones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No hay postulaciones para esta convocatoria
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 mb-3">
          Postulaciones ({postulaciones.length})
        </h4>

        {postulaciones.map((postulacion) => {
          const estadoConfig = ESTADO_CONFIG[postulacion.estado]

          return (
            <Card key={postulacion.id} className="border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Grupo */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded text-white flex items-center justify-center font-bold text-sm">
                        {postulacion.grupo?.codigo?.charAt(0) || 'G'}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">
                          {postulacion.grupo?.nombre}
                        </h5>
                        <p className="text-xs text-gray-500">
                          {postulacion.grupo?.codigo}
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                      <Badge className={estadoConfig.color}>
                        {estadoConfig.label}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{postulacion.grupo?.miembros?.length || 0} miembros</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>Postulado: {formatDate(postulacion.fechaPostulacion)}</span>
                      </div>

                      {postulacion.puntajeTotal !== null && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-700">
                            {postulacion.puntajeTotal}/100
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Propuesta */}
                    {postulacion.propuesta && (
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                        {postulacion.propuesta}
                      </p>
                    )}

                    {/* Observaciones */}
                    {postulacion.observaciones && (
                      <div className="bg-gray-50 rounded p-2 text-sm text-gray-700">
                        💬 {postulacion.observaciones}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {postulacion.propuestaUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(postulacion.propuestaUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Propuesta
                      </Button>
                    )}

                    {postulacion.estado === 'PENDIENTE' && (
                      <Button
                        size="sm"
                        onClick={() => handleEvaluar(postulacion)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Evaluar
                      </Button>
                    )}

                    {postulacion.estado === 'EVALUADA' && !convocatoria.ganador && (
                      <Button
                        size="sm"
                        onClick={() => handleSeleccionar(postulacion)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Seleccionar
                      </Button>
                    )}

                    {postulacion.estado === 'SELECCIONADA' && (
                      <Badge className="bg-green-100 text-green-700">
                        ✅ Ganador
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modals */}
      <EvaluarPostulacionModal
        open={evaluarModalOpen}
        onOpenChange={setEvaluarModalOpen}
        postulacion={selectedPostulacion}
        onSuccess={() => {
          setEvaluarModalOpen(false)
          fetchPostulaciones()
          onUpdate()
        }}
      />

      <SeleccionarGanadorModal
        open={seleccionarModalOpen}
        onOpenChange={setSeleccionarModalOpen}
        postulacion={selectedPostulacion}
        proceso={proceso}
        onSuccess={() => {
          setSeleccionarModalOpen(false)
          fetchPostulaciones()
          onUpdate()
        }}
      />
    </>
  )
}