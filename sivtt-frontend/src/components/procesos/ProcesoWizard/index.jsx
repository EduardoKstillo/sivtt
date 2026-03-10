import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Card, CardContent } from '@components/ui/card'
import { 
  FileText, 
  Briefcase, 
  CheckCircle2, 
  Loader2
} from 'lucide-react'
import { TIPO_ACTIVO } from '@utils/constants'
import { usersAPI } from '@api/endpoints/users'
import { procesosAPI } from '@api/endpoints/procesos'
import { toast } from 'sonner' // ✅ Importación correcta de Sonner
import { cn } from '@/lib/utils'

const SISTEMAS_ORIGEN = [
  { value: 'CRIS-UNSA', label: 'CRIS-UNSA' },
  { value: 'SIRI', label: 'SIRI' },
  { value: 'SISMO', label: 'SISMO' },
  { value: 'OTRO', label: 'Otro' }
]

const TRL_LEVELS = [
  { value: 1, label: 'TRL 1 - Principios básicos' },
  { value: 2, label: 'TRL 2 - Concepto formulado' },
  { value: 3, label: 'TRL 3 - Prueba experimental' },
  { value: 4, label: 'TRL 4 - Validación laboratorio' },
  { value: 5, label: 'TRL 5 - Validación entorno' },
  { value: 6, label: 'TRL 6 - Demostración entorno' },
  { value: 7, label: 'TRL 7 - Demostración operacional' },
  { value: 8, label: 'TRL 8 - Sistema completo' },
  { value: 9, label: 'TRL 9 - Sistema probado' }
]

