import { useState } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { MoreVertical, Users, Edit, Power, Star } from 'lucide-react'
import { GestionarMiembrosGrupoModal } from '../modals/GestionarMiembrosGrupoModal'
import { gruposAPI } from '@api/endpoints/grupos'
import { toast } from '@components/ui/use-toast'

// ✅ Recibimos canManage
export const GrupoCard = ({ grupo, onUpdate, canManage }) => {
  const [miembrosModalOpen, setMiembrosModalOpen] = useState(false)
  const [loading, setLoading]                     = useState(false)

  const handleToggleActivo = async () => {
    setLoading(true)
    try {
      await gruposAPI.toggleActivo(grupo.id)
      toast({
        title: grupo.activo ? 'Grupo desactivado' : 'Grupo activado',
        description: grupo.activo ? 'El grupo fue desactivado' : 'El grupo fue activado'
      })
      onUpdate()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow bg-card border-border overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
              {grupo.codigo?.charAt(0) || 'G'}
            </div>

            {/* ✅ El menú solo se renderiza si canManage es true */}
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={loading} className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem disabled>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setMiembrosModalOpen(true)}>
                    <Users className="mr-2 h-4 w-4" /> Gestionar miembros
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleToggleActivo}>
                    <Power className="mr-2 h-4 w-4" />
                    {grupo.activo ? 'Desactivar' : 'Activar'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">{grupo.nombre}</h3>
              <p className="text-xs text-muted-foreground font-mono">{grupo.codigo}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {grupo.activo ? (
                <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15">Activo</Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] h-5 bg-muted text-muted-foreground hover:bg-muted/80">Inactivo</Badge>
              )}
              {grupo.lineaInvestigacion && (
                <Badge variant="outline" className="text-[10px] h-5">{grupo.lineaInvestigacion}</Badge>
              )}
            </div>

            {grupo.descripcion && (
              <p className="text-xs text-muted-foreground line-clamp-2">{grupo.descripcion}</p>
            )}

            {grupo.lider && (
              <div className="flex items-center gap-2 text-xs pt-2 border-t border-border">
                <Star className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                <span className="text-muted-foreground">Líder:</span>
                <span className="font-medium text-foreground truncate">{grupo.lider.nombre}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 -mx-6 -mb-6 px-5 py-3 border-t border-border mt-1">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>{grupo.miembros?.length || 0} miembros</span>
              </div>
              {grupo.postulaciones > 0 && (
                <span className="tabular-nums">{grupo.postulaciones} postulaciones</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Modal protegido para que no pese en el DOM */}
      {canManage && (
        <GestionarMiembrosGrupoModal
          open={miembrosModalOpen}
          onOpenChange={setMiembrosModalOpen}
          grupo={grupo}
          onSuccess={() => { setMiembrosModalOpen(false); onUpdate() }}
        />
      )}
    </>
  )
}