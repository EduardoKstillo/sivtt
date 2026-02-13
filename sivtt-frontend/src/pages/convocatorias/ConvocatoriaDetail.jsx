import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
// 🔥 CORRECCIÓN: Agregado 'Award' a los imports
import { ArrowLeft, Calendar, Info, FileText, CheckCircle2, Clock, Send, XCircle, Award } from 'lucide-react'
import { PostulacionesList } from '@components/procesos/tabs/RetoConvocatoriasTab/PostulacionesList'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { convocatoriasAPI } from '@api/endpoints/convocatorias'
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const ESTADO_CONFIG = {
  BORRADOR: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: Clock },
  PUBLICADA: { label: 'Publicada', color: 'bg-blue-100 text-blue-700', icon: Send },
  CERRADA: { label: 'Cerrada', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: XCircle }
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
        title: "Error al cargar",
        description: err.response?.data?.message || "No se pudo cargar la convocatoria"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>

  if (error) {
    return (
      <ErrorState
        title="Error al cargar convocatoria"
        message="No se pudo obtener la información solicitada."
        onRetry={fetchConvocatoria}
        backAction={() => navigate('/convocatorias')}
      />
    )
  }

  if (!convocatoria) return null

  const estadoConfig = ESTADO_CONFIG[convocatoria.estatus] || ESTADO_CONFIG.BORRADOR
  const IconEstado = estadoConfig.icon

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/convocatorias')}
          className="mb-4 pl-0 hover:pl-2 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al listado
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                {convocatoria.codigo}
                </h1>
                <Badge className={cn(estadoConfig.color, "px-3 py-1")}>
                    <IconEstado className="h-3 w-3 mr-1.5" />
                    {estadoConfig.label}
                </Badge>
            </div>
            
            <h2 className="text-lg text-gray-700 font-medium mb-1">
                {convocatoria.titulo}
            </h2>

            {/* Link al Proceso/Reto */}
            {convocatoria.reto && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <FileText className="h-4 w-4" />
                <span>Reto: <strong>{convocatoria.reto.titulo}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalles Principales */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Detalles de la Convocatoria</h3>
                
                <div className="space-y-4">
                    <div>
                        <span className="text-sm font-medium text-gray-500 block mb-1">Descripción</span>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{convocatoria.descripcion}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="text-xs text-gray-500 block mb-1">Fecha Apertura</span>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                {formatDate(convocatoria.fechaApertura)}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="text-xs text-gray-500 block mb-1">Fecha Cierre</span>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Calendar className="h-4 w-4 text-red-500" />
                                {formatDate(convocatoria.fechaCierre)}
                            </div>
                        </div>
                    </div>
                </div>

                {convocatoria.esRelanzamiento && convocatoria.motivoRelanzamiento && (
                <Alert className="mt-6 bg-orange-50 border-orange-200">
                    <Info className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-900 text-sm">
                    <strong>Relanzamiento #{convocatoria.numeroRelanzamiento}:</strong> {convocatoria.motivoRelanzamiento}
                    </AlertDescription>
                </Alert>
                )}
            </div>

            {/* Postulaciones Component */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Gestión de Postulaciones</h2>
                    <p className="text-sm text-gray-500">Evalúa y selecciona a los grupos participantes.</p>
                </div>
                
                <PostulacionesList
                    convocatoria={convocatoria}
                    proceso={convocatoria.reto?.proceso} // Pasar el proceso si está disponible en el include
                    onUpdate={fetchConvocatoria}
                />
            </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            {/* Criterios */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    Criterios de Evaluación
                </h3>
                
                <div className="space-y-3">
                    <div className="flex justify-between text-sm border-b pb-2">
                        <span className="text-gray-600">Puntaje Mínimo</span>
                        <span className="font-bold text-gray-900">{convocatoria.criteriosSeleccion?.puntajeMinimo || 60} pts</span>
                    </div>
                    
                    <div className="space-y-2">
                        {convocatoria.criteriosSeleccion?.criterios?.map((c) => (
                            <div key={c.nombre} className="flex justify-between text-xs">
                                <span className="text-gray-600">{c.descripcion}</span>
                                <span className="font-medium bg-gray-100 px-2 rounded">{c.peso}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}