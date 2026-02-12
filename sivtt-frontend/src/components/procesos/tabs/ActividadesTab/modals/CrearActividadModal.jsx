import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import { Checkbox } from '@components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Plus, Trash2, FileText } from 'lucide-react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from '@components/ui/use-toast'
import { TIPO_ACTIVIDAD, FLUJOS_FASES } from '@utils/constants'

export const CrearEditarActividadModal = ({
  open,
  onOpenChange,
  proceso,
  actividadToEdit,
  onSuccess
}) => {

  const isEditing = !!actividadToEdit
  const [loading, setLoading] = useState(false)

  const initialState = {
    fase: proceso?.faseActual || '',
    tipo: '',
    nombre: '',
    descripcion: '',
    obligatoria: false,
    fechaLimite: ''
  }

  const [formData, setFormData] = useState(initialState)

  const [requisitos, setRequisitos] = useState([
    { nombre: 'Informe Principal', descripcion: '', obligatorio: true }
  ])

  const [errors, setErrors] = useState({})

  const fasesAbiertas =
    FLUJOS_FASES[proceso?.tipoActivo]?.filter(
      (fase) => fase === proceso?.faseActual
    ) || []

  useEffect(() => {
    if (!open) return

    if (isEditing) {
      setFormData({
        fase: actividadToEdit.fase,
        tipo: actividadToEdit.tipo,
        nombre: actividadToEdit.nombre,
        descripcion: actividadToEdit.descripcion || '',
        obligatoria: actividadToEdit.obligatoria,
        fechaLimite: actividadToEdit.fechaLimite
          ? new Date(actividadToEdit.fechaLimite)
              .toISOString()
              .split('T')[0]
          : ''
      })

      if (actividadToEdit.requisitos?.length > 0) {
        setRequisitos(
          actividadToEdit.requisitos.map((r) => ({
            id: r.id,
            nombre: r.nombre,
            descripcion: r.descripcion || '',
            obligatorio: r.obligatorio
          }))
        )
      } else {
        setRequisitos([
          { nombre: 'Informe Principal', descripcion: '', obligatorio: true }
        ])
      }
    } else {
      setFormData({
        ...initialState,
        fase: proceso?.faseActual || ''
      })
      setRequisitos([
        { nombre: 'Informe Principal', descripcion: '', obligatorio: true }
      ])
    }

    setErrors({})
  }, [open, isEditing, actividadToEdit, proceso])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const addRequisito = () => {
    setRequisitos([
      ...requisitos,
      { nombre: '', descripcion: '', obligatorio: true }
    ])
  }

  const removeRequisito = (index) => {
    setRequisitos(requisitos.filter((_, i) => i !== index))
  }

  const updateRequisito = (index, field, value) => {
    const updated = [...requisitos]
    updated[index][field] = value
    setRequisitos(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!formData.fase) newErrors.fase = true
    if (!formData.tipo) newErrors.tipo = true
    if (!formData.nombre) newErrors.nombre = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        variant: 'destructive',
        title: 'Faltan campos requeridos'
      })
      return
    }

    setLoading(true)

    try {
      const requisitosLimpios = requisitos
        .filter((r) => r.nombre.trim() !== '')
        .map((r) => ({
          id: r.id,
          nombre: r.nombre.trim(),
          descripcion: r.descripcion?.trim() || undefined,
          obligatorio: Boolean(r.obligatorio)
        }))

      const payload = {
        ...formData,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || undefined,
        fechaLimite: formData.fechaLimite
          ? new Date(formData.fechaLimite)
          : undefined,
        requisitos: requisitosLimpios
      }

      if (isEditing) {
        await actividadesAPI.update(actividadToEdit.id, payload)
        toast({ title: 'Actividad actualizada correctamente' })
      } else {
        await actividadesAPI.create(proceso.id, payload)
        toast({ title: 'Actividad creada exitosamente' })
      }

      onSuccess()
      onOpenChange(false)

    } catch (error) {
      toast({
        variant: 'destructive',
        title: isEditing ? 'Error al actualizar' : 'Error al crear',
        description: error.response?.data?.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Actividad' : 'Crear Nueva Actividad'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* FASE Y TIPO */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={errors.fase ? 'text-destructive' : ''}>
                Fase *
              </Label>
              <Select
                value={formData.fase}
                onValueChange={(v) => handleChange('fase', v)}
                disabled={isEditing}
              >
                <SelectTrigger className={errors.fase ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  {fasesAbiertas.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={errors.tipo ? 'text-destructive' : ''}>
                Tipo *
              </Label>
              <Select
                value={formData.tipo}
                onValueChange={(v) => handleChange('tipo', v)}
              >
                <SelectTrigger className={errors.tipo ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TIPO_ACTIVIDAD.DOCUMENTO}>Documento</SelectItem>
                  <SelectItem value={TIPO_ACTIVIDAD.TAREA}>Tarea</SelectItem>
                  <SelectItem value={TIPO_ACTIVIDAD.REUNION}>Reunión</SelectItem>
                  <SelectItem value={TIPO_ACTIVIDAD.REVISION}>Revisión</SelectItem>
                  <SelectItem value={TIPO_ACTIVIDAD.OTRO}>Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* NOMBRE */}
          <div className="space-y-2">
            <Label className={errors.nombre ? 'text-destructive' : ''}>
              Nombre de la Actividad *
            </Label>
            <Input
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Entregar Informe Técnico"
              className={errors.nombre ? 'border-destructive' : ''}
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Detalles generales..."
            />
          </div>

          {/* REQUISITOS */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Entregables (Documentos esperados)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequisito}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Agregar
              </Button>
            </div>

            <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20 py-2">
              <FileText className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs text-muted-foreground ml-2">
                Define qué documentos se esperan. Esto activará el control de versiones automático.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {requisitos.map((req, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 bg-muted/30 p-3 rounded-md border border-border"
                >
                  <div className="flex-1 grid gap-2">
                    <Input
                      placeholder="Nombre del documento"
                      value={req.nombre}
                      onChange={(e) =>
                        updateRequisito(index, 'nombre', e.target.value)
                      }
                      className="h-8 text-sm"
                    />

                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Descripción (opcional)"
                        value={req.descripcion}
                        onChange={(e) =>
                          updateRequisito(index, 'descripcion', e.target.value)
                        }
                        className="h-7 text-xs flex-1"
                      />

                      <div className="flex items-center gap-1.5 border-l border-border pl-3 ml-1">
                        <Checkbox
                          checked={req.obligatorio}
                          onCheckedChange={(c) =>
                            updateRequisito(index, 'obligatorio', c)
                          }
                        />
                        <Label className="text-xs cursor-pointer text-muted-foreground">
                          Obligatorio
                        </Label>
                      </div>
                    </div>
                  </div>

                  {requisitos.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive h-8 w-8 mt-1"
                      onClick={() => removeRequisito(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="gap-1.5"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : isEditing ? (
                'Guardar Cambios'
              ) : (
                'Crear Actividad'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}