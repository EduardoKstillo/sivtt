import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Info } from 'lucide-react'

const SISTEMAS_ORIGEN = [
  { value: 'CRIS-UNSA', label: 'CRIS-UNSA' },
  { value: 'SIRI', label: 'SIRI' },
  { value: 'SISMO', label: 'SISMO' },
  { value: 'OTRO', label: 'Otro' }
]

export const Step2SistemaOrigen = ({ formData, updateFormData, onNext, onBack }) => {
  const [errors, setErrors] = useState({})
  const [localData, setLocalData] = useState({
    sistemaOrigen: formData.sistemaOrigen || 'CRIS-UNSA',
    evaluacionId: formData.evaluacionId || ''
  })

  const handleChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!localData.sistemaOrigen || localData.sistemaOrigen.trim() === '') {
      newErrors.sistemaOrigen = 'El sistema de origen es obligatorio'
    }

    if (!localData.evaluacionId || localData.evaluacionId.trim() === '') {
      newErrors.evaluacionId = 'El ID de evaluación es obligatorio'
    } else if (isNaN(localData.evaluacionId) || parseInt(localData.evaluacionId) <= 0) {
      newErrors.evaluacionId = 'El ID debe ser un número válido mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      updateFormData({
        sistemaOrigen: localData.sistemaOrigen,
        evaluacionId: localData.evaluacionId
      })
      onNext()
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Datos de trazabilidad con sistemas externos
        </h3>
        <p className="text-sm text-gray-500">
          Esta información permite vincular el proceso con registros en otros sistemas
        </p>
      </div>

      <div className="space-y-4">
        {/* Sistema de Origen */}
        <div className="space-y-2">
          <Label htmlFor="sistemaOrigen">
            Sistema de origen <span className="text-red-500">*</span>
          </Label>
          <Select
            value={localData.sistemaOrigen}
            onValueChange={(value) => handleChange('sistemaOrigen', value)}
          >
            <SelectTrigger id="sistemaOrigen" className={errors.sistemaOrigen && "border-red-500"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SISTEMAS_ORIGEN.map((sistema) => (
                <SelectItem key={sistema.value} value={sistema.value}>
                  {sistema.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sistemaOrigen && (
            <p className="text-xs text-red-500">{errors.sistemaOrigen}</p>
          )}
        </div>

        {/* ID de Evaluación */}
        <div className="space-y-2">
          <Label htmlFor="evaluacionId">
            ID de evaluación en el sistema origen <span className="text-red-500">*</span>
          </Label>
          <Input
            id="evaluacionId"
            type="number"
            placeholder="502"
            value={localData.evaluacionId}
            onChange={(e) => handleChange('evaluacionId', e.target.value)}
            className={errors.evaluacionId && "border-red-500"}
          />
          {errors.evaluacionId && (
            <p className="text-xs text-red-500">{errors.evaluacionId}</p>
          )}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Este ID debe ser único y corresponder al registro en el sistema externo.
              Se utilizará para mantener la trazabilidad entre sistemas.
            </AlertDescription>
          </Alert>
        </div>

        {/* Info adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            ¿Qué es el ID de evaluación?
          </h4>
          <p className="text-xs text-blue-800">
            Es el identificador único asignado en el sistema de origen (por ejemplo, CRIS-UNSA).
            Este ID permite vincular el proceso de transferencia con la evaluación técnica
            o proyecto de investigación original.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          ← Anterior
        </Button>
        <Button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Siguiente →
        </Button>
      </div>
    </div>
  )
}