import { useState, useEffect, useCallback } from 'react'
import { retosAPI } from '@api/endpoints/retos'
import { toast } from '@components/ui/use-toast'

export const useConvocatorias = (retoId) => {
  const [convocatorias, setConvocatorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchConvocatorias = useCallback(async () => {
    if (!retoId) {
      setConvocatorias([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // El endpoint es: GET /retos/:id/convocatorias
      const { data } = await retosAPI.listConvocatorias(retoId)
      setConvocatorias(data.data || [])
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar convocatorias",
        description: err.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }, [retoId])

  useEffect(() => {
    fetchConvocatorias()
  }, [fetchConvocatorias])

  return {
    convocatorias,
    loading,
    error,
    refetch: fetchConvocatorias
  }
}