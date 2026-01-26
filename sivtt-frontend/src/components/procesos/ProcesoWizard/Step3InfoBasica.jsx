import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'

export const Step3InfoBasica = ({ formData, updateFormData, onNext, onBack }) => {
  const [errors, setErrors] = useState({})
  const [localData, setLocalData] = useState({
    titulo: formData.titulo || '',
    descripcion: formData.descripcion || ''
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

    if (!localData.titulo || localData.titulo.trim().length < 10) {
      newErrors.titulo = 'El título debe tener al menos 10 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      updateFormData({
        titulo: localData.titulo.trim(),
        descripcion: localData.descripcion.trim()
      })
      onNext()
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Información básica del proceso
        </h3>
        <p className="text-sm text-gray-500">
          Ingrese los datos principales que identificarán este proceso
        </p>
      </div>

      <div className="space-y-4">
        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="titulo">
            Título del proceso <span className="text-red-500">*</span>
          </Label>
          <Input
            id="titulo"
            placeholder="Ej: Sensor IoT para agricultura de precisión"
            value={localData.titulo}
            onChange={(e) => handleChange('titulo', e.target.value)}
            className={errors.titulo && "border-red-500"}
            maxLength={200}
          />
          <div className="flex justify-between items-center">
            {errors.titulo && (
              <p className="text-xs text-red-500">{errors.titulo}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {localData.titulo.length}/200
            </p>
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="descripcion">
            Descripción
            <span className="text-gray-500 font-normal ml-2">(Opcional)</span>
          </Label>
          <Textarea
            id="descripcion"
            placeholder="Sistema de sensores inalámbricos para monitoreo de humedad y temperatura del suelo, diseñado para optimizar el riego en cultivos..."
            value={localData.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            rows={6}
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 text-right">
            {localData.descripcion.length}/1000
          </p>
        </div>

        {/* Preview */}
        {localData.titulo && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Vista previa:
            </p>
            <h4 className="font-semibold text-gray-900 mb-1">
              {localData.titulo}
            </h4>
            {localData.descripcion && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {localData.descripcion}
              </p>
            )}
          </div>
        )}
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