export const ProcesoWizard = ({ open, onOpenChange }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  
  const [formData, setFormData] = useState({
    tipoActivo: null,
    sistemaOrigen: 'CRIS-UNSA',
    evaluacionId: '',
    titulo: '',
    descripcion: '',
    trlInicial: null,
    responsableId: null
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      loadUsuarios()
    }
  }, [open])

  const loadUsuarios = async () => {
    setLoadingUsers(true)
    try {
      const { data } = await usersAPI.list({
        activo: true,
        roles: 'ADMIN_SISTEMA,COORDINADOR_VINCULACION' 
      })
      
      const listaUsuarios = data?.data?.usuarios || []
      setUsuarios(Array.isArray(listaUsuarios) ? listaUsuarios : [])
      
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      // ✅ Sintaxis Sonner para errores
      toast.error("Error de conexión", {
        description: "No se pudieron cargar los responsables."
      })
      setUsuarios([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.tipoActivo) {
      newErrors.tipoActivo = 'Seleccione un tipo'
    }

    if (!formData.evaluacionId || formData.evaluacionId.trim() === '') {
      newErrors.evaluacionId = 'Requerido'
    } else if (isNaN(formData.evaluacionId) || parseInt(formData.evaluacionId) <= 0) {
      newErrors.evaluacionId = 'Número inválido'
    }

    if (!formData.titulo || formData.titulo.trim().length < 10) {
      newErrors.titulo = 'Mínimo 10 caracteres'
    }

    if (formData.tipoActivo === TIPO_ACTIVO.PATENTE && !formData.trlInicial) {
      newErrors.trlInicial = 'Requerido para patentes'
    }

    if (!formData.responsableId) {
      newErrors.responsableId = 'Seleccione un responsable'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      // ✅ Sintaxis Sonner para validaciones fallidas
      toast.error("Formulario incompleto", {
        description: "Complete los campos obligatorios"
      })
      return
    }

    setLoading(true)

    try {
      const payload = {
        tipoActivo: formData.tipoActivo,
        sistemaOrigen: formData.sistemaOrigen,
        evaluacionId: parseInt(formData.evaluacionId),
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        responsableId: formData.responsableId,
        ...(formData.tipoActivo === TIPO_ACTIVO.PATENTE && { 
          trlInicial: formData.trlInicial 
        })
      }

      const { data } = await procesosAPI.create(payload)

      // ✅ Sintaxis Sonner para éxito
      toast.success("Proceso creado", {
        description: "El proceso fue creado exitosamente"
      })

      onOpenChange(false)
      navigate(`/procesos/${data.data.id}`)
    } catch (error) {
      // ✅ Sintaxis Sonner para errores del backend
      toast.error("Error al crear proceso", {
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        tipoActivo: null,
        sistemaOrigen: 'CRIS-UNSA',
        evaluacionId: '',
        titulo: '',
        descripcion: '',
        trlInicial: null,
        responsableId: null
      })
      setErrors({})
      onOpenChange(false)
    }
  }

  const isPatente = formData.tipoActivo === TIPO_ACTIVO.PATENTE

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-border">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Crear Proceso
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Complete la información requerida
            </p>
          </div>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-8">
            
            {/* Tipo de Activo */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Tipo de Activo <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {/* Patente */}
                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md border-2",
                    formData.tipoActivo === TIPO_ACTIVO.PATENTE 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                      : "border-border hover:border-blue-200 dark:hover:border-blue-900"
                  )}
                  onClick={() => handleChange('tipoActivo', TIPO_ACTIVO.PATENTE)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                        formData.tipoActivo === TIPO_ACTIVO.PATENTE
                          ? "bg-blue-500 text-white"
                          : "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                      )}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">Patente</h4>
                        <p className="text-xs text-muted-foreground">Transferencia tecnológica</p>
                      </div>
                      {formData.tipoActivo === TIPO_ACTIVO.PATENTE && (
                        <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Requerimiento */}
                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md border-2",
                    formData.tipoActivo === TIPO_ACTIVO.REQUERIMIENTO_EMPRESARIAL 
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20" 
                      : "border-border hover:border-purple-200 dark:hover:border-purple-900"
                  )}
                  onClick={() => handleChange('tipoActivo', TIPO_ACTIVO.REQUERIMIENTO_EMPRESARIAL)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                        formData.tipoActivo === TIPO_ACTIVO.REQUERIMIENTO_EMPRESARIAL
                          ? "bg-purple-500 text-white"
                          : "bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
                      )}>
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">Requerimiento</h4>
                        <p className="text-xs text-muted-foreground">Solución empresarial</p>
                      </div>
                      {formData.tipoActivo === TIPO_ACTIVO.REQUERIMIENTO_EMPRESARIAL && (
                        <CheckCircle2 className="h-5 w-5 text-purple-500 shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {errors.tipoActivo && (
                <p className="text-xs text-destructive">{errors.tipoActivo}</p>
              )}
            </div>

            <div className="border-t border-border" />

            {/* Sistema de Origen */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sistemaOrigen" className="text-sm font-medium">
                  Sistema de origen
                </Label>
                <Select
                  value={formData.sistemaOrigen}
                  onValueChange={(value) => handleChange('sistemaOrigen', value)}
                >
                  <SelectTrigger id="sistemaOrigen" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SISTEMAS_ORIGEN.map((sistema) => (
                      <SelectItem key={sistema.value} value={sistema.value}>
                        {sistema.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evaluacionId" className="text-sm font-medium">
                  ID de evaluación <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="evaluacionId"
                  type="number"
                  placeholder="502"
                  value={formData.evaluacionId}
                  onChange={(e) => handleChange('evaluacionId', e.target.value)}
                  className={cn("h-10", errors.evaluacionId && "border-destructive")}
                />
                {errors.evaluacionId && (
                  <p className="text-xs text-destructive">{errors.evaluacionId}</p>
                )}
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Título y Descripción */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo" className="text-sm font-medium">
                  Título del proceso <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="titulo"
                  placeholder="Ej: Sensor IoT para agricultura de precisión"
                  value={formData.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  className={cn("h-10", errors.titulo && "border-destructive")}
                  maxLength={200}
                />
                <div className="flex justify-between items-center">
                  {errors.titulo && (
                    <p className="text-xs text-destructive">{errors.titulo}</p>
                  )}
                  <p className="text-xs text-muted-foreground ml-auto tabular-nums">
                    {formData.titulo.length}/200
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-sm font-medium">
                  Descripción
                  <span className="text-muted-foreground font-normal ml-1">(Opcional)</span>
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el proceso brevemente..."
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right tabular-nums">
                  {formData.descripcion.length}/1000
                </p>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Configuración */}
            <div className="grid grid-cols-2 gap-4">
              {/* TRL Inicial - Solo para PATENTE */}
              {isPatente && (
                <div className="space-y-2">
                  <Label htmlFor="trlInicial" className="text-sm font-medium">
                    TRL inicial <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.trlInicial?.toString()}
                    onValueChange={(value) => handleChange('trlInicial', parseInt(value))}
                  >
                    <SelectTrigger 
                      id="trlInicial" 
                      className={cn("h-10", errors.trlInicial && "border-destructive")}
                    >
                      <SelectValue placeholder="Seleccionar TRL" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRL_LEVELS.map((trl) => (
                        <SelectItem key={trl.value} value={trl.value.toString()}>
                          {trl.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.trlInicial && (
                    <p className="text-xs text-destructive">{errors.trlInicial}</p>
                  )}

                  {/* Barra TRL */}
                  {formData.trlInicial && (
                    <div className="flex gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            "flex-1 h-1.5 rounded-full transition-all",
                            level <= formData.trlInicial
                              ? "bg-blue-600"
                              : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Responsable */}
              <div className={cn("space-y-2", !isPatente && "col-span-2")}>
                <Label htmlFor="responsableId" className="text-sm font-medium">
                  Responsable <span className="text-destructive">*</span>
                </Label>

                {loadingUsers ? (
                  <div className="flex items-center justify-center h-10 rounded-lg border border-dashed">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                    <span className="text-xs text-muted-foreground">Cargando...</span>
                  </div>
                ) : usuarios.length === 0 ? (
                  <div className="flex items-center justify-center h-10 rounded-lg border border-dashed border-destructive bg-destructive/5">
                    <span className="text-xs text-destructive">No hay usuarios disponibles</span>
                  </div>
                ) : (
                  <>
                    <Select
                      value={formData.responsableId?.toString()}
                      onValueChange={(value) => handleChange('responsableId', parseInt(value))}
                    >
                      <SelectTrigger 
                        id="responsableId"
                        className={cn("h-10", errors.responsableId && "border-destructive")}
                      >
                        <SelectValue placeholder="Seleccionar responsable" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.id.toString()}>
                            {usuario.nombres} {usuario.apellidos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {errors.responsableId && (
                      <p className="text-xs text-destructive">{errors.responsableId}</p>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <span className="text-destructive">*</span> Campos obligatorios
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 min-w-[140px] gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Crear Proceso
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}