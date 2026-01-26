import { useState, useEffect } from 'react'
import { fasesAPI } from '@api/endpoints/fases'
import { toast } from '@components/ui/use-toast'

export const useFaseDetail = (procesoId, fase, isExpanded) => {
  const [faseDetail, setFaseDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFaseDetail = async () => {
      if (!procesoId || !fase || !isExpanded) return

      try {
        setLoading(true)
        setError(null)
        const { data } = await fasesAPI.getByFase(procesoId, fase)
        setFaseDetail(data.data)
      } catch (err) {
        setError(err)
        toast({
          variant: "destructive",
          title: "Error al cargar detalle de fase",
          description: err.response?.data?.message || "Error inesperado"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFaseDetail()
  }, [procesoId, fase, isExpanded])

  return {
    faseDetail,
    loading,
    error
  }
}