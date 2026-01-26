import { useState, useEffect, useCallback } from 'react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from '@components/ui/use-toast'

export const useActividadDetail = (actividadId) => {
  const [actividad, setActividad] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchActividad = useCallback(async () => {
    if (!actividadId) {
      setActividad(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data } = await actividadesAPI.getById(actividadId)
      setActividad(data.data)
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar actividad",
        description: err.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }, [actividadId])

  useEffect(() => {
    fetchActividad()
  }, [fetchActividad])

  const updateActividad = (updatedData) => {
    setActividad(prev => ({ ...prev, ...updatedData }))
  }

  return {
    actividad,
    loading,
    error,
    refetch: fetchActividad,
    updateActividad
  }
}