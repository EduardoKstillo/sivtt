import { useState, useEffect, useCallback } from 'react'
import { fasesAPI } from '@api/endpoints/fases'
import { toast } from '@components/ui/use-toast'

export const useFases = (procesoId) => {
  const [fases, setFases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedFase, setExpandedFase] = useState(null)

  const fetchFases = useCallback(async () => {
    if (!procesoId) return

    try {
      setLoading(true)
      setError(null)
      const { data } = await fasesAPI.listByProceso(procesoId)
      
      // 🔴 CORRECCIÓN AQUÍ:
      // La API devuelve { success: true, data: [...] }, no data.fases
      setFases(data.data || []) 
      
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar fases",
        description: err.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }, [procesoId])

  useEffect(() => {
    fetchFases()
  }, [fetchFases])

  const toggleFase = (fase) => {
    setExpandedFase(prev => prev === fase ? null : fase)
  }

  return {
    fases,
    loading,
    error,
    expandedFase,
    toggleFase,
    refetch: fetchFases
  }
}