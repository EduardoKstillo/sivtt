import { useState, useEffect, useMemo } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@components/ui/select'
import { Loader2, Search, UserPlus, Check } from 'lucide-react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { usersAPI } from '@api/endpoints/users' 
import { toast } from '@components/ui/use-toast'
import { cn } from '@/lib/utils'

export const AgregarAsignacionModal = ({ open, onOpenChange, actividad, asignacionesActuales, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  const [search, setSearch] = useState('')
  const [rol, setRol] = useState('')
  const [selectedUsuario, setSelectedUsuario] = useState(null)

  // Cargar usuarios al abrir
  useEffect(() => {
    if (open) {
      fetchUsuarios()
      setSearch('')
      setRol('')
      setSelectedUsuario(null)
    }
  }, [open])

  const fetchUsuarios = async () => {
    setLoadingUsers(true)
    try {
      // Asumiendo que existe endpoint para listar todos los usuarios
      const { data } = await usersAPI.list({ activo: true }) 
      // Ajusta esto según tu respuesta real: data.data.usuarios o data
      setUsuarios(data.data?.usuarios || data || [])
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "Error al cargar usuarios" })
    } finally {
      setLoadingUsers(false)
    }
  }

  // ✅ OPTIMIZACIÓN: Filtrado memorizado
  const usuariosDisponibles = useMemo(() => {
    // 1. Obtener IDs ya asignados para excluirlos
    const idsAsignados = new Set(asignacionesActuales.map(a => a.usuario.id))
    
    // 2. Filtrar
    let filtered = usuarios.filter(u => !idsAsignados.has(u.id))

    // 3. Búsqueda
    if (search.trim()) {
      const term = search.toLowerCase()
      filtered = filtered.filter(u => 
        u.nombres.toLowerCase().includes(term) ||
        u.apellidos.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      )
    }

    return filtered.slice(0, 10) // Top 10 para rendimiento de UI
  }, [usuarios, asignacionesActuales, search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedUsuario || !rol) return

    setLoading(true)
    try {
      await actividadesAPI.assignUser(actividad.id, {
        usuarioId: selectedUsuario.id,
        rol
      })

      toast({
        title: "Usuario asignado",
        description: `${selectedUsuario.nombres} ahora es ${rol.toLowerCase()}`
      })
      onSuccess()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al asignar",
        description: error.response?.data?.message || "Error desconocido"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Asignar Usuario
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Selección de Rol */}
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={rol} onValueChange={setRol} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione función..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESPONSABLE">
                    <div className="flex flex-col text-left">
                        <span className="font-medium">Responsable</span>
                        <span className="text-xs text-gray-500">Sube evidencias y gestiona</span>
                    </div>
                </SelectItem>
                <SelectItem value="REVISOR">
                    <div className="flex flex-col text-left">
                        <span className="font-medium">Revisor</span>
                        <span className="text-xs text-gray-500">Aprueba o rechaza entregables</span>
                    </div>
                </SelectItem>
                <SelectItem value="PARTICIPANTE">
                    <div className="flex flex-col text-left">
                        <span className="font-medium">Participante</span>
                        <span className="text-xs text-gray-500">Solo visualización y reuniones</span>
                    </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 2. Búsqueda de Usuario */}
          <div className="space-y-2">
            <Label>Usuario</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Lista de Resultados */}
            <div className="border rounded-md h-[240px] overflow-y-auto mt-2 bg-gray-50/50 p-1">
              {loadingUsers ? (
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              ) : usuariosDisponibles.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500 text-center px-4">
                  {search ? 'No se encontraron usuarios' : 'Todos los usuarios disponibles ya están asignados'}
                </div>
              ) : (
                <div className="space-y-1">
                  {usuariosDisponibles.map(user => {
                    const isSelected = selectedUsuario?.id === user.id
                    return (
                        <div
                        key={user.id}
                        onClick={() => setSelectedUsuario(user)}
                        className={cn(
                            "p-2.5 rounded-md cursor-pointer transition-all flex items-center justify-between border",
                            isSelected 
                                ? "bg-blue-50 border-blue-200 shadow-sm" 
                                : "bg-white border-transparent hover:bg-gray-100 border-gray-100"
                        )}
                        >
                        <div>
                            <p className={cn("text-sm font-medium", isSelected ? "text-blue-700" : "text-gray-900")}>
                                {user.nombres} {user.apellidos}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                        </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading || !selectedUsuario || !rol}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Asignar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}