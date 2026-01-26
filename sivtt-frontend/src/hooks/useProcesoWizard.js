import { useState } from 'react'
import { procesosAPI } from '@api/endpoints/procesos'
import { usersAPI } from '@api/endpoints/users'
import { toast } from '@components/ui/use-toast'
import { validateProcesoCreate } from '@utils/validators'

export const useProcesoWizard = (onSuccess) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1
    tipoActivo: '',
    
    // Step 2
    sistemaOrigen: 'CRIS-UNSA',
    evaluacionId: '',
    
    // Step 3
    titulo: '',
    descripcion: '',
    
    // Step 4
    trlInicial: null,
    responsableId: null
  })

  const totalSteps = 5

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step)
    }
  }

  const reset = () => {
    setCurrentStep(1)
    setFormData({
      tipoActivo: '',
      sistemaOrigen: 'CRIS-UNSA',
      evaluacionId: '',
      titulo: '',
      descripcion: '',
      trlInicial: null,
      responsableId: null
    })
  }

  const submitProceso = async () => {
    // Validar datos
    const validation = validateProcesoCreate(formData)
    
    if (!validation.isValid) {
      Object.values(validation.errors).forEach(error => {
        toast({
          variant: "destructive",
          title: "Error de validación",
          description: error
        })
      })
      return false
    }

    setLoading(true)

    try {
      // Preparar datos para enviar
      const payload = {
        tipoActivo: formData.tipoActivo,
        sistemaOrigen: formData.sistemaOrigen,
        evaluacionId: parseInt(formData.evaluacionId),
        titulo: formData.titulo,
        descripcion: formData.descripcion || undefined,
        responsableId: formData.responsableId
      }

      // Solo agregar TRL si es PATENTE
      if (formData.tipoActivo === 'PATENTE') {
        payload.trlInicial = formData.trlInicial
      }

      const { data } = await procesosAPI.create(payload)

      toast({
        title: "Proceso creado exitosamente",
        description: `El proceso ${data.data.codigo} ha sido registrado`
      })

      if (onSuccess) {
        onSuccess(data.data)
      }

      reset()
      return true
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al crear el proceso'
      
      toast({
        variant: "destructive",
        title: "Error al crear proceso",
        description: errorMessage
      })

      // Si es error 409 (ID duplicado), volver al Step 2
      if (error.response?.status === 409) {
        goToStep(2)
      }

      return false
    } finally {
      setLoading(false)
    }
  }

  return {
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
  }
}