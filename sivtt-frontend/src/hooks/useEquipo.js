import { useState, useEffect, useCallback } from 'react'
import { procesosAPI } from '@api/endpoints/procesos' // Usamos la API de procesos
import { toast } from '@components/ui/use-toast'

export const useEquipo = (procesoId) => {
  const [equipo, setEquipo] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEquipo = useCallback(async () => {
    if (!procesoId) return

    try {
      setLoading(true)
      setError(null)
      // Reutilizamos el endpoint de detalle del proceso que ya trae los usuarios
      const { data } = await procesosAPI.getById(procesoId)
      
      // El backend devuelve: usuarios: [{ usuario: {...}, rolProceso: '...' }]
      // Lo transformamos para que sea fácil de usar en la UI
      const miembrosFormateados = (data.data.usuarios || []).map(u => ({
        usuarioId: u.id, // ID del usuario
        usuario: {
          nombre: `${u.nombres} ${u.apellidos}`,
          email: u.email
        },
        rolProceso: u.rolProceso
      }))

      setEquipo(miembrosFormateados)
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error al cargar equipo",
        description: err.response?.data?.message || "Error inesperado"
      })
    } finally {
      setLoading(false)
    }
  }, [procesoId])

  useEffect(() => {
    fetchEquipo()
  }, [fetchEquipo])

  return {
    equipo,
    loading,
    error,
    refetch: fetchEquipo
  }
}