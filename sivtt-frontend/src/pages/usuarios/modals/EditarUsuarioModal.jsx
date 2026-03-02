import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Checkbox } from '@components/ui/checkbox'
import { Badge } from '@components/ui/badge'
import { Loader2, ShieldCheck } from 'lucide-react'
import { usersAPI } from '@api/endpoints/users'
import { rolesAPI } from '@api/endpoints/roles'
import { ROL_CONFIG_SISTEMA } from '../components/rolConfig'
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

export const EditarUsuarioModal = ({ open, onOpenChange, usuario, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles]     = useState([])
  const [formData, setFormData] = useState({ nombres: '', apellidos: '', roles: [] })

  // ✅ Carga roles de ámbito SISTEMA y prellenado con datos del usuario
  useEffect(() => {
    if (!open || !usuario) return

    Promise.all([
      rolesAPI.listByAmbito('SISTEMA'),
    ]).then(([rolesRes]) => {
      setRoles(rolesRes.data.data || [])
      setFormData({
        nombres:   usuario.nombres  || '',
        apellidos: usuario.apellidos || '',
        // ✅ usuario.roles es array de objetos { id, codigo, nombre }
        roles: usuario.roles?.map(r => r.id) || []
      })
    }).catch(() => {
      toast({ variant: 'destructive', title: 'Error al cargar datos' })
    })
  }, [open, usuario])

  const toggleRol = (rolId) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(rolId)
        ? prev.roles.filter(id => id !== rolId)
        : [...prev.roles, rolId]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nombres || !formData.apellidos) {
      toast({ variant: 'destructive', title: 'Completa nombres y apellidos' })
      return
    }

    if (formData.roles.length === 0) {
      toast({ variant: 'destructive', title: 'Selecciona al menos un rol' })
      return
    }

    setLoading(true)
    try {
      await usersAPI.update(usuario.id, {
        nombres:   formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        roles:     formData.roles
      })
      toast({ title: 'Usuario actualizado correctamente' })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: error.response?.data?.message || 'Intente nuevamente'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!usuario) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica la información y roles de <strong>{usuario.nombres} {usuario.apellidos}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label className="text-sm">Email</Label>
            <Input
              value={usuario.email}
              disabled
              className="bg-muted/50 text-muted-foreground"
            />
          </div>

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Nombres <span className="text-destructive">*</span></Label>
              <Input
                value={formData.nombres}
                onChange={e => setFormData(p => ({ ...p, nombres: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Apellidos <span className="text-destructive">*</span></Label>
              <Input
                value={formData.apellidos}
                onChange={e => setFormData(p => ({ ...p, apellidos: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          {/* Roles */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">
                Roles <span className="text-destructive">*</span>
              </Label>
              {formData.roles.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {formData.roles.length} seleccionado{formData.roles.length !== 1 && 's'}
                </Badge>
              )}
            </div>

            <div className="grid gap-2">
              {roles.map(rol => {
                const cfg = ROL_CONFIG_SISTEMA[rol.codigo] || ROL_CONFIG_SISTEMA.DEFAULT
                const isSelected = formData.roles.includes(rol.id)
                return (
                  <label
                    key={rol.id}
                    className={cn(
                      'flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                      isSelected
                        ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                        : 'border-border hover:bg-muted/50'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRol(rol.id)}
                      className="mt-0.5"
                      disabled={loading}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{rol.nombre}</span>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] h-4 px-1 border font-medium', cfg.className)}
                        >
                          {cfg.label}
                        </Badge>
                      </div>
                      {rol.descripcion && (
                        <p className="text-xs text-muted-foreground mt-0.5">{rol.descripcion}</p>
                      )}
                    </div>
                  </label>
                )
              })}

              {roles.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <ShieldCheck className="h-5 w-5 mx-auto mb-2 text-muted-foreground/40" />
                  Cargando roles...
                </div>
              )}
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
            <Button type="submit" disabled={loading} className="gap-1.5">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}