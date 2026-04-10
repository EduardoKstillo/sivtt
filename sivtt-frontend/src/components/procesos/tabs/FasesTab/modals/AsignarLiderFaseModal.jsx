import { useState, useEffect, useMemo } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Loader2, Search, UserCheck, Check } from 'lucide-react'
import { fasesAPI } from '@api/endpoints/fases'
import { usersAPI } from '@api/endpoints/users'
import { toast } from 'sonner' // ✅ Migrado a Sonner
import { cn } from '@/lib/utils'

export const AsignarLiderFaseModal = ({ open, onOpenChange, proceso, fase, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedUsuario, setSelectedUsuario] = useState(null)

  useEffect(() => {
    if (!open) return
    fetchUsuarios()
    setSearch('')
    
    if (fase?.responsable) {
      setSelectedUsuario(fase.responsable)
    } else {
      setSelectedUsuario(null)
    }
  }, [open, fase])

  const fetchUsuarios = async () => {
    setLoadingUsers(true)
    try {
      const { data } = await usersAPI.getCatalogo()
      setUsuarios(data.data || [])
    } catch {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoadingUsers(false)
    }
  }

  const usuariosDisponibles = useMemo(() => {
    let filtered = usuarios
    
    if (search.trim()) {
      const term = search.toLowerCase()
      filtered = filtered.filter(u =>
        u.nombres?.toLowerCase().includes(term) ||
        u.apellidos?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      )
    }
    return filtered.slice(0, 20)
  }, [usuarios, search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedUsuario) return

    if (fase?.responsable?.id === selectedUsuario.id) {
      toast('Aviso', { description: 'El usuario ya es líder de esta fase' })
      onOpenChange(false)
      return
    }

    setLoading(true)
    try {
      await fasesAPI.update(fase.id, {
        responsableId: selectedUsuario.id
      })

      toast.success('Líder asignado', {
        description: `${selectedUsuario.nombres} ahora es el Líder de Fase.`
      })
      onSuccess()
    } catch (error) {
      toast.error('Error al asignar líder', {
        description: error.response?.data?.message || 'Intente nuevamente'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Asignar Líder de Fase
          </DialogTitle>
          <DialogDescription className="text-sm">
            Selecciona al usuario que será responsable de liderar esta etapa del proceso. Obtendrá el rol temporal de <strong className="text-foreground">LIDER_FASE</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs">Buscar Usuario en el Sistema <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, apellido o correo..."
                className="pl-9 h-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="border border-border rounded-lg h-[240px] overflow-y-auto bg-muted/20 p-1 mt-2">
              {loadingUsers ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : usuariosDisponibles.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center px-4">
                  {search ? 'No se encontraron usuarios' : 'Cargando directorio...'}
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

          <DialogFooter className="pt-2 border-t border-border">
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
              disabled={loading || !selectedUsuario || loadingUsers}
              className="gap-1.5"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar Asignación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}