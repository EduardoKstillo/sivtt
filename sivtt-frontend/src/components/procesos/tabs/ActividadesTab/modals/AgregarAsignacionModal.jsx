import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, AlertCircle, Search, UserPlus } from 'lucide-react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { usersAPI } from '@api/endpoints/users' // Asegúrate de que este endpoint exista
import { toast } from '@components/ui/use-toast'

export const AgregarAsignacionModal = ({ open, onOpenChange, actividad, asignacionesActuales, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [search, setSearch] = useState('')
  const [rol, setRol] = useState('')
  const [selectedUsuario, setSelectedUsuario] = useState(null)

  // Cargar usuarios al abrir
  useEffect(() => {
    if (open) {
      fetchUsuarios()
      // Reset state
      setSearch('')
      setRol('')
      setSelectedUsuario(null)
    }
  }, [open])

  const fetchUsuarios = async () => {
    setLoadingUsers(true)
    try {
      // Necesitas un endpoint que liste todos los usuarios activos
      const { data } = await usersAPI.list({ activo: true, limit: 100 }) 
      setUsuarios(data.data.usuarios || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      toast({ variant: "destructive", title: "Error al cargar lista de usuarios" })
    } finally {
      setLoadingUsers(false)
    }
  }

  // Filtrar usuarios disponibles (no asignados ya)
  const getUsuariosDisponibles = () => {
    // Extraer IDs de usuarios ya asignados en esta actividad
    // Nota: 'asignacionesActuales' viene de getById, estructura: { usuario: { id: ... } }
    const idsAsignados = asignacionesActuales.map(a => a.usuario.id)
    
    let disponibles = usuarios.filter(u => !idsAsignados.includes(u.id))

    if (search.trim()) {
      const term = search.toLowerCase()
      disponibles = disponibles.filter(u => 
        u.nombres.toLowerCase().includes(term) ||
        u.apellidos.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      )
    }

    return disponibles.slice(0, 10) // Limitar resultados visuales
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedUsuario || !rol) return

    setLoading(true)
    try {
      await actividadesAPI.assignUser(actividad.id, {
        usuarioId: selectedUsuario.id,
        rol
      })

      toast({
        title: "Usuario asignado",
        description: `${selectedUsuario.nombres} fue asignado como ${rol}`
      })

      onSuccess()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al asignar",
        description: error.response?.data?.message || "Hubo un problema al asignar el usuario"
      })
    } finally {
      setLoading(false)
    }
  }

  const usuariosFiltrados = getUsuariosDisponibles()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Asignar Usuario
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Rol Selection */}
          <div className="space-y-2">
            <Label>Rol en la actividad</Label>
            <Select value={rol} onValueChange={setRol} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESPONSABLE">👤 Responsable (Ejecuta)</SelectItem>
                <SelectItem value="REVISOR">🔍 Revisor (Aprueba/Observa)</SelectItem>
                <SelectItem value="PARTICIPANTE">👥 Participante (Apoyo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Search & Selection */}
          <div className="space-y-2">
            <Label>Buscar Usuario</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nombre o email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Lista de Resultados */}
            <div className="border rounded-md max-h-[200px] overflow-y-auto mt-2 bg-white">
              {loadingUsers ? (
                <div className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-500" /></div>
              ) : usuariosFiltrados.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {search ? 'No se encontraron usuarios' : 'Todos los usuarios ya están asignados'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {usuariosFiltrados.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUsuario(user)}
                      className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between ${
                        selectedUsuario?.id === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.nombres} {user.apellidos}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      {selectedUsuario?.id === user.id && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading || !selectedUsuario || !rol}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar Asignación
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}