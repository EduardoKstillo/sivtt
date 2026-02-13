import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@components/ui/select'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Search, Info, Check, Building2 } from 'lucide-react'
import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

const ROLES = [
  { value: 'INTERESADA', label: 'Interesada', desc: 'Empresa en fase de exploración', dot: 'bg-sky-500' },
  { value: 'ALIADA', label: 'Aliada', desc: 'Comprometida con el desarrollo', dot: 'bg-indigo-500' },
  { value: 'FINANCIADORA', label: 'Financiadora', desc: 'Aporta recursos económicos', dot: 'bg-amber-500' },
]

const CANALES = [
  'Evento Institucional', 'Referencia Directa', 'Convocatoria Pública',
  'Contacto Empresarial', 'Red de Egresados', 'Otro'
]

export const VincularEmpresaModal = ({ open, onOpenChange, proceso, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [loadingEmpresas, setLoadingEmpresas] = useState(false)
  const [empresasDisponibles, setEmpresasDisponibles] = useState([])
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    empresaId: null, rolEmpresa: '', canalVinculacion: '',
    contactoNombre: '', contactoEmail: '', contactoTelefono: '', observaciones: ''
  })

  useEffect(() => {
    if (open) fetchEmpresasDisponibles()
  }, [open])

  const fetchEmpresasDisponibles = async () => {
    setLoadingEmpresas(true)
    try {
      const { data } = await empresasAPI.listDisponibles(proceso.id)
      let lista = []
      if (Array.isArray(data.data)) lista = data.data
      else if (data.data?.data && Array.isArray(data.data.data)) lista = data.data.data
      else if (data.data?.items && Array.isArray(data.data.items)) lista = data.data.items
      else if (data.data?.empresas && Array.isArray(data.data.empresas)) lista = data.data.empresas
      setEmpresasDisponibles(lista)
    } catch (error) {
      toast({ variant: "destructive", title: "Error al cargar empresas", description: error.response?.data?.message })
      setEmpresasDisponibles([])
    } finally {
      setLoadingEmpresas(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectEmpresa = (empresa) => {
    setFormData(prev => ({ 
      ...prev, empresaId: empresa.id,
      contactoNombre: empresa.contactoPrincipal || '',
      contactoEmail: empresa.email || '',
      contactoTelefono: empresa.telefono || ''
    }))
  }

  const getEmpresasFiltradas = () => {
    if (!Array.isArray(empresasDisponibles)) return []
    if (!search.trim()) return empresasDisponibles
    return empresasDisponibles.filter(e => 
      e.razonSocial?.toLowerCase().includes(search.toLowerCase()) || e.ruc?.includes(search)
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.empresaId) { toast({ variant: "destructive", title: "Empresa requerida" }); return }
    if (!formData.rolEmpresa) { toast({ variant: "destructive", title: "Rol requerido" }); return }

    setLoading(true)
    try {
      await empresasAPI.vincular(proceso.id, {
        empresaId: formData.empresaId, rolEmpresa: formData.rolEmpresa,
        canalVinculacion: formData.canalVinculacion || undefined,
        observaciones: formData.observaciones.trim() || undefined,
        interesConfirmado: true
      })
      toast({ title: "Empresa vinculada", description: "La empresa fue vinculada exitosamente" })
      onSuccess()
      setFormData({ empresaId: null, rolEmpresa: '', canalVinculacion: '', contactoNombre: '', contactoEmail: '', contactoTelefono: '', observaciones: '' })
      setSearch('')
    } catch (error) {
      toast({ variant: "destructive", title: "Error al vincular", description: error.response?.data?.message })
    } finally {
      setLoading(false)
    }
  }

  const empresaSeleccionada = Array.isArray(empresasDisponibles) 
    ? empresasDisponibles.find(e => e.id === formData.empresaId) : null
  const empresasFiltradas = getEmpresasFiltradas()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Vincular Empresa al Proceso
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-muted-foreground text-sm">
              Solo se pueden vincular empresas verificadas. Si no aparece en la lista,
              debe registrarse primero en el módulo de Empresas.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Company selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">
                  Buscar empresa <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Razón Social o RUC..."
                    className="pl-9 h-9"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Empresas disponibles</Label>
                {loadingEmpresas ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : empresasFiltradas.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg bg-dot-pattern">
                    {search ? 'No se encontraron empresas' : 'No hay empresas disponibles'}
                  </div>
                ) : (
                  <div className="border border-border rounded-lg max-h-64 overflow-y-auto bg-muted/20">
                    {empresasFiltradas.map((empresa) => {
                      const isSelected = formData.empresaId === empresa.id
                      return (
                        <button
                          key={empresa.id}
                          type="button"
                          onClick={() => handleSelectEmpresa(empresa)}
                          className={cn(
                            "w-full p-3 text-left transition-all border-b border-border last:border-b-0",
                            isSelected
                              ? "bg-primary/10 border-l-2 border-l-primary"
                              : "hover:bg-muted/50"
                          )}
                          disabled={loading}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm shrink-0",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground border border-border"
                            )}>
                              {empresa.razonSocial?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "font-medium truncate text-sm",
                                isSelected ? "text-primary" : "text-foreground"
                              )}>
                                {empresa.razonSocial}
                              </p>
                              <p className="text-[11px] text-muted-foreground tabular-nums">RUC: {empresa.ruc}</p>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {empresaSeleccionada && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-lg p-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Seleccionada</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">{empresaSeleccionada.razonSocial}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Linking details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">
                  Rol de la empresa <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.rolEmpresa} onValueChange={(v) => handleChange('rolEmpresa', v)} disabled={loading}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Seleccione el rol" /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(rol => (
                      <SelectItem key={rol.value} value={rol.value}>
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", rol.dot)} />
                          <div>
                            <span className="font-medium text-sm">{rol.label}</span>
                            <span className="text-[11px] text-muted-foreground ml-2">{rol.desc}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Canal de vinculación</Label>
                <Select value={formData.canalVinculacion} onValueChange={(v) => handleChange('canalVinculacion', v)} disabled={loading}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Seleccione el canal" /></SelectTrigger>
                  <SelectContent>
                    {CANALES.map(canal => (
                      <SelectItem key={canal} value={canal}>{canal}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Observaciones</Label>
                <Textarea
                  value={formData.observaciones}
                  onChange={(e) => handleChange('observaciones', e.target.value)}
                  placeholder="Detalles adicionales sobre el acuerdo..."
                  rows={4}
                  maxLength={500}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.empresaId || !formData.rolEmpresa}
              className="gap-1.5"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Vinculando...</>
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