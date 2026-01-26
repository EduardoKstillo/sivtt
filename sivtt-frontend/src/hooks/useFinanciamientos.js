import { useState, useEffect, useCallback } from 'react'
import { financiamientosAPI } from '@api/endpoints/financiamientos'
import { toast } from '@components/ui/use-toast'

export const useFinanciamientos = (procesoId) => {
  const [financiamientos, setFinanciamientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFinanciamientos = useCallback(async () => {
    if (!procesoId) return

    try {
      setLoading(true)
      setError(null)
      const { data } = await financiamientosAPI.listByProceso(procesoId)
      setFinanciamientos(data.data || [])
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar financiamientos",
        description: err.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }, [procesoId])

  useEffect(() => {
    fetchFinanciamientos()
  }, [fetchFinanciamientos])

  const totalFinanciamiento = financiamientos.reduce((sum, f) => sum + (f.monto || 0), 0)

  return {
    financiamientos,
    totalFinanciamiento,
    loading,
    error,
    refetch: fetchFinanciamientos
  }
}