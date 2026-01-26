import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2 } from 'lucide-react'
import { financiamientosAPI } from '@api/endpoints/financiamientos'
import { toast } from '@components/ui/use-toast'

const TIPOS = [
  { value: 'INSTITUCIONAL', label: '🏛️ Institucional' },
  { value: 'EMPRESARIAL', label: '🏢 Empresarial' },
  { value: 'GRANT_EXTERNO', label: '🌍 Grant Externo' },
  { value: 'CONCURSO', label: '🏆 Concurso' },
  { value: 'OTRO', label: '💰 Otro' }
]

const ESTADOS = [
  { value: 'COMPROMETIDO', label: 'Comprometido' },
  { value: 'RECIBIDO', label: 'Recibido' },
  { value: 'EJECUTADO', label: 'Ejecutado' }
]

export const RegistrarFinanciamientoModal = ({ open, onOpenChange, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tipo: '',
    fuente: '',
    monto: '',
    estado: 'COMPROMETIDO',
    fechaRecepcion: '',
    entidadFinanciadora: '',
    numeroConvenio: '',
    vigencia: '',
    observaciones: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.tipo || !formData.fuente || !formData.monto) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Complete todos los campos obligatorios"
      })
      return
    }

    setLoading(true)

    try {
      await financiamientosAPI.create(proceso.id, {
        tipo: formData.tipo,
        fuente: formData.fuente.trim(),
        monto: parseFloat(formData.monto),
        estado: formData.estado,
        fechaRecepcion: formData.fechaRecepcion || undefined,
        entidadFinanciadora: formData.entidadFinanciadora.trim() || undefined,
        numeroConvenio: formData.numeroConvenio.trim() || undefined,
        vigencia: formData.vigencia.trim() || undefined,
        observaciones: formData.observaciones.trim() || undefined
      })

      toast({
        title: "Financiamiento registrado",
        description: "El financiamiento fue registrado exitosamente"
      })

      onSuccess()
      setFormData({
        tipo: '',
        fuente: '',
        monto: '',
        estado: 'COMPROMETIDO',
        fechaRecepcion: '',
        entidadFinanciadora: '',
        numeroConvenio: '',
        vigencia: '',
        observaciones: ''
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al registrar",
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
          <DialogTitle>Registrar Financiamiento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo de financiamiento <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleChange('tipo', value)}
                disabled={loading}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">
                Estado <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleChange('estado', value)}
                disabled={loading}
              >
                <SelectTrigger id="estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map(estado => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fuente */}
          <div className="space-y-2">
            <Label htmlFor="fuente">
              Fuente del financiamiento <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fuente"
              value={formData.fuente}
              onChange={(e) => handleChange('fuente', e.target.value)}
              placeholder="Ej: Fondo CONCYTEC - ProCiencia"
              disabled={loading}
            />
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="monto">
              Monto (S/.) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="monto"
              type="number"
              min="0"
              step="0.01"
              value={formData.monto}
              onChange={(e) => handleChange('monto', e.target.value)}
              placeholder="50000.00"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha de recepción */}
            <div className="space-y-2">
              <Label htmlFor="fechaRecepcion">Fecha de recepción</Label>
              <Input
                id="fechaRecepcion"
                type="date"
                value={formData.fechaRecepcion}
                onChange={(e) => handleChange('fechaRecepcion', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Vigencia */}
            <div className="space-y-2">
              <Label htmlFor="vigencia">Vigencia</Label>
              <Input
                id="vigencia"
                value={formData.vigencia}
                onChange={(e) => handleChange('vigencia', e.target.value)}
                placeholder="Ej: 12 meses, 2024-2025"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entidad Financiadora */}
            <div className="space-y-2">
              <Label htmlFor="entidadFinanciadora">Entidad financiadora</Label>
              <Input
                id="entidadFinanciadora"
                value={formData.entidadFinanciadora}
                onChange={(e) => handleChange('entidadFinanciadora', e.target.value)}
                placeholder="Nombre de la entidad"
                disabled={loading}
              />
            </div>

            {/* Número de convenio */}
            <div className="space-y-2">
              <Label htmlFor="numeroConvenio">N° Convenio/Contrato</Label>
              <Input
                id="numeroConvenio"
                value={formData.numeroConvenio}
                onChange={(e) => handleChange('numeroConvenio', e.target.value)}
                placeholder="CONV-2024-001"
                disabled={loading}
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder="Detalles adicionales del financiamiento..."
              rows={3}
              maxLength={500}
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
                  Registrando...
                </>
              ) : (
                'Registrar Financiamiento'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}