import { useState, useEffect, useCallback } from 'react'
import { fasesAPI } from '@api/endpoints/fases'
import { toast } from 'sonner' // ✅ Migrado a Sonner

// ✅ Ahora recibe la faseActualGlobal como segundo parámetro
export const useFases = (procesoId, faseActualGlobal) => {
  const [fases, setFases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // ✅ Inicializa con la fase global
  const [expandedFase, setExpandedFase] = useState(faseActualGlobal)

  // ✅ EFECTO CLAVE: Si el proceso global avanza o retrocede, 
  // forzamos al acordeón a saltar a la nueva fase automáticamente.
  useEffect(() => {
    if (faseActualGlobal) {
      setExpandedFase(faseActualGlobal)
    }
  }, [faseActualGlobal])

  const fetchFases = useCallback(async () => {
    if (!procesoId) return

    try {
      setLoading(true)
      setError(null)
      const { data } = await fasesAPI.listByProceso(procesoId)
      
      setFases(data.data || []) 
    } catch (err) {
      setError(err)
      toast.error("Error al cargar fases", { // ✅ Sintaxis Sonner
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