import { useState, useEffect, useCallback } from 'react'
import { postulacionesAPI } from '@api/endpoints/postulaciones'
import { toast } from '@components/ui/use-toast'

export const usePostulaciones = (convocatoriaId) => {
  const [postulaciones, setPostulaciones] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPostulaciones = useCallback(async () => {
    if (!convocatoriaId) {
      setPostulaciones([])
      setEstadisticas(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data } = await postulacionesAPI.listByConvocatoria(convocatoriaId)
      
      setPostulaciones(data.data.postulaciones || [])
      setEstadisticas(data.data.estadisticas || null)
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar postulaciones",
        description: err.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }, [convocatoriaId])

  useEffect(() => {
    fetchPostulaciones()
  }, [fetchPostulaciones])

  return {
    postulaciones,
    estadisticas,
    loading,
    error,
    refetch: fetchPostulaciones
  }
}