import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { TIPO_ACTIVO } from '@utils/constants'

export const Step5Confirmacion = ({ formData, onBack, onSubmit, loading }) => {
  const isPatente = formData.tipoActivo === TIPO_ACTIVO.PATENTE

  const getTRLLabel = (trl) => {
    const labels = {
      1: 'Principios básicos observados',
      2: 'Concepto tecnológico formulado',
      3: 'Prueba de concepto experimental',
      4: 'Validación en laboratorio',
      5: 'Validación en entorno relevante',
      6: 'Demostración en entorno relevante',
      7: 'Demostración en entorno operacional',
      8: 'Sistema completo y calificado',
      9: 'Sistema probado en entorno operacional'
    }
    return labels[trl] || ''
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Revise la información antes de crear el proceso
        </h3>
        <p className="text-sm text-gray-500">
          Verifique que todos los datos sean correctos
        </p>
      </div>

      {/* Resumen */}
      <div className="space-y-4">
        {/* Tipo de Proceso */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Tipo de Proceso</span>
            <Badge className={
              isPatente 
                ? "bg-blue-600" 
                : "bg-purple-600"
            }>
              {isPatente ? '🔵 PATENTE' : '🟣 REQUERIMIENTO EMPRESARIAL'}
            </Badge>
          </div>
        </div>

        {/* Sistema de Origen */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Sistema de Origen
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-gray-500">Sistema:</span>
              <p className="text-sm font-medium text-gray-900">
                {formData.sistemaOrigen}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500">ID de Evaluación:</span>
              <p className="text-sm font-medium text-gray-900">
                {formData.evaluacionId}
              </p>
            </div>
          </div>
        </div>

        {/* Información Básica */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Información Básica
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-gray-500">Título:</span>
              <p className="text-sm font-medium text-gray-900">
                {formData.titulo}
              </p>
            </div>
            {formData.descripcion && (
              <div>
                <span className="text-xs text-gray-500">Descripción:</span>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {formData.descripcion}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Configuración */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Configuración Inicial
          </h4>
          <div className="space-y-3">
            {isPatente && formData.trlInicial && (
              <div>
                <span className="text-xs text-gray-500">TRL Inicial:</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                      <div
                        key={level}
                        className={`w-6 h-6 rounded-full ${
                          level <= formData.trlInicial
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.trlInicial}/9
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {getTRLLabel(formData.trlInicial)}
                </p>
              </div>
            )}
            <div>
              <span className="text-xs text-gray-500">Responsable:</span>
              <p className="text-sm font-medium text-gray-900">
                {formData.responsable?.nombre || 'Responsable seleccionado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información sobre creación */}
      <Alert className="bg-blue-50 border-blue-200">
        <CheckCircle2 className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900">
          <strong>Al crear el proceso:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
            <li>Se iniciará en fase {isPatente ? 'CARACTERIZACIÓN' : 'FORMULACIÓN DE RETO'}</li>
            <li>Se registrará automáticamente en el historial</li>
            <li>El responsable será notificado</li>
            <li>Podrá comenzar a gestionar actividades</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
        >
          ← Anterior
        </Button>
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[140px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Crear Proceso
            </>
          )}
        </Button>
      </div>
    </div>
  )
}