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
import { Textarea } from '@components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Search, Info } from 'lucide-react'
import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from '@components/ui/use-toast'

const ROLES = [
  { value: 'INTERESADA', label: '💡 Interesada', desc: 'Empresa en fase de exploración' },
  { value: 'ALIADA', label: '🤝 Aliada', desc: 'Comprometida con el desarrollo' },
  { value: 'FINANCIADORA', label: '💰 Financiadora', desc: 'Aporta recursos económicos' }
]

const CANALES = [
  'Evento Institucional',
  'Referencia Directa',
  'Convocatoria Pública',
  'Contacto Empresarial',
  'Red de Egresados',
  'Otro'
]

export const VincularEmpresaModal = ({ open, onOpenChange, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [loadingEmpresas, setLoadingEmpresas] = useState(false)
  const [empresasDisponibles, setEmpresasDisponibles] = useState([])
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    empresaId: null,
    rolEmpresa: '',
    canalVinculacion: '',
    contactoNombre: '',
    contactoEmail: '',
    contactoTelefono: '',
    observaciones: ''
  })

  useEffect(() => {
    if (open) {
      fetchEmpresasDisponibles()
    }
  }, [open])

  const fetchEmpresasDisponibles = async () => {
    setLoadingEmpresas(true)
    try {
      const { data } = await empresasAPI.listDisponibles(proceso.id)
      setEmpresasDisponibles(data.data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cargar empresas",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoadingEmpresas(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectEmpresa = (empresa) => {
    setFormData(prev => ({ 
      ...prev, 
      empresaId: empresa.id,
      contactoNombre: empresa.contactoPrincipal || '',
      contactoEmail: empresa.emailCorporativo || '',
      contactoTelefono: empresa.telefonoPrincipal || ''
    }))
  }

  const getEmpresasFiltradas = () => {
    if (!search.trim()) return empresasDisponibles
    
    return empresasDisponibles.filter(e => 
      e.nombre.toLowerCase().includes(search.toLowerCase()) ||
      e.ruc.includes(search)
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.empresaId) {
      toast({
        variant: "destructive",
        title: "Empresa requerida",
        description: "Debe seleccionar una empresa"
      })
      return
    }

    if (!formData.rolEmpresa) {
      toast({
        variant: "destructive",
        title: "Rol requerido",
        description: "Debe seleccionar el rol de la empresa"
      })
      return
    }

    setLoading(true)

    try {
      await empresasAPI.vincular(proceso.id, {
        empresaId: formData.empresaId,
        rolEmpresa: formData.rolEmpresa,
        canalVinculacion: formData.canalVinculacion || undefined,
        contactoNombre: formData.contactoNombre.trim() || undefined,
        contactoEmail: formData.contactoEmail.trim() || undefined,
        contactoTelefono: formData.contactoTelefono.trim() || undefined,
        observaciones: formData.observaciones.trim() || undefined
      })

      toast({
        title: "Empresa vinculada",
        description: "La empresa fue vinculada exitosamente"
      })

      onSuccess()
      setFormData({
        empresaId: null,
        rolEmpresa: '',
        canalVinculacion: '',
        contactoNombre: '',
        contactoEmail: '',
        contactoTelefono: '',
        observaciones: ''
      })
      setSearch('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al vincular",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  const empresaSeleccionada = empresasDisponibles.find(e => e.id === formData.empresaId)
  const empresasFiltradas = getEmpresasFiltradas()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vincular Empresa al Proceso</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              Solo se pueden vincular empresas verificadas. Si la empresa no aparece en la lista,
              debe ser registrada y verificada primero en el módulo de Empresas.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Selección de Empresa */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Buscar empresa <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o RUC..."
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Empresas disponibles</Label>
                {loadingEmpresas ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : empresasFiltradas.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center border border-dashed rounded-lg">
                    {search ? 'No se encontraron empresas' : 'No hay empresas disponibles'}
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    {empresasFiltradas.map((empresa) => (
                      <button
                        key={empresa.id}
                        type="button"
                        onClick={() => handleSelectEmpresa(empresa)}
                        className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          formData.empresaId === empresa.id ? 'bg-blue-50' : ''
                        }`}
                        disabled={loading}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded text-white flex items-center justify-center font-bold text-sm">
                            {empresa.nombre.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{empresa.nombre}</p>
                            <p className="text-xs text-gray-500">RUC: {empresa.ruc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {empresaSeleccionada && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-900 text-sm">
                    <strong>Seleccionada:</strong> {empresaSeleccionada.nombre}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Right: Datos de Vinculación */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rolEmpresa">
                  Rol de la empresa <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.rolEmpresa}
                  onValueChange={(value) => handleChange('rolEmpresa', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="rolEmpresa">
                    <SelectValue placeholder="Seleccione el rol" />
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

              <div className="space-y-2">
                <Label htmlFor="canalVinculacion">Canal de vinculación</Label>
                <Select
                  value={formData.canalVinculacion}
                  onValueChange={(value) => handleChange('canalVinculacion', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="canalVinculacion">
                    <SelectValue placeholder="Seleccione el canal" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANALES.map(canal => (
                      <SelectItem key={canal} value={canal}>
                        {canal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactoNombre">Contacto principal</Label>
                <Input
                  id="contactoNombre"
                  value={formData.contactoNombre}
                  onChange={(e) => handleChange('contactoNombre', e.target.value)}
                  placeholder="Nombre del contacto"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactoEmail">Email</Label>
                <Input
                  id="contactoEmail"
                  type="email"
                  value={formData.contactoEmail}
                  onChange={(e) => handleChange('contactoEmail', e.target.value)}
                  placeholder="contacto@empresa.com"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactoTelefono">Teléfono</Label>
                <Input
                  id="contactoTelefono"
                  value={formData.contactoTelefono}
                  onChange={(e) => handleChange('contactoTelefono', e.target.value)}
                  placeholder="+51 999 999 999"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleChange('observaciones', e.target.value)}
                  placeholder="Detalles adicionales de la vinculación..."
                  rows={3}
                  maxLength={500}
                  disabled={loading}
                />
              </div>
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
              disabled={loading || !formData.empresaId || !formData.rolEmpresa}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vinculando...
                </>
              ) : (
                'Vincular Empresa'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}