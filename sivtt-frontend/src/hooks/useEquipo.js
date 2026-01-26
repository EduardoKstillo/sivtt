import { useState, useEffect, useCallback } from 'react'
import { equiposAPI } from '@api/endpoints/equipos'
import { toast } from '@components/ui/use-toast'

export const useEquipo = (procesoId) => {
  const [equipo, setEquipo] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEquipo = useCallback(async () => {
    if (!procesoId) return

    try {
      setLoading(true)
      setError(null)
      const { data } = await equiposAPI.listByProceso(procesoId)
      setEquipo(data.data || [])
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar equipo",
        description: err.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }, [procesoId])

  useEffect(() => {
    fetchEquipo()
  }, [fetchEquipo])

  return {
    equipo,
    loading,
    error,
    refetch: fetchEquipo
  }
}