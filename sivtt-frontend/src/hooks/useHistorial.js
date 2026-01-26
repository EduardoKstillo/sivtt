import { useState, useEffect, useCallback } from 'react'
import { historialAPI } from '@api/endpoints/historial'
import { toast } from '@components/ui/use-toast'

export const useHistorial = (procesoId, filters = {}) => {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHistorial = useCallback(async () => {
    if (!procesoId) return

    try {
      setLoading(true)
      setError(null)

      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      )

      const { data } = await historialAPI.getHistorial(procesoId, cleanFilters)
      setEventos(data.data || [])
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar historial",
        description: err.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }, [procesoId, filters])

  useEffect(() => {
    fetchHistorial()
  }, [fetchHistorial])

  return {
    eventos,
    loading,
    error,
    refetch: fetchHistorial
  }
}