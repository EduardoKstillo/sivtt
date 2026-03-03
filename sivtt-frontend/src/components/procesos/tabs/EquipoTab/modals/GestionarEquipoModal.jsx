import { useState, useEffect, useMemo } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Search, Info, UserPlus, Check } from 'lucide-react'
import { equiposAPI } from '@api/endpoints/equipos'
import { usersAPI } from '@api/endpoints/users'
import { rolesAPI } from '@api/endpoints/roles'
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

const ROL_META = {
  GESTOR_PROCESO: { // <-- Era RESPONSABLE_PROCESO
    label:       'Gestor del Proceso',
    description: 'Dirección y toma de decisiones',
  },
  LIDER_FASE: { // <-- Era APOYO
    label:       'Líder de Fase',
    description: 'Soporte y gestión en actividades de su fase',
  },
  OBSERVADOR_PROCESO: {
    label:       'Observador',
    description: 'Acceso de solo lectura al proceso',
  },
}

const INITIAL_FORM = { usuarioId: null, rolId: '', observaciones: '' }

export const GestionarEquipoModal = ({
  open,
  onOpenChange,
  proceso,
  equipoActual,
  onSuccess,
}) => {
  const [loading, setLoading]           = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [usuarios, setUsuarios]         = useState([])
  const [rolesProceso, setRoles]        = useState([])
  const [search, setSearch]             = useState('')
  const [formData, setFormData]         = useState(INITIAL_FORM)

  useEffect(() => {
    if (!open) return
    setFormData(INITIAL_FORM)
    setSearch('')
    fetchUsuarios()
    fetchRoles()
  }, [open])

  const fetchUsuarios = async () => {
    setLoadingUsers(true)
    try {
      const { data } = await usersAPI.list({ activo: true, limit: 200 })
      setUsuarios(data.data.usuarios || [])
    } catch {
      toast({ variant: 'destructive', title: 'Error al cargar usuarios' })
    } finally {
      setLoadingUsers(false)
    }
  }

  // ✅ Carga roles de ámbito PROCESO dinámicamente — no hardcodeados
  const fetchRoles = async () => {
    setLoadingRoles(true)
    try {
      const { data } = await rolesAPI.listByAmbito('PROCESO')
      setRoles(data.data || [])
    } catch {
      toast({ variant: 'destructive', title: 'Error al cargar roles' })
    } finally {
      setLoadingRoles(false)
    }
  }

  // Excluir usuarios ya presentes en el equipo
  const usuariosDisponibles = useMemo(() => {
    // equipoActual viene normalizado del useEquipo: cada elemento tiene usuarioId
    const idsEnEquipo = new Set(equipoActual.map(m => m.usuarioId))
    let filtered = usuarios.filter(u => !idsEnEquipo.has(u.id))

    if (search.trim()) {
      const term = search.toLowerCase()
      filtered = filtered.filter(u =>
        u.nombres.toLowerCase().includes(term) ||
        u.apellidos.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      )
    }
    return filtered.slice(0, 10)
  }, [usuarios, equipoActual, search])

  const usuarioSeleccionado = usuarios.find(u => u.id === formData.usuarioId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.usuarioId || !formData.rolId) {
      toast({ variant: 'destructive', title: 'Selecciona un usuario y un rol' })
      return
    }

    setLoading(true)
    try {
      // ✅ Envía { usuarioId, rolId: integer } — NO rolProceso string
      await equiposAPI.addMiembro(proceso.id, {
        usuarioId:     formData.usuarioId,
        rolId:         parseInt(formData.rolId, 10),
        // observaciones no está en el schema actual pero lo enviamos
        // por si el backend lo acepta en el futuro
        ...(formData.observaciones && { observaciones: formData.observaciones })
      })

      const rolObj   = rolesProceso.find(r => r.id === parseInt(formData.rolId, 10))
      const rolLabel = ROL_META[rolObj?.codigo]?.label || rolObj?.nombre || 'rol'

      toast({
        title: 'Miembro agregado',
        description: `${usuarioSeleccionado?.nombres} ahora es ${rolLabel} en el proceso`
      })
      onSuccess()
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Agregar Miembro al Equipo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-muted-foreground text-xs">
              El rol determina los permisos del miembro en este proceso específico.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ── Búsqueda de usuario ─────────────────────────── */}
            <div className="space-y-3">
              <Label className="text-sm">Seleccionar Usuario</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="pl-9 h-9"
                  disabled={loading}
                />
              </div>

              <div className="border border-border rounded-lg h-[220px] overflow-y-auto bg-muted/20 p-1">
                {loadingUsers ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : usuariosDisponibles.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center px-4">
                    {search
                      ? 'No se encontraron usuarios'
                      : 'Todos los usuarios disponibles ya están en el equipo'}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {usuariosDisponibles.map(user => {
                      const isSelected = formData.usuarioId === user.id
                      return (
                        <div
                          key={user.id}
                          onClick={() => setFormData(p => ({ ...p, usuarioId: user.id }))}
                          className={cn(
                            'p-2.5 rounded-md cursor-pointer transition-all flex items-center justify-between',
                            isSelected
                              ? 'bg-primary/10 ring-1 ring-primary/20'
                              : 'hover:bg-muted/50'
                          )}
                        >
                          <div className="min-w-0">
                            <p className={cn(
                              'text-sm font-medium truncate',
                              isSelected ? 'text-primary' : 'text-foreground'
                            )}>
                              {user.nombres} {user.apellidos}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Configuración ───────────────────────────────── */}
            <div className="space-y-4 bg-muted/30 dark:bg-muted/20 rounded-lg p-4 border border-border">
              {/* Usuario seleccionado */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1.5">
                  Usuario seleccionado
                </p>
                {usuarioSeleccionado ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-medium text-sm text-foreground">
                      {usuarioSeleccionado.nombres} {usuarioSeleccionado.apellidos}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Ninguno seleccionado</p>
                )}
              </div>

              {/* Rol */}
              <div className="space-y-2">
                <Label className="text-sm">
                  Rol en el proceso <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.rolId}
                  onValueChange={v => setFormData(p => ({ ...p, rolId: v }))}
                  disabled={loading || loadingRoles}
                >
                  <SelectTrigger className="h-9 bg-card">
                    <SelectValue placeholder={
                      loadingRoles ? 'Cargando roles...' : 'Seleccione un rol'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesProceso.map(rol => {
                      const meta = ROL_META[rol.codigo] || {}
                      return (
                        <SelectItem key={rol.id} value={rol.id.toString()}>
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-sm">
                              {meta.label || rol.nombre}
                            </span>
                            {(meta.description || rol.descripcion) && (
                              <span className="text-[11px] text-muted-foreground">
                                {meta.description || rol.descripcion}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Notas opcionales */}
              <div className="space-y-2">
                <Label className="text-sm">Notas (opcional)</Label>
                <Textarea
                  rows={3}
                  placeholder="Responsabilidades específicas..."
                  value={formData.observaciones}
                  onChange={e => setFormData(p => ({ ...p, observaciones: e.target.value }))}
                  disabled={loading}
                  className="bg-card resize-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
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
              disabled={loading || !formData.usuarioId || !formData.rolId}
              className="gap-1.5"
            >
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <UserPlus className="h-4 w-4" />
              }
              {loading ? 'Agregando...' : 'Agregar al Equipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}