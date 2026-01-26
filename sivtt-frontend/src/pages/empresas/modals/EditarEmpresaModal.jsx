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

// Constantes idénticas a la DB
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

export const EditarEmpresaModal = ({ open, onOpenChange, empresa, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
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
  })

  // Cargar datos cuando se abre el modal y existe la empresa
  useEffect(() => {
    if (open && empresa) {
      setFormData({
        razonSocial: empresa.razonSocial || '',
        ruc: empresa.ruc || '',
        nombreComercial: empresa.nombreComercial || '',
        sector: empresa.sector || '',
        tamaño: empresa.tamaño || '',
        direccion: empresa.direccion || '',
        email: empresa.email || '',
        telefono: empresa.telefono || '',
        contactoPrincipal: empresa.contactoPrincipal || '',
        cargoContacto: empresa.cargoContacto || ''
      })
    }
  }, [open, empresa])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.razonSocial) {
      toast({
        variant: "destructive",
        title: "Campo requerido",
        description: "La Razón Social es obligatoria"
      })
      return
    }

    setLoading(true)

    try {
      // Preparamos payload (excluyendo RUC que no se edita)
      const payload = {
        razonSocial: formData.razonSocial.trim(),
        nombreComercial: formData.nombreComercial.trim() || null, // Backend update acepta null para borrar
        sector: formData.sector || null,
        tamaño: formData.tamaño || null,
        direccion: formData.direccion.trim() || null,
        email: formData.email.trim() || null,
        telefono: formData.telefono.trim() || null,
        contactoPrincipal: formData.contactoPrincipal.trim() || null,
        cargoContacto: formData.cargoContacto.trim() || null
      }

      await empresasAPI.update(empresa.id, payload)

      toast({
        title: "Empresa actualizada",
        description: "Los cambios fueron guardados exitosamente"
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fila 1: RUC (Solo lectura) y Razón Social */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>RUC</Label>
              <Input 
                value={formData.ruc} 
                disabled 
                className="bg-gray-100 text-gray-500 cursor-not-allowed" 
              />
              <p className="text-xs text-gray-400">El RUC no se puede editar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="razonSocial">
                Razón Social <span className="text-red-500">*</span>
              </Label>
              <Input
                id="razonSocial"
                value={formData.razonSocial}
                onChange={(e) => handleChange('razonSocial', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Fila 2: Nombre Comercial y Tamaño */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Fila 3: Sector y Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select
                value={formData.sector}
                onValueChange={(value) => handleChange('sector', value)}
                disabled={loading}
              >
                <SelectTrigger id="sector">
                  <SelectValue placeholder="Seleccione el sector" />
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
              <Label htmlFor="direccion">Dirección Fiscal</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Fila 4: Contacto Digital */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Corporativo</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Fila 5: Persona de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactoPrincipal">Contacto Principal</Label>
              <Input
                id="contactoPrincipal"
                value={formData.contactoPrincipal}
                onChange={(e) => handleChange('contactoPrincipal', e.target.value)}
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
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}