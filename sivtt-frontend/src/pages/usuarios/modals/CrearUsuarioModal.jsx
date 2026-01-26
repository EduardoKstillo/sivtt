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
import { Alert, AlertDescription } from '@components/ui/alert'
import { Checkbox } from '@components/ui/checkbox'
import { Loader2, Info } from 'lucide-react'
import { usersAPI } from '@api/endpoints/users'
import { toast } from '@components/ui/use-toast'

export const CrearUsuarioModal = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: [],
  })

  useEffect(() => {
    if (!open) return

    const loadRoles = async () => {
      try {
        const res = await usersAPI.getRoles()
        setRoles(res.data.data) // ✅ AQUÍ ESTABA EL ERROR
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error al cargar roles',
          description: 'No se pudieron cargar los roles',
        })
      }
    }

    loadRoles()
  }, [open])

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
      !formData.email ||
      !formData.password ||
      formData.roles.length === 0
    ) {
      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Complete todos los campos obligatorios',
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Contraseñas no coinciden',
        description: 'Las contraseñas deben ser iguales',
      })
      return
    }

    setLoading(true)

    try {
      await usersAPI.create({
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        roles: formData.roles,
      })

      toast({
        title: 'Usuario creado',
        description: 'El usuario fue creado exitosamente',
      })

      onSuccess()
      setFormData({
        nombres: '',
        apellidos: '',
        email: '',
        password: '',
        confirmPassword: '',
        roles: [],
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al crear usuario',
        description:
          error.response?.data?.message || 'Intente nuevamente',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Complete los datos para registrar un nuevo usuario en el sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              El usuario será creado con los roles seleccionados.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Nombres *</Label>
            <Input
              value={formData.nombres}
              onChange={(e) => handleChange('nombres', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Apellidos *</Label>
            <Input
              value={formData.apellidos}
              onChange={(e) => handleChange('apellidos', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contraseña *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Confirmar contraseña *</Label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange('confirmPassword', e.target.value)
                }
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Roles *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.isArray(roles) &&
                roles.map((rol) => (
                  <label
                    key={rol.id}
                    className="flex gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={formData.roles.includes(rol.id)}
                      onCheckedChange={() => toggleRol(rol.id)}
                    />
                    <div>
                      <p className="font-medium">{rol.nombre}</p>
                      <p className="text-xs text-gray-500">{rol.codigo}</p>
                    </div>
                  </label>
                ))}
            </div>
          </div>

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
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
