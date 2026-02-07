import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Info } from 'lucide-react'
import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from '@components/ui/use-toast'

const ROLES = [
  { value: 'INTERESADA', label: '💡 Interesada', desc: 'Empresa en fase de exploración' },
  { value: 'ALIADA', label: '🤝 Aliada', desc: 'Comprometida con el desarrollo' },
  { value: 'FINANCIADORA', label: '💰 Financiadora', desc: 'Aporta recursos económicos' }
]

export const CambiarRolEmpresaModal = ({
  open,
  onOpenChange,
  empresa,
  proceso,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [nuevoRol, setNuevoRol] = useState('')

  // 🔹 Inicializar nuevoRol cuando se abre el modal
  useEffect(() => {
    if (empresa && open) {
      setNuevoRol(empresa.rolEmpresa || '')
    }
  }, [empresa, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!empresa) return

    if (nuevoRol === empresa.rolEmpresa) {
      toast({
        variant: "destructive",
        title: "Sin cambios",
        description: "Debe seleccionar un rol diferente"
      })
      return
    }

    setLoading(true)
    try {
      await empresasAPI.updateVinculacion(proceso.id, empresa.id, { rolEmpresa: nuevoRol })

      toast({
        title: "Rol actualizado",
        description: `El rol cambió de ${empresa.rolEmpresa} a ${nuevoRol}`
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cambiar rol",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!empresa) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Cambiar Rol de la Empresa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              El cambio de rol refleja la evolución del compromiso de la empresa con el proyecto.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Rol actual</Label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">
                {ROLES.find(r => r.value === empresa.rolEmpresa)?.label || 'Sin rol'}
              </p>
              <p className="text-sm text-gray-600">
                {ROLES.find(r => r.value === empresa.rolEmpresa)?.desc || ''}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nuevoRol">
              Nuevo rol <span className="text-red-500">*</span>
            </Label>
            <Select
              value={nuevoRol}
              onValueChange={setNuevoRol}
              disabled={loading}
            >
              <SelectTrigger id="nuevoRol">
                <SelectValue placeholder="Seleccione el nuevo rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(rol => (
                  <SelectItem key={rol.value} value={rol.value}>
                    <div>
                      <p>{rol.label}</p>
                      <p className="text-xs text-gray-500">{rol.desc}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={loading || nuevoRol === empresa.rolEmpresa}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Cambiar Rol'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
