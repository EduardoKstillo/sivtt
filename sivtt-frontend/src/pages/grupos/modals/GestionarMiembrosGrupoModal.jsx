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
import { Badge } from '@components/ui/badge'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Search, UserX, Star, Info } from 'lucide-react'
import { gruposAPI } from '@api/endpoints/grupos'
import { usersAPI } from '@api/endpoints/users'
import { toast } from '@components/ui/use-toast'

const ROLES = [
  { value: 'LIDER', label: '⭐ Líder' },
  { value: 'INVESTIGADOR', label: '🔬 Investigador' },
  { value: 'ASISTENTE', label: '📚 Asistente' }
]

export const GestionarMiembrosGrupoModal = ({ open, onOpenChange, grupo, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [search, setSearch] = useState('')
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [rol, setRol] = useState('')

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

  const getUsuariosDisponibles = () => {
    const idsMiembros = grupo.miembros?.map(m => m.usuarioId) || []
    const disponibles = usuarios.filter(u => !idsMiembros.includes(u.id))

    if (search.trim()) {
      return disponibles.filter(u => 
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    return disponibles
  }

  const handleAgregarMiembro = async () => {
    if (!selectedUsuario || !rol) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Seleccione un usuario y un rol"
      })
      return
    }

    setLoading(true)

    try {
      await gruposAPI.addMiembro(grupo.id, {
        usuarioId: selectedUsuario.id,
        rolGrupo: rol
      })

      toast({
        title: "Miembro agregado",
        description: `${selectedUsuario.nombre} fue agregado al grupo`
      })

      onSuccess()
      setSelectedUsuario(null)
      setRol('')
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

  const handleRemoverMiembro = async (usuarioId) => {
    if (!confirm('¿Está seguro de remover este miembro del grupo?')) return

    setLoading(true)

    try {
      await gruposAPI.removeMiembro(grupo.id, usuarioId)

      toast({
        title: "Miembro removido",
        description: "El miembro fue removido del grupo"
      })

      onSuccess()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al remover",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  const usuariosDisponibles = getUsuariosDisponibles()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Miembros del Grupo</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Miembros Actuales */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">
              Miembros Actuales ({grupo.miembros?.length || 0})
            </h3>

            {!grupo.miembros || grupo.miembros.length === 0 ? (
              <Alert className="bg-gray-50 border-gray-200">
                <AlertDescription className="text-gray-600 text-sm">
                  No hay miembros en este grupo todavía
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {grupo.miembros.map((miembro) => (
                  <div
                    key={miembro.usuarioId}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        {miembro.usuario?.nombre?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {miembro.usuario?.nombre}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {miembro.usuario?.email}
                      </p>
                    </div>

                    <Badge className={
                      miembro.rolGrupo === 'LIDER' 
                        ? 'bg-yellow-100 text-yellow-700'
                        : miembro.rolGrupo === 'INVESTIGADOR'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }>
                      {miembro.rolGrupo === 'LIDER' && '⭐'}
                      {miembro.rolGrupo === 'INVESTIGADOR' && '🔬'}
                      {miembro.rolGrupo === 'ASISTENTE' && '📚'}
                      {' '}
                      {miembro.rolGrupo}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoverMiembro(miembro.usuarioId)}
                      disabled={loading}
                    >
                      <UserX className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Agregar Miembro */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">
              Agregar Nuevo Miembro
            </h3>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                Solo puede haber un líder por grupo. Al asignar un nuevo líder, el actual pasará a investigador.
              </AlertDescription>
            </Alert>

            {/* Search */}
            <div className="space-y-2">
              <Label>Buscar usuario</Label>
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

            {/* Usuarios List */}
            <div className="space-y-2">
              <Label>Usuarios disponibles</Label>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : usuariosDisponibles.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center border border-dashed rounded-lg">
                  {search ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                </p>
              ) : (
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {usuariosDisponibles.map((usuario) => (
                    <button
                      key={usuario.id}
                      type="button"
                      onClick={() => setSelectedUsuario(usuario)}
                      className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        selectedUsuario?.id === usuario.id ? 'bg-purple-50' : ''
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

            {/* Rol */}
            <div className="space-y-2">
              <Label htmlFor="rol">Rol en el grupo</Label>
              <Select
                value={rol}
                onValueChange={setRol}
                disabled={loading}
              >
                <SelectTrigger id="rol">
                  <SelectValue placeholder="Seleccione el rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected */}
            {selectedUsuario && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-900 text-sm">
                  <strong>Seleccionado:</strong> {selectedUsuario.nombre} como {rol}
                </AlertDescription>
              </Alert>
            )}

            {/* Action */}
            <Button
              onClick={handleAgregarMiembro}
              disabled={loading || !selectedUsuario || !rol}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                'Agregar Miembro'
              )}
            </Button>
          </div>
        </div>

        {/* Close */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}