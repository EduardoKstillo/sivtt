import { useState } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { 
  MoreVertical, 
  Users,
  Edit,
  Power,
  Star
} from 'lucide-react'
import { GestionarMiembrosGrupoModal } from '../modals/GestionarMiembrosGrupoModal'
import { gruposAPI } from '@api/endpoints/grupos'
import { toast } from '@components/ui/use-toast'

export const GrupoCard = ({ grupo, onUpdate }) => {
  const [miembrosModalOpen, setMiembrosModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggleActivo = async () => {
    setLoading(true)
    try {
      await gruposAPI.toggleActivo(grupo.id)

      toast({
        title: grupo.activo ? "Grupo desactivado" : "Grupo activado",
        description: grupo.activo 
          ? "El grupo fue desactivado exitosamente"
          : "El grupo fue activado exitosamente"
      })

      onUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cambiar estado",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Logo/Initial */}
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {grupo.codigo?.charAt(0) || 'G'}
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={loading}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem disabled>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setMiembrosModalOpen(true)}>
                  <Users className="mr-2 h-4 w-4" />
                  Gestionar miembros
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleToggleActivo}>
                  <Power className="mr-2 h-4 w-4" />
                  {grupo.activo ? 'Desactivar' : 'Activar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="space-y-3">
            {/* Nombre y Código */}
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                {grupo.nombre}
              </h3>
              <p className="text-sm text-gray-500">
                {grupo.codigo}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {grupo.activo ? (
                <Badge className="bg-green-100 text-green-700">
                  ✅ Activo
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-700">
                  ❌ Inactivo
                </Badge>
              )}
              {grupo.lineaInvestigacion && (
                <Badge variant="outline">
                  {grupo.lineaInvestigacion}
                </Badge>
              )}
            </div>

            {/* Descripción */}
            {grupo.descripcion && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {grupo.descripcion}
              </p>
            )}

            {/* Líder */}
            {grupo.lider && (
              <div className="flex items-center gap-2 text-sm pt-2 border-t">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-gray-600">Líder:</span>
                <span className="font-medium text-gray-900">
                  {grupo.lider.nombre}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="h-4 w-4" />
                <span>{grupo.miembros?.length || 0} miembros</span>
              </div>
              {grupo.postulaciones > 0 && (
                <span className="text-xs text-gray-500">
                  {grupo.postulaciones} postulaciones
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <GestionarMiembrosGrupoModal
        open={miembrosModalOpen}
        onOpenChange={setMiembrosModalOpen}
        grupo={grupo}
        onSuccess={() => {
          setMiembrosModalOpen(false)
          onUpdate()
        }}
      />
    </>
  )
}