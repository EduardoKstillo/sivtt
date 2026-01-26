import { useState, useEffect, useCallback } from 'react'
import { retosAPI } from '@api/endpoints/retos'
import { toast } from '@components/ui/use-toast'

export const useReto = (procesoId) => {
  const [reto, setReto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReto = useCallback(async () => {
    if (!procesoId) return

    try {
      setLoading(true)
      setError(null)
      const { data } = await retosAPI.getByProceso(procesoId)
      setReto(data.data)
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar reto",
        description: err.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }, [procesoId])

  useEffect(() => {
    fetchReto()
  }, [fetchReto])

  return {
    reto,
    loading,
    error,
    refetch: fetchReto
  }
}