import { useState, useEffect, useCallback } from 'react'
import { retosAPI } from '@api/endpoints/retos'
import { toast } from '@components/ui/use-toast'

export const useReto = (procesoId) => {
  const [reto, setReto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exists, setExists] = useState(false) // Nuevo: indica si existe el reto

  const fetchReto = useCallback(async () => {
    if (!procesoId) return

    try {
      setLoading(true)
      setError(null)
      
      // El endpoint es: GET /procesos/:procesoId/reto
      const { data } = await retosAPI.getByProceso(procesoId)
      setReto(data.data)
      setExists(true)
    } catch (err) {
      // Si es 404, significa que no existe el reto todavía
      if (err.response?.status === 404) {
        setReto(null)
        setExists(false)
        setError(null) // No es un error, simplemente no existe
      } else {
        setError(err)
        toast({
          variant: "destructive",
          title: "Error al cargar reto",
          description: err.response?.data?.message || "Error inesperado"
        })
      }
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
    exists, // Nuevo: para saber si existe o no
    refetch: fetchReto
  }
}