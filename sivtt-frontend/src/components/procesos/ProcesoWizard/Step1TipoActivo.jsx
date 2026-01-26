import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { CheckCircle2, FileText, Briefcase } from 'lucide-react'
import { TIPO_ACTIVO } from '@utils/constants'
import { cn } from '@/lib/utils'

export const Step1TipoActivo = ({ formData, updateFormData, onNext, onCancel }) => {
  const [selected, setSelected] = useState(formData.tipoActivo)

  const handleSelect = (tipo) => {
    setSelected(tipo)
    updateFormData({ tipoActivo: tipo })
  }

  const handleNext = () => {
    if (selected) {
      onNext()
    }
  }

  const options = [
    {
      value: TIPO_ACTIVO.PATENTE,
      icon: FileText,
      title: '🔵 PATENTE',
      description: 'Transferencia de tecnología universitaria al sector productivo',
      features: [
        '5 fases de vinculación',
        'Gestión de TRL (1-9)',
        'Vinculación con empresas',
        'Seguimiento de escalamiento'
      ],
      phases: [
        'Caracterización',
        'Enriquecimiento',
        'Match',
        'Escalamiento',
        'Transferencia'
      ]
    },
    {
      value: TIPO_ACTIVO.REQUERIMIENTO_EMPRESARIAL,
      icon: Briefcase,
      title: '🟣 REQUERIMIENTO EMPRESARIAL',
      description: 'Solución de problema empresarial con grupos de investigación',
      features: [
        '7 fases de vinculación',
        'Sistema de convocatorias',
        'Postulaciones de grupos',
        'Evaluación y selección'
      ],
      phases: [
        'Formulación de Reto',
        'Convocatoria',
        'Postulación',
        'Selección',
        'Anteproyecto',
        'Ejecución',
        'Cierre'
      ]
    }
  ]

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Seleccione el tipo de activo a gestionar
        </h3>
        <p className="text-sm text-gray-500">
          Esto determinará el flujo de trabajo y las fases del proceso
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = selected === option.value

          return (
            <Card
              key={option.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg relative",
                isSelected && "ring-2 ring-blue-600 shadow-lg"
              )}
              onClick={() => handleSelect(option.value)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}

              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    option.value === TIPO_ACTIVO.PATENTE
                      ? "bg-blue-100"
                      : "bg-purple-100"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6",
                      option.value === TIPO_ACTIVO.PATENTE
                        ? "text-blue-600"
                        : "text-purple-600"
                    )} />
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    {option.title}
                  </h4>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {option.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="text-xs font-medium text-gray-700">
                    Características:
                  </div>
                  <ul className="space-y-1.5">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                        <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Fases del proceso:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {option.phases.map((phase, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          "text-xs px-2 py-1 rounded",
                          option.value === TIPO_ACTIVO.PATENTE
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        )}
                      >
                        {phase}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selected}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Siguiente →
        </Button>
      </div>
    </div>
  )
}