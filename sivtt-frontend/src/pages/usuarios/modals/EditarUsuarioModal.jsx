import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Checkbox } from '@components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { usersAPI } from '@api/endpoints/users'
import { toast } from '@components/ui/use-toast'

export const EditarUsuarioModal = ({
  open,
  onOpenChange,
  usuario,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    roles: [],
  })

  /**
   * Cargar roles + datos del usuario
   */
  useEffect(() => {
    if (!open || !usuario) return

    const loadData = async () => {
      try {
        const res = await usersAPI.getRoles()
        setRoles(res.data.data)

        setFormData({
          nombres: usuario.nombres || '',
          apellidos: usuario.apellidos || '',
          roles: usuario.roles?.map((r) => r.id) || [],
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los datos',
        })
      }
    }

    loadData()
  }, [open, usuario])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleRol = (rolId) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(rolId)
        ? prev.roles.filter((id) => id !== rolId)
        : [...prev.roles, rolId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.nombres ||
      !formData.apellidos ||
      formData.roles.length === 0
    ) {
      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Complete todos los campos obligatorios',
      })
      return
    }

    setLoading(true)

    try {
      await usersAPI.update(usuario.id, {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        roles: formData.roles,
      })

      toast({
        title: 'Usuario actualizado',
        description: 'Los cambios fueron guardados correctamente',
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description:
          error.response?.data?.message || 'Intente nuevamente',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!usuario) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifique la información y roles del usuario seleccionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (solo lectura) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={usuario.email}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* Nombres */}
          <div className="space-y-2">
            <Label>
              Nombres <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.nombres}
              onChange={(e) =>
                handleChange('nombres', e.target.value)
              }
              disabled={loading}
            />
          </div>

          {/* Apellidos */}
          <div className="space-y-2">
            <Label>
              Apellidos <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.apellidos}
              onChange={(e) =>
                handleChange('apellidos', e.target.value)
              }
              disabled={loading}
            />
          </div>

          {/* Roles */}
          <div className="space-y-3">
            <Label>
              Roles <span className="text-red-500">*</span>
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.isArray(roles) &&
                roles.map((rol) => (
                  <label
                    key={rol.id}
                    className="flex gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={formData.roles.includes(rol.id)}
                      onCheckedChange={() =>
                        toggleRol(rol.id)
                      }
                    />
                    <div>
                      <p className="font-medium">{rol.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {rol.codigo}
                      </p>
                    </div>
                  </label>
                ))}
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
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
