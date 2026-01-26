import { useState, useEffect, useCallback } from 'react'
import { procesosAPI } from '@api/endpoints/procesos'
import { toast } from '@components/ui/use-toast'

export const useProcesoDetail = (id) => {
  const [proceso, setProceso] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProceso = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const { data } = await procesosAPI.getById(id)
      setProceso(data.data)
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar proceso",
        description: err.response?.data?.message || "Proceso no encontrado"
      })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProceso()
  }, [fetchProceso])

  const updateProceso = (updatedData) => {
    setProceso(prev => ({ ...prev, ...updatedData }))
  }

  return {
    proceso,
    loading,
    error,
    refetch: fetchProceso,
    updateProceso
  }
}