import { useState, useEffect, useCallback } from 'react'
import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from '@components/ui/use-toast'

export const useEmpresasProceso = (procesoId) => {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEmpresas = useCallback(async () => {
    if (!procesoId) return

    try {
      setLoading(true)
      setError(null)
      const { data } = await empresasAPI.listByProceso(procesoId)
      setEmpresas(data.data || [])
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar empresas",
        description: err.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }, [procesoId])

  useEffect(() => {
    fetchEmpresas()
  }, [fetchEmpresas])

  const empresasActivas = empresas.filter(e => e.estadoVinculacion === 'ACTIVA')
  const empresasRetiradas = empresas.filter(e => e.estadoVinculacion === 'RETIRADA')

  return {
    empresas,
    empresasActivas,
    empresasRetiradas,
    loading,
    error,
    refetch: fetchEmpresas
  }
}