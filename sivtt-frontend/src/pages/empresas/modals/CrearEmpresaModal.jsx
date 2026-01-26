import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Loader2 } from 'lucide-react'
import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from '@components/ui/use-toast'

// Valores en MAYÚSCULAS para coincidir con el Backend/DB
const SECTORES = [
  { value: 'TECNOLOGIA', label: 'Tecnología' },
  { value: 'MANUFACTURA', label: 'Manufactura' },
  { value: 'AGROINDUSTRIA', label: 'Agroindustria' },
  { value: 'AGRICULTURA', label: 'Agricultura' },
  { value: 'MINERIA', label: 'Minería' },
  { value: 'SALUD', label: 'Salud' },
  { value: 'EDUCACION', label: 'Educación' },
  { value: 'CONSTRUCCION', label: 'Construcción' },
  { value: 'OTRO', label: 'Otro' }
]

const TAMANOS = [
  { value: 'MICRO', label: 'Micro Empresa' },
  { value: 'PEQUENA', label: 'Pequeña Empresa' },
  { value: 'MEDIANA', label: 'Mediana Empresa' },
  { value: 'GRANDE', label: 'Gran Empresa' }
]

const INITIAL_STATE = {
  razonSocial: '',
  ruc: '',
  nombreComercial: '',
  sector: '',
  tamaño: '',
  direccion: '',
  email: '',
  telefono: '',
  contactoPrincipal: '',
  cargoContacto: ''
}

export const CrearEmpresaModal = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(INITIAL_STATE)

  // Resetear formulario al cerrar o abrir
  useEffect(() => {
    if (open) {
      setFormData(INITIAL_STATE)
    }
  }, [open])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones básicas
    if (!formData.razonSocial || !formData.ruc) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Razón Social y RUC son obligatorios"
      })
      return
    }

    if (!/^\d{11}$/.test(formData.ruc)) {
      toast({
        variant: "destructive",
        title: "RUC inválido",
        description: "El RUC debe tener 11 dígitos numéricos"
      })
      return
    }

    setLoading(true)

    try {
      // Preparamos el payload limpiando strings vacíos
      const payload = {
        razonSocial: formData.razonSocial.trim(),
        ruc: formData.ruc.trim(),
        nombreComercial: formData.nombreComercial.trim() || undefined,
        sector: formData.sector || undefined,
        tamaño: formData.tamaño || undefined,
        direccion: formData.direccion.trim() || undefined,
        email: formData.email.trim() || undefined,
        telefono: formData.telefono.trim() || undefined,
        contactoPrincipal: formData.contactoPrincipal.trim() || undefined,
        cargoContacto: formData.cargoContacto.trim() || undefined
      }

      await empresasAPI.create(payload)

      toast({
        title: "Empresa creada",
        description: "La empresa fue registrada exitosamente"
      })

      onSuccess()
    } catch (error) {
      const errorMsg = error.response?.data?.message 
      
      // Manejo específico si el RUC ya existe (ConflictError del backend)
      if (errorMsg?.includes('RUC')) {
        toast({
          variant: "destructive",
          title: "RUC Duplicado",
          description: "Ya existe una empresa registrada con este RUC."
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error al crear empresa",
          description: errorMsg || "Intente nuevamente"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Empresa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fila 1: Identificación Legal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="razonSocial">
                Razón Social <span className="text-red-500">*</span>
              </Label>
              <Input
                id="razonSocial"
                value={formData.razonSocial}
                onChange={(e) => handleChange('razonSocial', e.target.value)}
                placeholder="Ej: Minería Global S.A.C."
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruc">
                RUC <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ruc"
                value={formData.ruc}
                onChange={(e) => handleChange('ruc', e.target.value)}
                placeholder="20123456789"
                maxLength={11}
                disabled={loading}
              />
            </div>
          </div>

          {/* Fila 2: Detalles Comerciales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombreComercial">Nombre Comercial</Label>
              <Input
                id="nombreComercial"
                value={formData.nombreComercial}
                onChange={(e) => handleChange('nombreComercial', e.target.value)}
                placeholder="Opcional"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select
                value={formData.sector}
                onValueChange={(value) => handleChange('sector', value)}
                disabled={loading}
              >
                <SelectTrigger id="sector">
                  <SelectValue placeholder="Seleccione sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORES.map(sector => (
                    <SelectItem key={sector.value} value={sector.value}>
                      {sector.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tamaño">Tamaño</Label>
              <Select
                value={formData.tamaño}
                onValueChange={(value) => handleChange('tamaño', value)}
                disabled={loading}
              >
                <SelectTrigger id="tamaño">
                  <SelectValue placeholder="Seleccione tamaño" />
                </SelectTrigger>
                <SelectContent>
                  {TAMANOS.map(tam => (
                    <SelectItem key={tam.value} value={tam.value}>
                      {tam.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fila 3: Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Corporativo</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contacto@empresa.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="+51 999 999 999"
                disabled={loading}
              />
            </div>
          </div>

          {/* Fila 4: Dirección y Persona de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactoPrincipal">Contacto Principal</Label>
              <Input
                id="contactoPrincipal"
                value={formData.contactoPrincipal}
                onChange={(e) => handleChange('contactoPrincipal', e.target.value)}
                placeholder="Nombre del representante"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargoContacto">Cargo</Label>
              <Input
                id="cargoContacto"
                value={formData.cargoContacto}
                onChange={(e) => handleChange('cargoContacto', e.target.value)}
                placeholder="Ej: Gerente General"
                disabled={loading}
              />
            </div>
          </div>

          {/* Fila 5: Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección Fiscal</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              placeholder="Av. Principal 123, Distrito, Ciudad"
              disabled={loading}
            />
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Registrar Empresa'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}