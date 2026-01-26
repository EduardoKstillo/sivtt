import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
import { ArrowLeft, Calendar, Info } from 'lucide-react'
import { PostulacionesList } from '@components/procesos/tabs/RetoConvocatoriasTab/PostulacionesList'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { convocatoriasAPI } from '@api/endpoints/convocatorias'
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'

const ESTADO_CONFIG = {
  ABIERTA: { label: 'Abierta', color: 'bg-green-100 text-green-700' },
  CERRADA: { label: 'Cerrada', color: 'bg-gray-100 text-gray-700' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-700' }
}

export const ConvocatoriaDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [convocatoria, setConvocatoria] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchConvocatoria()
  }, [id])

  const fetchConvocatoria = async () => {
    setLoading(true)
    try {
      const { data } = await convocatoriasAPI.getById(id)
      setConvocatoria(data.data)
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar convocatoria",
        description: err.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar convocatoria"
        message="No se pudo cargar la información"
        onRetry={fetchConvocatoria}
      />
    )
  }

  if (!convocatoria) {
    return null
  }

  const estadoConfig = ESTADO_CONFIG[convocatoria.estado]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/convocatorias')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a convocatorias
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {convocatoria.codigo}
            </h1>
            {convocatoria.proceso && (
              <p className="text-gray-600">
                Proceso: {convocatoria.proceso.titulo}
              </p>
            )}
          </div>

          <Badge className={estadoConfig.color}>
            {estadoConfig.label}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Fecha de Apertura</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">
                {formatDate(convocatoria.fechaApertura)}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Fecha de Cierre</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">
                {formatDate(convocatoria.fechaCierre)}
              </span>
            </div>
          </div>
        </div>

        {convocatoria.esRelanzamiento && convocatoria.motivoRelanzamiento && (
          <Alert className="mt-6 bg-yellow-50 border-yellow-200">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Motivo de relanzamiento:</strong> {convocatoria.motivoRelanzamiento}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Postulaciones */}
      {convocatoria.proceso && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Postulaciones
          </h2>
          
          <PostulacionesList
            convocatoria={convocatoria}
            proceso={convocatoria.proceso}
            onUpdate={fetchConvocatoria}
          />
        </div>
      )}
    </div>
  )
}