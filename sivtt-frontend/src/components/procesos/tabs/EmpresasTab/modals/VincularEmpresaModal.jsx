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
      
      // ✅ CORRECCIÓN: Manejar respuesta paginada o plana
      // Si data.data es un array, úsalo. Si es un objeto (paginación), busca .data o .items dentro.
      let listaEmpresas = []
      
      if (Array.isArray(data.data)) {
        listaEmpresas = data.data
      } else if (data.data?.data && Array.isArray(data.data.data)) {
        listaEmpresas = data.data.data // Estructura común de paginación { data: [...], meta: ... }
      } else if (data.data?.items && Array.isArray(data.data.items)) {
        listaEmpresas = data.data.items
      } else if (data.data?.empresas && Array.isArray(data.data.empresas)) {
        listaEmpresas = data.data.empresas // Según tu ejemplo anterior
      }

      setEmpresasDisponibles(listaEmpresas)
      
    } catch (error) {
      console.error("Error cargando empresas:", error)
      toast({
        variant: "destructive",
        title: "Error al cargar empresas",
        description: error.response?.data?.message || "Intente nuevamente"
      })
      setEmpresasDisponibles([]) // Fallback seguro a array vacío
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
      contactoEmail: empresa.email || '', // Ajustado a tu DB
      contactoTelefono: empresa.telefono || '' // Ajustado a tu DB
    }))
  }

  const getEmpresasFiltradas = () => {
    // Protección adicional por si el estado no es un array
    if (!Array.isArray(empresasDisponibles)) return []

    if (!search.trim()) return empresasDisponibles
    
    return empresasDisponibles.filter(e => 
      e.razonSocial?.toLowerCase().includes(search.toLowerCase()) || // Usar razonSocial
      e.ruc?.includes(search)
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
        // No enviamos datos de contacto al backend porque la API `vincular` 
        // del servicio no los guarda en la tabla intermedia (según tu código backend).
        // Solo enviamos observaciones.
        observaciones: formData.observaciones.trim() || undefined,
        interesConfirmado: true // Asumimos interés si se vincula manualmente
      })

      toast({
        title: "Empresa vinculada",
        description: "La empresa fue vinculada exitosamente"
      })

      onSuccess()
      // Reset form
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

  // ✅ Búsqueda segura usando encadenamiento opcional
  const empresaSeleccionada = Array.isArray(empresasDisponibles) 
    ? empresasDisponibles.find(e => e.id === formData.empresaId) 
    : null
    
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
                    placeholder="Buscar por Razón Social o RUC..."
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
                    {search ? 'No se encontraron empresas' : 'No hay empresas disponibles para vincular'}
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto bg-gray-50/50">
                    {empresasFiltradas.map((empresa) => (
                      <button
                        key={empresa.id}
                        type="button"
                        onClick={() => handleSelectEmpresa(empresa)}
                        className={`w-full p-3 text-left hover:bg-blue-50/80 transition-colors border-b border-gray-200 last:border-b-0 ${
                          formData.empresaId === empresa.id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
                        }`}
                        disabled={loading}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-sm text-gray-700 shadow-sm">
                            {empresa.razonSocial?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">
                                {empresa.razonSocial}
                            </p>
                            <p className="text-xs text-gray-500">RUC: {empresa.ruc}</p>
                          </div>
                          {formData.empresaId === empresa.id && (
                              <div className="text-blue-600">
                                  <Info className="h-4 w-4" />
                              </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {empresaSeleccionada && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-3">
                    <div className="bg-green-100 p-1.5 rounded-full">
                        <Info className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-green-900">Empresa Seleccionada</p>
                        <p className="text-sm text-green-800">{empresaSeleccionada.razonSocial}</p>
                    </div>
                </div>
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
                        <div className="flex flex-col gap-0.5 py-1">
                          <span className="font-medium">{rol.label}</span>
                          <span className="text-xs text-gray-500">{rol.desc}</span>
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
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleChange('observaciones', e.target.value)}
                  placeholder="Detalles adicionales sobre el acuerdo o la negociación..."
                  rows={4}
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