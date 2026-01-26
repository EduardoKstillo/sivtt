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
import { Textarea } from '@components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Search, Info } from 'lucide-react'
import { equiposAPI } from '@api/endpoints/equipos'
import { usersAPI } from '@api/endpoints/users'
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

  useEffect(() => {
    if (open) {
      fetchUsuarios()
    }
  }, [open])

  const fetchUsuarios = async () => {
    setLoadingUsers(true)
    try {
      const { data } = await usersAPI.list({ activo: true })
      setUsuarios(data.data.usuarios || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectUsuario = (usuario) => {
    setFormData(prev => ({ ...prev, usuarioId: usuario.id }))
  }

  const getUsuariosDisponibles = () => {
    // Filtrar usuarios ya en el equipo
    const idsEquipo = equipoActual.map(m => m.usuarioId)
    const disponibles = usuarios.filter(u => !idsEquipo.includes(u.id))

    // Filtrar por búsqueda
    if (search.trim()) {
      return disponibles.filter(u => 
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    return disponibles
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.usuarioId || !formData.rolProceso) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Seleccione un usuario y un rol"
      })
      return
    }

    setLoading(true)

    try {
      await equiposAPI.addMiembro(proceso.id, {
        usuarioId: formData.usuarioId,
        rolProceso: formData.rolProceso,
        observaciones: formData.observaciones.trim() || undefined
      })

      toast({
        title: "Miembro agregado",
        description: "El miembro fue agregado al equipo exitosamente"
      })

      onSuccess()
      setFormData({
        usuarioId: null,
        rolProceso: '',
        observaciones: ''
      })
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Miembro al Equipo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              Los miembros del equipo tendrán acceso al proceso según su rol asignado.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Selección de Usuario */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Buscar usuario <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Usuarios disponibles</Label>
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : usuariosDisponibles.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center border border-dashed rounded-lg">
                    {search ? 'No se encontraron usuarios' : 'Todos los usuarios ya están en el equipo'}
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    {usuariosDisponibles.map((usuario) => (
                      <button
                        key={usuario.id}
                        type="button"
                        onClick={() => handleSelectUsuario(usuario)}
                        className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          formData.usuarioId === usuario.id ? 'bg-blue-50' : ''
                        }`}
                        disabled={loading}
                      >
                        <p className="font-medium text-gray-900">{usuario.nombre}</p>
                        <p className="text-xs text-gray-500">{usuario.email}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {usuarioSeleccionado && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-900 text-sm">
                    <strong>Seleccionado:</strong> {usuarioSeleccionado.nombre}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Right: Datos del Miembro */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rolProceso">
                  Rol en el proceso <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.rolProceso}
                  onValueChange={(value) => handleChange('rolProceso', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="rolProceso">
                    <SelectValue placeholder="Seleccione el rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(rol => (
                      <SelectItem key={rol.value} value={rol.value}>
                        {rol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleChange('observaciones', e.target.value)}
                  placeholder="Detalles sobre las responsabilidades del miembro..."
                  rows={6}
                  maxLength={500}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 text-right">
                  {formData.observaciones.length}/500
                </p>
              </div>

              {/* Rol Description */}
              {formData.rolProceso && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  {formData.rolProceso === 'RESPONSABLE_PROCESO' && (
                    <>
                      <strong className="text-blue-900">Responsable del Proceso:</strong>
                      <p className="text-blue-800 mt-1">
                        Lidera el proceso, toma decisiones clave y coordina al equipo.
                      </p>
                    </>
                  )}
                  {formData.rolProceso === 'APOYO' && (
                    <>
                      <strong className="text-blue-900">Apoyo:</strong>
                      <p className="text-blue-800 mt-1">
                        Brinda soporte técnico y administrativo en las actividades del proceso.
                      </p>
                    </>
                  )}
                  {formData.rolProceso === 'OBSERVADOR' && (
                    <>
                      <strong className="text-blue-900">Observador:</strong>
                      <p className="text-blue-800 mt-1">
                        Tiene acceso de solo lectura para seguimiento del proceso.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.usuarioId || !formData.rolProceso}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                'Agregar al Equipo'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}