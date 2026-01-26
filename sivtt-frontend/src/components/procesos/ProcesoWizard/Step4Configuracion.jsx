import { useState, useEffect } from 'react'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Info, Loader2 } from 'lucide-react'
import { TIPO_ACTIVO } from '@utils/constants'
import { usersAPI } from '@api/endpoints/users'
import { cn } from '@/lib/utils'

const TRL_LEVELS = [
  { value: 1, label: 'TRL 1 - Principios básicos observados', range: '1-3' },
  { value: 2, label: 'TRL 2 - Concepto tecnológico formulado', range: '1-3' },
  { value: 3, label: 'TRL 3 - Prueba de concepto experimental', range: '1-3' },
  { value: 4, label: 'TRL 4 - Validación en laboratorio', range: '4-6' },
  { value: 5, label: 'TRL 5 - Validación en entorno relevante', range: '4-6' },
  { value: 6, label: 'TRL 6 - Demostración en entorno relevante', range: '4-6' },
  { value: 7, label: 'TRL 7 - Demostración en entorno operacional', range: '7-9' },
  { value: 8, label: 'TRL 8 - Sistema completo y calificado', range: '7-9' },
  { value: 9, label: 'TRL 9 - Sistema probado en entorno operacional', range: '7-9' }
]

export const Step4Configuracion = ({ formData, updateFormData, onNext, onBack }) => {
  const [errors, setErrors] = useState({})
  const [usuarios, setUsuarios] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [localData, setLocalData] = useState({
    trlInicial: formData.trlInicial,
    responsableId: formData.responsableId
  })

  const isPatente = formData.tipoActivo === TIPO_ACTIVO.PATENTE

  // Cargar usuarios gestores
  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    setLoadingUsers(true)
    try {
      const { data } = await usersAPI.list({
        activo: true,
        rol: 'GESTOR_VINCULACION'
      })
      setUsuarios(data.data.usuarios || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (isPatente && !localData.trlInicial) {
      newErrors.trlInicial = 'El TRL inicial es obligatorio para patentes'
    }

    if (!localData.responsableId) {
      newErrors.responsableId = 'Debe seleccionar un responsable'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      updateFormData({
        trlInicial: localData.trlInicial,
        responsableId: localData.responsableId
      })
      onNext()
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Configuración inicial del proceso
        </h3>
        <p className="text-sm text-gray-500">
          Defina los parámetros iniciales y el responsable
        </p>
      </div>

      <div className="space-y-6">
        {/* TRL Inicial - Solo para PATENTE */}
        {isPatente && (
          <div className="space-y-3">
            <Label htmlFor="trlInicial">
              Nivel TRL inicial <span className="text-red-500">*</span>
            </Label>

            {/* Selector de TRL */}
            <Select
              value={localData.trlInicial?.toString()}
              onValueChange={(value) => handleChange('trlInicial', parseInt(value))}
            >
              <SelectTrigger 
                id="trlInicial" 
                className={errors.trlInicial && "border-red-500"}
              >
                <SelectValue placeholder="Seleccione el TRL inicial" />
              </SelectTrigger>
              <SelectContent>
                {TRL_LEVELS.map((trl) => (
                  <SelectItem key={trl.value} value={trl.value.toString()}>
                    {trl.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.trlInicial && (
              <p className="text-xs text-red-500">{errors.trlInicial}</p>
            )}

            {/* Visualización de TRL */}
            {localData.trlInicial && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">TRL seleccionado:</span>
                  <span className="font-semibold text-blue-600">
                    {localData.trlInicial}/9
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "flex-1 h-3 rounded-full cursor-pointer transition-all",
                        level <= localData.trlInicial
                          ? "bg-blue-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      )}
                      onClick={() => handleChange('trlInicial', level)}
                    />
                  ))}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {localData.trlInicial >= 1 && localData.trlInicial <= 3 && 
                      "TRL 1-3: Investigación básica y conceptualización"}
                    {localData.trlInicial >= 4 && localData.trlInicial <= 6 && 
                      "TRL 4-6: Desarrollo tecnológico y validación"}
                    {localData.trlInicial >= 7 && localData.trlInicial <= 9 && 
                      "TRL 7-9: Demostración y comercialización"}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        )}

        {/* Responsable del Proceso */}
        <div className="space-y-2">
          <Label htmlFor="responsableId">
            Responsable del proceso <span className="text-red-500">*</span>
          </Label>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Cargando usuarios...</span>
            </div>
          ) : (
            <>
              <Select
                value={localData.responsableId?.toString()}
                onValueChange={(value) => handleChange('responsableId', parseInt(value))}
              >
                <SelectTrigger 
                  id="responsableId"
                  className={errors.responsableId && "border-red-500"}
                >
                  <SelectValue placeholder="Seleccione un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{usuario.nombre}</span>
                        <span className="text-xs text-gray-500">{usuario.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.responsableId && (
                <p className="text-xs text-red-500">{errors.responsableId}</p>
              )}

              <p className="text-xs text-gray-500">
                El responsable será el encargado principal de gestionar este proceso
              </p>
            </>
          )}
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
          disabled={loadingUsers}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Siguiente →
        </Button>
      </div>
    </div>
  )
}