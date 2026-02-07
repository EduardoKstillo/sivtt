import { useState } from 'react'
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
import { Loader2, AlertCircle, Plus, Trash2, FileText } from 'lucide-react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from '@components/ui/use-toast'
import { TIPO_ACTIVIDAD, FLUJOS_FASES } from '@utils/constants'

export const CrearActividadModal = ({ open, onOpenChange, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fase: '',
    tipo: '',
    nombre: '',
    descripcion: '',
    obligatoria: false,
    fechaLimite: ''
  })
  
  // Estado para los requisitos dinámicos
  const [requisitos, setRequisitos] = useState([
    { nombre: 'Informe Principal', descripcion: '', obligatorio: true }
  ])

  // Validación de errores
  const [errors, setErrors] = useState({})

  const fasesAbiertas = FLUJOS_FASES[proceso.tipoActivo]?.filter(fase => 
    fase === proceso.faseActual
  ) || []

  // --- Gestión de Requisitos ---
  const addRequisito = () => {
    setRequisitos([...requisitos, { nombre: '', descripcion: '', obligatorio: true }])
  }

  const removeRequisito = (index) => {
    setRequisitos(requisitos.filter((_, i) => i !== index))
  }

  const updateRequisito = (index, field, value) => {
    const newReqs = [...requisitos]
    newReqs[index][field] = value
    setRequisitos(newReqs)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validación básica (Igual que tenías)
    const newErrors = {}
    if (!formData.fase) newErrors.fase = true
    if (!formData.tipo) newErrors.tipo = true
    if (!formData.nombre) newErrors.nombre = true
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({ variant: "destructive", title: "Faltan campos requeridos" })
      return
    }

    setLoading(true)

    try {
      // ✅ MEJORA: Limpiamos el array de requisitos antes de enviarlo
      const requisitosLimpios = requisitos
        .filter(r => r.nombre.trim() !== '') // Quitar vacíos
        .map(r => ({
          nombre: r.nombre.trim(),
          descripcion: r.descripcion?.trim() || undefined,
          obligatorio: Boolean(r.obligatorio) // Asegurar que sea true/false
        }))

      await actividadesAPI.create(proceso.id, {
        ...formData,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        fechaLimite: formData.fechaLimite || undefined,
        requisitos: requisitosLimpios // Enviamos el array limpio
      })

      toast({ title: "Actividad creada exitosamente" })
      onSuccess()
      
      // Reset form
      setFormData({ fase: '', tipo: '', nombre: '', descripcion: '', obligatoria: false, fechaLimite: '' })
      setRequisitos([{ nombre: 'Informe Principal', descripcion: '', obligatorio: true }])
      setErrors({})
    } catch (error) {
      // ... manejo de errores ...
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Actividad</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className={errors.fase ? "text-red-500" : ""}>Fase *</Label>
                <Select value={formData.fase} onValueChange={v => handleChange('fase', v)}>
                   <SelectTrigger className={errors.fase ? "border-red-500" : ""}>
                     <SelectValue placeholder="Seleccione..." />
                   </SelectTrigger>
                   <SelectContent>
                      {fasesAbiertas.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                   </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label className={errors.tipo ? "text-red-500" : ""}>Tipo *</Label>
                <Select value={formData.tipo} onValueChange={v => handleChange('tipo', v)}>
                   <SelectTrigger className={errors.tipo ? "border-red-500" : ""}>
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

          <div className="space-y-2">
             <Label className={errors.nombre ? "text-red-500" : ""}>Nombre de la Actividad *</Label>
             <Input 
                value={formData.nombre} 
                onChange={e => handleChange('nombre', e.target.value)} 
                placeholder="Ej: Entregar Informe Técnico" 
                className={errors.nombre ? "border-red-500" : ""}
             />
          </div>

          <div className="space-y-2">
             <Label>Descripción</Label>
             <Textarea 
                value={formData.descripcion} 
                onChange={e => handleChange('descripcion', e.target.value)} 
                placeholder="Detalles generales..."
             />
          </div>

          {/* 🔥 SECCIÓN DE REQUISITOS (ENTREGABLES) */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-gray-900">Entregables (Documentos esperados)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRequisito}>
                <Plus className="h-3 w-3 mr-1" /> Agregar
              </Button>
            </div>
            
            <Alert className="bg-blue-50 border-blue-200 py-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-xs text-blue-700 ml-2">
                Define qué documentos se esperan. Esto activará el control de versiones automático.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {requisitos.map((req, index) => (
                <div key={index} className="flex items-start gap-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="flex-1 grid gap-2">
                    <Input 
                      placeholder="Nombre del documento (Ej: Factura, Plano)" 
                      value={req.nombre}
                      onChange={(e) => updateRequisito(index, 'nombre', e.target.value)}
                      className="h-8 text-sm bg-white"
                    />
                    <div className="flex items-center gap-2">
                        <Input 
                          placeholder="Descripción (opcional)" 
                          value={req.descripcion}
                          onChange={(e) => updateRequisito(index, 'descripcion', e.target.value)}
                          className="h-7 text-xs bg-white flex-1"
                        />
                        <div className="flex items-center gap-1.5 border-l pl-3 ml-1">
                            <Checkbox 
                                id={`req-obl-${index}`} 
                                checked={req.obligatorio}
                                onCheckedChange={(c) => updateRequisito(index, 'obligatorio', c)}
                            />
                            <Label htmlFor={`req-obl-${index}`} className="text-xs cursor-pointer text-gray-600">Obligatorio</Label>
                        </div>
                    </div>
                  </div>
                  {requisitos.length > 1 && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-400 hover:text-red-500 h-8 w-8 mt-1"
                        onClick={() => removeRequisito(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Crear Actividad'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}