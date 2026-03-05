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
  CheckCircle2,
  Clock,
  Edit,
  MapPin,
  Mail,
  Phone
} from 'lucide-react'
import { EditarEmpresaModal } from '../modals/EditarEmpresaModal'
import { VerificarEmpresaModal } from '../modals/VerificarEmpresaModal'

// ✅ Recibimos la prop canManage
export const EmpresaCard = ({ empresa, onUpdate, canManage }) => {
  const [editModalOpen, setEditModalOpen]         = useState(false)
  const [verificarModalOpen, setVerificarModalOpen] = useState(false)

  // Helper para formatear el sector
  const formatSector = (sector) => {
    if (!sector) return ''
    return sector.charAt(0) + sector.slice(1).toLowerCase().replace(/_/g, ' ')
  }

  // Construir dirección legible
  const getUbicacion = () => {
    const parts = [
      empresa.direccion,
      empresa.distrito,
      empresa.provincia || empresa.departamento
    ].filter(Boolean)
    return parts.join(', ') || 'Sin ubicación registrada'
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow group relative overflow-hidden bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3 mb-4">

            {/* Avatar inicial — usa bg-primary/10 y text-primary en lugar de gradiente hardcodeado */}
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
              {empresa.razonSocial?.charAt(0).toUpperCase() || 'E'}
            </div>

            {/* ✅ Actions Menu: Protegido por canManage */}
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar información
                  </DropdownMenuItem>

                  {!empresa.verificada && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setVerificarModalOpen(true)}
                        className="text-primary focus:text-primary"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Verificar empresa
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">

            {/* Nombre y estado de verificación */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className="font-semibold text-foreground text-sm line-clamp-1"
                  title={empresa.razonSocial}
                >
                  {empresa.razonSocial}
                </h3>
                {empresa.verificada ? (
                  <CheckCircle2
                    className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0"
                    title="Verificada"
                  />
                ) : (
                  <Clock
                    className="h-3.5 w-3.5 text-amber-500 flex-shrink-0"
                    title="Pendiente de verificación"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                RUC: {empresa.ruc}
              </p>
            </div>

            {/* Badges — usa colores semánticos del sistema */}
            <div className="flex flex-wrap gap-1.5">
              {empresa.verificada ? (
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15"
                >
                  Verificada
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15"
                >
                  Pendiente
                </Badge>
              )}
              {empresa.sector && (
                <Badge variant="outline" className="text-[10px] h-5 capitalize">
                  {formatSector(empresa.sector)}
                </Badge>
              )}
            </div>

            {/* Info de contacto */}
            <div className="space-y-1.5 text-xs text-muted-foreground pt-3 border-t border-border">
              {/* Ubicación */}
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{getUbicacion()}</span>
              </div>

              {/* Email */}
              {empresa.email ? (
                <div className="flex items-start gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <a
                    href={`mailto:${empresa.email}`}
                    className="line-clamp-1 hover:text-primary transition-colors"
                  >
                    {empresa.email}
                  </a>
                </div>
              ) : (
                <div className="flex items-start gap-2 opacity-50">
                  <Mail className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span className="italic">Sin email registrado</span>
                </div>
              )}

              {/* Teléfono */}
              {empresa.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span>{empresa.telefono}</span>
                </div>
              )}
            </div>

            {/* Stats footer — bg-muted/30 en lugar de bg-gray-50 hardcodeado */}
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 -mx-6 -mb-6 px-5 py-3 border-t border-border mt-1">
              <span>Vinculaciones</span>
              <span className="font-medium tabular-nums bg-card px-2 py-0.5 rounded border border-border shadow-sm">
                {empresa.procesosVinculados || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Modals protegidos */}
      {canManage && (
        <>
          <EditarEmpresaModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            empresa={empresa}
            onSuccess={() => {
              setEditModalOpen(false)
              onUpdate()
            }}
          />

          <VerificarEmpresaModal
            open={verificarModalOpen}
            onOpenChange={setVerificarModalOpen}
            empresa={empresa}
            onSuccess={() => {
              setVerificarModalOpen(false)
              onUpdate()
            }}
          />
        </>
      )}
    </>
  )
}