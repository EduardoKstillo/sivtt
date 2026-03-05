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
import { cn } from '@/lib/utils'

// Etiquetas sin emojis — consistente con el resto del sistema
const ROLES = [
  { value: 'LIDER',        label: 'Líder'        },
  { value: 'INVESTIGADOR', label: 'Investigador'  },
  { value: 'ASISTENTE',    label: 'Asistente'     }
]

// Colores semánticos para el badge de rol
const ROL_BADGE_CLASS = {
  LIDER:        'bg-amber-500/10 text-amber-600 border-amber-500/20',
  INVESTIGADOR: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  ASISTENTE:    'bg-muted text-muted-foreground'
}

export const GestionarMiembrosGrupoModal = ({ open, onOpenChange, grupo, onSuccess }) => {
  const [loading, setLoading]               = useState(false)
  const [loadingUsers, setLoadingUsers]     = useState(false)
  const [usuarios, setUsuarios]             = useState([])
  const [search, setSearch]                 = useState('')
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [rol, setRol]                       = useState('')

  useEffect(() => {
    if (open) fetchUsuarios()
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
    const idsMiembros  = grupo.miembros?.map(m => m.usuarioId) || []
    const disponibles  = usuarios.filter(u => !idsMiembros.includes(u.id))
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
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Seleccione un usuario y un rol'
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
        title: 'Miembro agregado',
        description: `${selectedUsuario.nombre} fue agregado al grupo`
      })
      onSuccess()
      setSelectedUsuario(null)
      setRol('')
      setSearch('')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al agregar',
        description: error.response?.data?.message || 'Intente nuevamente'
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
        title: 'Miembro removido',
        description: 'El miembro fue removido del grupo'
      })
      onSuccess()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al remover',
        description: error.response?.data?.message || 'Intente nuevamente'
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

          {/* ── Columna izquierda: Miembros actuales ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Miembros Actuales ({grupo.miembros?.length || 0})
            </h3>

            {!grupo.miembros || grupo.miembros.length === 0 ? (
              // Vacío — bg-muted/30 border-border del sistema
              <Alert className="bg-muted/30 border-border">
                <AlertDescription className="text-muted-foreground text-sm">
                  No hay miembros en este grupo todavía
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {grupo.miembros.map((miembro) => (
                  <div
                    key={miembro.usuarioId}
                    // bg-card border-border — sin hardcoded white/gray
                    className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
                  >
                    <Avatar className="h-9 w-9">
                      {/* bg-primary/10 text-primary — consistente con avatares del sistema */}
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {miembro.usuario?.nombre?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {miembro.usuario?.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {miembro.usuario?.email}
                      </p>
                    </div>

                    {/* Badge de rol — colores semánticos del sistema */}
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[10px] h-5 shrink-0',
                        ROL_BADGE_CLASS[miembro.rolGrupo] ?? ROL_BADGE_CLASS.ASISTENTE
                      )}
                    >
                      {miembro.rolGrupo === 'LIDER' && (
                        <Star className="h-2.5 w-2.5 mr-1" />
                      )}
                      {miembro.rolGrupo}
                    </Badge>

                    {/* Botón remover — text-destructive en lugar de text-red-600 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoverMiembro(miembro.usuarioId)}
                      disabled={loading}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Columna derecha: Agregar miembro ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Agregar Nuevo Miembro
            </h3>

            {/* Info — patrón bg-primary/5 border-primary/15 del sistema */}
            <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20 py-2.5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-muted-foreground text-xs ml-2">
                Solo puede haber un líder por grupo. Al asignar un nuevo líder, el actual pasará a investigador.
              </AlertDescription>
            </Alert>

            {/* Búsqueda */}
            <div className="space-y-2">
              <Label className="text-sm">Buscar usuario</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="pl-9 h-9 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Lista de usuarios disponibles */}
            <div className="space-y-2">
              <Label className="text-sm">Usuarios disponibles</Label>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  {/* text-muted-foreground en lugar de text-gray-400 */}
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : usuariosDisponibles.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg">
                  {search ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                </p>
              ) : (
                // border-border, bg-muted/20 — sin hardcoded gray
                <div className="border border-border rounded-lg max-h-48 overflow-y-auto bg-muted/20">
                  {usuariosDisponibles.map((usuario) => (
                    <button
                      key={usuario.id}
                      type="button"
                      onClick={() => setSelectedUsuario(usuario)}
                      disabled={loading}
                      className={cn(
                        'w-full p-2.5 text-left transition-colors border-b border-border last:border-b-0',
                        // Seleccionado: bg-primary/5 en lugar de bg-purple-50
                        selectedUsuario?.id === usuario.id
                          ? 'bg-primary/5'
                          : 'hover:bg-muted/60'
                      )}
                    >
                      <p className="text-sm font-medium text-foreground">{usuario.nombre}</p>
                      <p className="text-xs text-muted-foreground">{usuario.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <Label htmlFor="rol" className="text-sm">Rol en el grupo</Label>
              <Select value={rol} onValueChange={setRol} disabled={loading}>
                <SelectTrigger id="rol" className="h-9 text-sm">
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

            {/* Usuario seleccionado — bg-emerald-500/10 consistente con estado "Activo" */}
            {selectedUsuario && (
              <Alert className="bg-emerald-500/10 border-emerald-500/20 py-2.5">
                <AlertDescription className="text-foreground text-xs ml-0">
                  <span className="text-muted-foreground">Seleccionado: </span>
                  <span className="font-medium">{selectedUsuario.nombre}</span>
                  {rol && (
                    <>
                      <span className="text-muted-foreground"> como </span>
                      <span className="font-medium">{rol.toLowerCase()}</span>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Botón agregar — color primario del tema, sin override purple */}
            <Button
              onClick={handleAgregarMiembro}
              disabled={loading || !selectedUsuario || !rol}
              className="w-full gap-1.5"
            >
              {loading
                ? <Loader2 className="animate-spin h-4 w-4" />
                : 'Agregar Miembro'
              }
            </Button>
          </div>
        </div>

        {/* Footer — border-border del sistema */}
        <div className="flex justify-end pt-4 border-t border-border">
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