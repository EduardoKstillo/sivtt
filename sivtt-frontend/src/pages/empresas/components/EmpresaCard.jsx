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

export const EmpresaCard = ({ empresa, onUpdate }) => {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [verificarModalOpen, setVerificarModalOpen] = useState(false)

  // Helper para formatear el sector (ej: AGRICULTURA -> Agricultura)
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
      <Card className="hover:shadow-lg transition-shadow group relative">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Logo/Initial basado en Razón Social */}
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-sm">
              {empresa.razonSocial?.charAt(0).toUpperCase() || 'E'}
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar información
                </DropdownMenuItem>

                {!empresa.verificada && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setVerificarModalOpen(true)}
                      className="text-blue-600 focus:text-blue-700"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verificar empresa
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="space-y-3">
            {/* Nombre (Razón Social) */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 line-clamp-1" title={empresa.razonSocial}>
                  {empresa.razonSocial}
                </h3>
                {empresa.verificada ? (
                  <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" title="Verificada" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" title="Pendiente de verificación" />
                )}
              </div>
              <p className="text-sm text-gray-500 font-mono">
                RUC: {empresa.ruc}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {empresa.verificada ? (
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                  Verificada
                </Badge>
              ) : (
                <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
                  Pendiente
                </Badge>
              )}
              {empresa.sector && (
                <Badge variant="outline" className="capitalize">
                  {formatSector(empresa.sector)}
                </Badge>
              )}
            </div>

            {/* Info Detallada */}
            <div className="space-y-2 text-sm text-gray-600 pt-3 border-t mt-3">
              {/* Dirección / Ubicación */}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1 text-gray-500">
                  {getUbicacion()}
                </span>
              </div>

              {/* Email */}
              {empresa.email ? (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${empresa.email}`} className="line-clamp-1 hover:text-blue-600 transition-colors">
                    {empresa.email}
                  </a>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-gray-400">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="italic text-xs">Sin email registrado</span>
                </div>
              )}

              {/* Teléfono */}
              {empresa.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{empresa.telefono}</span>
                </div>
              )}
            </div>

            {/* Stats Footer */}
            <div className="pt-3 mt-1 flex items-center justify-between text-xs text-gray-500 bg-gray-50 -mx-6 -mb-6 px-6 py-3 border-t">
               <span>
                 Vinculaciones
               </span>
               <span className="font-medium bg-white px-2 py-0.5 rounded border shadow-sm">
                 {empresa.procesosVinculados || 0}
               </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
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
  )
}