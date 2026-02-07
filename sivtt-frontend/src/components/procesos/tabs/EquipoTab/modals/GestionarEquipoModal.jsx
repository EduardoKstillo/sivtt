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
import { Textarea } from '@components/ui/textarea' // Aunque ProcesoService.assignUsuario no guarda observaciones, lo dejamos por si acaso
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Search, Info, UserPlus } from 'lucide-react'
import { equiposAPI } from '@api/endpoints/equipos'
import { usersAPI } from '@api/endpoints/users' // ✅ Usamos la API de usuarios real
import { toast } from '@components/ui/use-toast'

const ROLES = [
  { value: 'RESPONSABLE_PROCESO', label: '⭐ Responsable del Proceso' },
  { value: 'APOYO', label: '🤝 Apoyo' },
  { value: 'OBSERVADOR', label: '👁️ Observador' }
]

export const GestionarEquipoModal = ({ open, onOpenChange, proceso, equipoActual, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    usuarioId: null,
    rolProceso: '',
    observaciones: ''
  })

  // Cargar lista de usuarios del sistema
  useEffect(() => {
    if (open) {
      fetchUsuarios()
    }
  }, [open])

  const fetchUsuarios = async () => {
    setLoadingUsers(true)
    try {
      // Pedimos usuarios activos
      const { data } = await usersAPI.list({ activo: true, limit: 100 })
      setUsuarios(data.data.usuarios || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      toast({ variant: "destructive", title: "No se pudieron cargar los usuarios" })
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSelectUsuario = (usuario) => {
    setFormData(prev => ({ ...prev, usuarioId: usuario.id }))
  }

  const getUsuariosDisponibles = () => {
    // Filtrar usuarios que YA están en el equipo
    const idsEnEquipo = equipoActual.map(m => m.usuarioId)
    
    let disponibles = usuarios.filter(u => !idsEnEquipo.includes(u.id))

    // Filtro de búsqueda local
    if (search.trim()) {
      const term = search.toLowerCase()
      disponibles = disponibles.filter(u => 
        u.nombres.toLowerCase().includes(term) ||
        u.apellidos.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      )
    }

    return disponibles.slice(0, 10) // Mostrar máx 10
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.usuarioId || !formData.rolProceso) {
      toast({
        variant: "destructive",
        title: "Datos incompletos",
        description: "Seleccione un usuario y un rol"
      })
      return
    }

    setLoading(true)

    try {
      await equiposAPI.addMiembro(proceso.id, {
        usuarioId: formData.usuarioId,
        rolProceso: formData.rolProceso
        // Nota: ProcesoService.assignUsuario no parece recibir 'observaciones' en tu backend, 
        // pero lo enviamos por si se implementa.
      })

      toast({
        title: "Miembro agregado",
        description: "El usuario se ha unido al equipo exitosamente"
      })

      onSuccess()
      // Reset
      setFormData({ usuarioId: null, rolProceso: '', observaciones: '' })
      setSearch('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al agregar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  const usuarioSeleccionado = usuarios.find(u => u.id === formData.usuarioId)
  const usuariosDisponibles = getUsuariosDisponibles()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Agregar Miembro al Equipo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Selección de Usuario */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Buscar usuario</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nombre o email..."
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Resultados disponibles</Label>
                {loadingUsers ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin h-5 w-5 text-gray-400"/></div>
                ) : usuariosDisponibles.length === 0 ? (
                  <div className="p-4 text-center border border-dashed rounded bg-gray-50 text-sm text-gray-500">
                    {search ? 'No se encontraron usuarios' : 'Todos los usuarios disponibles ya están en el equipo'}
                  </div>
                ) : (
                  <div className="border rounded-md max-h-60 overflow-y-auto bg-white">
                    {usuariosDisponibles.map((usuario) => (
                      <div
                        key={usuario.id}
                        onClick={() => handleSelectUsuario(usuario)}
                        className={`p-3 cursor-pointer hover:bg-blue-50 border-b last:border-0 flex justify-between items-center ${
                          formData.usuarioId === usuario.id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {usuario.nombres} {usuario.apellidos}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Configuración */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <Label>Usuario Seleccionado</Label>
                {usuarioSeleccionado ? (
                  <div className="mt-1 font-medium text-blue-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"/>
                    {usuarioSeleccionado.nombres} {usuarioSeleccionado.apellidos}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-400 italic">Ninguno seleccionado</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rolProceso">Rol en el proceso</Label>
                <Select
                  value={formData.rolProceso}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, rolProceso: val }))}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Notas (Opcional)</Label>
                <Textarea
                  id="observaciones"
                  className="bg-white"
                  rows={3}
                  placeholder="Responsabilidades específicas..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.usuarioId || !formData.rolProceso} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Agregar al Equipo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}