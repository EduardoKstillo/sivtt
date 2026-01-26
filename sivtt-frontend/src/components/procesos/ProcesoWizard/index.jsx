import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { useProcesoWizard } from '@hooks/useProcesoWizard'
import { Step1TipoActivo } from './Step1TipoActivo'
import { Step2SistemaOrigen } from './Step2SistemaOrigen'
import { Step3InfoBasica } from './Step3InfoBasica'
import { Step4Configuracion } from './Step4Configuracion'
import { Step5Confirmacion } from './Step5Confirmacion'
import { cn } from '@/lib/utils'

export const ProcesoWizard = ({ open, onOpenChange }) => {
  const navigate = useNavigate()

  const handleSuccess = (proceso) => {
    onOpenChange(false)
    // Navegar al proceso recién creado
    navigate(`/procesos/${proceso.id}`)
  }

  const {
    currentStep,
    totalSteps,
    formData,
    loading,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    reset,
    submitProceso
  } = useProcesoWizard(handleSuccess)

  const handleClose = () => {
    if (!loading) {
      reset()
      onOpenChange(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1TipoActivo
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onCancel={handleClose}
          />
        )
      case 2:
        return (
          <Step2SistemaOrigen
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 3:
        return (
          <Step3InfoBasica
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 4:
        return (
          <Step4Configuracion
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 5:
        return (
          <Step5Confirmacion
            formData={formData}
            onBack={prevStep}
            onSubmit={submitProceso}
            loading={loading}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Crear Nuevo Proceso
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    step < currentStep && "bg-blue-600 text-white",
                    step === currentStep && "bg-blue-600 text-white ring-4 ring-blue-100",
                    step > currentStep && "bg-gray-200 text-gray-500"
                  )}
                >
                  {step}
                </div>
                <div className="mt-2 text-xs text-center max-w-[80px]">
                  {step === 1 && "Tipo"}
                  {step === 2 && "Origen"}
                  {step === 3 && "Info"}
                  {step === 4 && "Config"}
                  {step === 5 && "Confirmar"}
                </div>
              </div>
              {step < 5 && (
                <div
                  className={cn(
                    "h-1 flex-1 mx-2 transition-all",
                    step < currentStep ? "bg-blue-600" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}