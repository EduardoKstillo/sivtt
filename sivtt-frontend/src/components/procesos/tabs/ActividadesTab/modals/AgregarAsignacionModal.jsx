import { useState, useEffect, useMemo } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@components/ui/select'
import { Loader2, Search, UserPlus, Check } from 'lucide-react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { usersAPI } from '@api/endpoints/users' 
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

export const AgregarAsignacionModal = ({ open, onOpenChange, actividad, asignacionesActuales, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [search, setSearch] = useState('')
  const [rol, setRol] = useState('')
  const [selectedUsuario, setSelectedUsuario] = useState(null)

  useEffect(() => {
    if (open) {
      fetchUsuarios()
      setSearch('')
      setRol('')
      setSelectedUsuario(null)
    }
  }, [open])

  const fetchUsuarios = async () => {
    setLoadingUsers(true)
    try {
      const { data } = await usersAPI.list({ activo: true })
      setUsuarios(data.data?.usuarios || data || [])
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "Error al cargar usuarios" })
    } finally {
      setLoadingUsers(false)
    }
  }

  const usuariosDisponibles = useMemo(() => {
    const idsAsignados = new Set(asignacionesActuales.map(a => a.usuario.id))
    let filtered = usuarios.filter(u => !idsAsignados.has(u.id))

    if (search.trim()) {
      const term = search.toLowerCase()
      filtered = filtered.filter(u => 
        u.nombres.toLowerCase().includes(term) ||
        u.apellidos.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      )
    }

    return filtered.slice(0, 10)
  }, [usuarios, asignacionesActuales, search])

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
        description: `${selectedUsuario.nombres} ahora es ${rol.toLowerCase()}`
      })
      onSuccess()
    } catch (error) {
      toast({ variant: "destructive", title: "Error al asignar", description: error.response?.data?.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Asignar Usuario
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection */}
          <div className="space-y-2">
            <Label className="text-xs">Rol</Label>
            <Select value={rol} onValueChange={setRol} disabled={loading}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Seleccione función..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESPONSABLE">
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-sm">Responsable</span>
                    <span className="text-[11px] text-muted-foreground">Sube evidencias y gestiona</span>
                  </div>
                </SelectItem>
                <SelectItem value="REVISOR">
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-sm">Revisor</span>
                    <span className="text-[11px] text-muted-foreground">Aprueba o rechaza entregables</span>
                  </div>
                </SelectItem>
                <SelectItem value="PARTICIPANTE">
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-sm">Participante</span>
                    <span className="text-[11px] text-muted-foreground">Solo visualización y reuniones</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User search */}
          <div className="space-y-2">
            <Label className="text-xs">Usuario</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* User list */}
            <div className="border border-border rounded-lg h-[220px] overflow-y-auto bg-muted/20 p-1">
              {loadingUsers ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : usuariosDisponibles.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center px-4">
                  {search ? 'No se encontraron usuarios' : 'Todos los usuarios disponibles ya están asignados'}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {usuariosDisponibles.map(user => {
                    const isSelected = selectedUsuario?.id === user.id
                    return (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUsuario(user)}
                        className={cn(
                          "p-2.5 rounded-md cursor-pointer transition-all flex items-center justify-between",
                          isSelected 
                            ? "bg-primary/10 ring-1 ring-primary/20" 
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {user.nombres} {user.apellidos}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedUsuario || !rol}
              className="gap-1.5"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Asignar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}