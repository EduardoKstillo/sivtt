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
import { Loader2, Plus, Trash2, FileText, Search } from 'lucide-react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { procesosAPI } from '@api/endpoints/procesos'
import { toast } from 'sonner' // ✅ Migrado a Sonner
import { TIPO_ACTIVIDAD, FLUJOS_FASES } from '@utils/constants'
import { cn } from '@/lib/utils'

const EMPTY_FORM = {
  fase:        '',
  tipo:        '',
  nombre:      '',
  descripcion: '',
  obligatoria: false,
  fechaLimite: ''
}

const DEFAULT_REQUISITO = { nombre: 'Informe Principal', descripcion: '', obligatorio: true }

export const CrearEditarActividadModal = ({
  open,
  onOpenChange,
  proceso: procesoProp,
  actividadToEdit,
  onSuccess,
  modoMisActividades = false
}) => {
  const isEditing = !!actividadToEdit

  const [procesosDisponibles, setProcesosDisponibles] = useState([])
  const [loadingProcesos, setLoadingProcesos]         = useState(false)
  const [procesoSeleccionado, setProcesoSeleccionado] = useState(null)
  const [searchProceso, setSearchProceso]             = useState('')

  const proceso = procesoProp ?? procesoSeleccionado

  const fasesDisponibles = proceso
    ? (FLUJOS_FASES[proceso.tipoActivo] ?? []).filter(f => typeof f === 'string' && f.trim() !== '')
    : []

  const [loading, setLoading]     = useState(false)
  const [formData, setFormData]   = useState(EMPTY_FORM)
  const [requisitos, setRequisitos] = useState([DEFAULT_REQUISITO])
  const [errors, setErrors]       = useState({})

  useEffect(() => {
    if (!open || !modoMisActividades || procesoProp) return
    setLoadingProcesos(true)
    procesosAPI.list({ estado: 'ACTIVO', limit: 100 })
      .then(({ data }) => setProcesosDisponibles(data.data.procesos ?? []))
      .catch(() => toast.error('Error al cargar procesos')) // ✅ Sonner
      .finally(() => setLoadingProcesos(false))
  }, [open, modoMisActividades, procesoProp])

  useEffect(() => {
    if (!open) return
    setProcesoSeleccionado(null)
    setSearchProceso('')
    setErrors({})

    if (isEditing && actividadToEdit) {
      setFormData({
        fase:        actividadToEdit.fase        ?? '',
        tipo:        actividadToEdit.tipo        ?? '',
        nombre:      actividadToEdit.nombre      ?? '',
        descripcion: actividadToEdit.descripcion ?? '',
        obligatoria: actividadToEdit.obligatoria ?? false,
        fechaLimite: actividadToEdit.fechaLimite
          ? new Date(actividadToEdit.fechaLimite).toISOString().split('T')[0]
          : ''
      })
      setRequisitos(
        actividadToEdit.requisitos?.length > 0
          ? actividadToEdit.requisitos.map(r => ({
              id: r.id,
              nombre:      r.nombre      ?? '',
              descripcion: r.descripcion ?? '',
              obligatorio: r.obligatorio ?? true
            }))
          : [{ ...DEFAULT_REQUISITO }]
      )
    } else {
      setFormData({ ...EMPTY_FORM, fase: procesoProp?.faseActual ?? '' })
      setRequisitos([{ ...DEFAULT_REQUISITO }])
    }
  }, [open]) 

  const handleSeleccionarProceso = (p) => {
    setProcesoSeleccionado(p)
    setFormData(prev => ({ ...prev, fase: p.faseActual ?? '' }))
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const addRequisito    = () => setRequisitos(prev => [...prev, { nombre: '', descripcion: '', obligatorio: true }])
  const removeRequisito = (i) => setRequisitos(prev => prev.filter((_, idx) => idx !== i))
  const updateRequisito = (i, field, value) =>
    setRequisitos(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: value }; return n })

  const procesosFiltrados = procesosDisponibles.filter(p => {
    const t = searchProceso.trim().toLowerCase()
    return !t || p.titulo?.toLowerCase().includes(t) || p.codigo?.toLowerCase().includes(t)
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (modoMisActividades && !proceso) newErrors.proceso = true
    if (!formData.fase.trim())   newErrors.fase   = true
    if (!formData.tipo.trim())   newErrors.tipo   = true
    if (!formData.nombre.trim()) newErrors.nombre = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Faltan campos requeridos') // ✅ Sonner
      return
    }

    setLoading(true)
    try {
      const requisitosLimpios = requisitos
        .filter(r => r.nombre.trim() !== '')
        .map(r => ({
          ...(r.id && { id: r.id }),
          nombre:      r.nombre.trim(),
          descripcion: r.descripcion?.trim() || undefined,
          obligatorio: Boolean(r.obligatorio)
        }))

      const payload = {
        fase:        formData.fase,
        tipo:        formData.tipo,
        nombre:      formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || undefined,
        obligatoria: formData.obligatoria,
        fechaLimite: formData.fechaLimite ? new Date(formData.fechaLimite) : undefined,
        requisitos:  requisitosLimpios
      }

      if (isEditing) {
        await actividadesAPI.update(actividadToEdit.id, payload)
        toast.success('Actividad actualizada correctamente') // ✅ Sonner
      } else {
        await actividadesAPI.create(proceso.id, payload)
        toast.success('Actividad creada exitosamente') // ✅ Sonner
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast.error(isEditing ? 'Error al actualizar' : 'Error al crear', { // ✅ Sonner
        description: err.response?.data?.message
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
          {modoMisActividades && !procesoProp && (
            <div className="space-y-2">
              <Label className={cn(errors.proceso && 'text-destructive')}>
                Proceso <span className="text-destructive">*</span>
              </Label>

              {procesoSeleccionado ? (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5 border-primary/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">{procesoSeleccionado.codigo}</p>
                    <p className="text-xs text-muted-foreground">{procesoSeleccionado.titulo}</p>
                  </div>
                  <Button
                    type="button" variant="ghost" size="sm"
                    onClick={() => { setProcesoSeleccionado(null); setFormData(prev => ({ ...prev, fase: '' })) }}
                    className="text-xs text-muted-foreground"
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div className={cn('border rounded-lg overflow-hidden', errors.proceso && 'border-destructive')}>
                  <div className="relative border-b border-border">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={searchProceso}
                      onChange={e => setSearchProceso(e.target.value)}
                      placeholder="Buscar proceso por nombre o código..."
                      className="w-full pl-9 pr-3 h-9 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto bg-muted/20 p-1">
                    {loadingProcesos ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    ) : procesosFiltrados.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay procesos activos disponibles
                      </p>
                    ) : (
                      procesosFiltrados.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSeleccionarProceso(p)}
                          className="w-full text-left p-2.5 rounded-md hover:bg-muted/60 transition-colors"
                        >
                          <p className="text-sm font-medium text-foreground">{p.codigo}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.titulo}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={cn(errors.fase && 'text-destructive')}>Fase *</Label>
              <Select
                value={formData.fase}
                onValueChange={v => handleChange('fase', v)}
                disabled={isEditing || !proceso}
              >
                <SelectTrigger className={cn(errors.fase && 'border-destructive')}>
                  <SelectValue placeholder={proceso ? 'Seleccione fase...' : 'Selecciona un proceso primero'} />
                </SelectTrigger>
                <SelectContent>
                  {fasesDisponibles.map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                  {fasesDisponibles.length === 0 && (
                    <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                      {proceso ? 'No hay fases disponibles' : 'Selecciona un proceso primero'}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={cn(errors.tipo && 'text-destructive')}>Tipo *</Label>
              <Select value={formData.tipo} onValueChange={v => handleChange('tipo', v)}>
                <SelectTrigger className={cn(errors.tipo && 'border-destructive')}>
                  <SelectValue placeholder="Seleccione tipo..." />
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

          <div className="space-y-2">
            <Label className={cn(errors.nombre && 'text-destructive')}>
              Nombre de la Actividad *
            </Label>
            <Input
              value={formData.nombre}
              onChange={e => handleChange('nombre', e.target.value)}
              placeholder="Ej: Entregar Informe Técnico"
              className={cn(errors.nombre && 'border-destructive')}
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={formData.descripcion}
              onChange={e => handleChange('descripcion', e.target.value)}
              placeholder="Detalles generales..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha Límite (opcional)</Label>
            <Input
              type="date"
              value={formData.fechaLimite}
              onChange={e => handleChange('fechaLimite', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Entregables (Documentos esperados)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRequisito} className="gap-1">
                <Plus className="h-3 w-3" /> Agregar
              </Button>
            </div>

            <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20 py-2">
              <FileText className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs text-muted-foreground ml-2">
                Define qué documentos se esperan. Esto activará el control de versiones automático.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {requisitos.map((req, i) => (
                <div key={i} className="flex items-start gap-2 bg-muted/30 p-3 rounded-md border border-border">
                  <div className="flex-1 grid gap-2">
                    <Input
                      placeholder="Nombre del documento"
                      value={req.nombre}
                      onChange={e => updateRequisito(i, 'nombre', e.target.value)}
                      className="h-8 text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Descripción (opcional)"
                        value={req.descripcion}
                        onChange={e => updateRequisito(i, 'descripcion', e.target.value)}
                        className="h-7 text-xs flex-1"
                      />
                      <div className="flex items-center gap-1.5 border-l border-border pl-3 ml-1">
                        <Checkbox
                          checked={req.obligatorio}
                          onCheckedChange={c => updateRequisito(i, 'obligatorio', c)}
                        />
                        <Label className="text-xs cursor-pointer text-muted-foreground">Obligatorio</Label>
                      </div>
                    </div>
                  </div>
                  {requisitos.length > 1 && (
                    <Button
                      type="button" variant="ghost" size="icon"
                      className="text-muted-foreground hover:text-destructive h-8 w-8 mt-1"
                      onClick={() => removeRequisito(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              {loading
                ? <Loader2 className="animate-spin h-4 w-4" />
                : isEditing ? 'Guardar Cambios' : 'Crear Actividad'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}