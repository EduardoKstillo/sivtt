import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@components/ui/select'
import { Loader2, UserCheck } from 'lucide-react'
import { fasesAPI } from '@api/endpoints/fases'
import { toast } from '@components/ui/use-toast'

export const AsignarLiderFaseModal = ({ open, onOpenChange, proceso, fase, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  
  // Inicializamos con el ID del responsable actual si existe (pasado a string para el Select)
  const [selectedUserId, setSelectedUserId] = useState(fase?.responsable?.id?.toString() || '')

  if (!proceso || !fase) return null

  // Filtramos usuarios únicos del equipo del proceso (un usuario puede tener varios roles, quitamos duplicados)
  const equipoUnico = Array.from(
    new Map(proceso.usuarios?.map(u => [u.id, u])).values()
  )

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedUserId) {
      toast({ variant: "destructive", title: "Selección requerida", description: "Debe seleccionar un usuario." })
      return
    }

    setLoading(true)
    try {
      await fasesAPI.update(fase.id, {
        responsableId: parseInt(selectedUserId)
      })

      toast({
        title: "Líder de fase actualizado",
        description: "Los permisos ReBAC se han delegado correctamente."
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al asignar líder",
        description: error.response?.data?.message || "Intente nuevamente"
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
          <DialogDescription>
            Selecciona al miembro del equipo que será responsable de la fase actual. Obtendrá el rol de <strong className="text-foreground">LIDER_FASE</strong> temporalmente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="responsable">Miembro del Equipo <span className="text-destructive">*</span></Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={loading}
            >
              <SelectTrigger id="responsable">
                <SelectValue placeholder="Seleccione un usuario del equipo..." />
              </SelectTrigger>
              <SelectContent>
                {equipoUnico.map((miembro) => (
                  <SelectItem key={miembro.id} value={miembro.id.toString()}>
                    {miembro.nombres} {miembro.apellidos}
                  </SelectItem>
                ))}
                {equipoUnico.length === 0 && (
                  <SelectItem value="empty" disabled>
                    No hay miembros en el equipo
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1">
              * Si la persona no aparece, primero debes agregarla en la pestaña "Equipo".
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !selectedUserId} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar Asignación
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}