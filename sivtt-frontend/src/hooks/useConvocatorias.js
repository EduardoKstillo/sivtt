import { useState, useEffect, useCallback } from 'react'
import { convocatoriasAPI } from '@api/endpoints/convocatorias'
import { toast } from '@components/ui/use-toast'

export const useConvocatorias = (procesoId) => {
  const [convocatorias, setConvocatorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchConvocatorias = useCallback(async () => {
    if (!procesoId) return

    try {
      setLoading(true)
      setError(null)
      const { data } = await convocatoriasAPI.listByProceso(procesoId)
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
  }, [procesoId])

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