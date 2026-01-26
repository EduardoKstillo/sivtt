import { useState, useEffect } from 'react'
import { historialAPI } from '@api/endpoints/historial'
import { toast } from '@components/ui/use-toast'

export const useHistorialTRL = (procesoId) => {
  const [historialTRL, setHistorialTRL] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHistorialTRL = async () => {
      if (!procesoId) return

      try {
        setLoading(true)
        setError(null)
        const { data } = await historialAPI.getTRL(procesoId)
        setHistorialTRL(data.data || [])
      } catch (err) {
        setError(err)
        toast({
          variant: "destructive",
          title: "Error al cargar historial TRL",
          description: err.response?.data?.message || "Error inesperado"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHistorialTRL()
  }, [procesoId])

  return {
    historialTRL,
    loading,
    error
  }
}