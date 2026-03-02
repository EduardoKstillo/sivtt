import { useState, useEffect, useCallback } from 'react'
import { procesosAPI } from '@api/endpoints/procesos'
import { toast } from '@components/ui/use-toast'

/**
 * Hook para el equipo de un proceso.
 *
 * El backend (ProcesoService.getById) retorna usuarios con esta forma:
 *
 *   usuarios: [
 *     {
 *       id: number,
 *       nombres: string,
 *       apellidos: string,
 *       email: string,
 *       rol: { id: number, codigo: string, nombre: string }
 *     }
 *   ]
 *
 * IMPORTANTE:
 *  - No existe 'rolProceso' string — todo viene en el objeto `rol`
 *  - No existe 'usuarioId' por separado — el id del usuario está en `u.id`
 *  - No existe 'usuario.nombre' combinado — son 'u.nombres' y 'u.apellidos'
 *
 * Para consistencia con AsignacionesManager (que usa asignacion.usuario.id),
 * normalizamos a { usuarioId, usuario: { id, nombres, apellidos, email }, rol }
 */
export const useEquipo = (procesoId) => {
  const [equipo, setEquipo]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchEquipo = useCallback(async () => {
    if (!procesoId) return
    setLoading(true)
    setError(null)
    try {
      // Reutilizamos getById porque el backend no tiene un endpoint dedicado
      // GET /procesos/:id/usuarios — si lo añades en el futuro, cambia esto
      // por: equiposAPI.getEquipo(procesoId)
      const { data } = await procesosAPI.getById(procesoId)

      // data.data.usuarios viene como:
      // [{ id, nombres, apellidos, email, rol: { id, codigo, nombre } }]
      const normalizado = (data.data.usuarios || []).map(u => ({
        usuarioId: u.id,
        usuario: {
          id:        u.id,
          nombres:   u.nombres,
          apellidos: u.apellidos,
          email:     u.email,
        },
        rol:        u.rol,         // { id, codigo, nombre }
        asignadoAt: u.asignadoAt,  // puede ser undefined si el backend no lo expone aquí
      }))

      setEquipo(normalizado)
    } catch (err) {
      setError(err)
      toast({
        variant: 'destructive',
        title: 'Error al cargar equipo',
        description: err.response?.data?.message || 'Error inesperado'
      })
    } finally {
      setLoading(false)
    }
  }, [procesoId])

  useEffect(() => { fetchEquipo() }, [fetchEquipo])

  return { equipo, loading, error, refetch: fetchEquipo }
}