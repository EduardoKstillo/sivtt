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
  FileText,
  Edit,
  UserX,
  UserCheck,
  Building2,
  Mail,
  Phone
} from 'lucide-react'

import { GestionarNDAModal } from './modals/GestionarNDAModal'
import { GestionarCartaIntencionModal } from './modals/GestionarCartaIntencionModal'
import { CambiarRolEmpresaModal } from './modals/CambiarRolEmpresaModal'

import { empresasAPI } from '@api/endpoints/empresas'
import { toast } from '@components/ui/use-toast'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

const ROL_CONFIG = {
  INTERESADA: {
    icon: '💡',
    label: 'Interesada',
    color: 'bg-blue-100 text-blue-700'
  },
  ALIADA: {
    icon: '🤝',
    label: 'Aliada',
    color: 'bg-purple-100 text-purple-700'
  },
  FINANCIADORA: {
    icon: '💰',
    label: 'Financiadora',
    color: 'bg-green-100 text-green-700'
  }
}

export const EmpresaCard = ({ vinculacion, proceso, onUpdate }) => {
  const [ndaModalOpen, setNdaModalOpen] = useState(false)
  const [cartaModalOpen, setCartaModalOpen] = useState(false)
  const [rolModalOpen, setRolModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!vinculacion) return null

  const {
    id,
    empresa,
    rolEmpresa,
    estado,
    interesConfirmado,
    fechaVinculacion,
    canalVinculacion,
    ndaFirmado,
    ndaFechaFirma,
    cartaIntencionFirmada,
    cartaIntencionFecha,
    observaciones
  } = vinculacion

  const rolConfig = ROL_CONFIG[rolEmpresa]
  const isActiva = estado === 'ACTIVA'

  /* -------------------- Actions -------------------- */

  const handleConfirmarInteres = async () => {
    setLoading(true)
    try {
      await empresasAPI.updateVinculacion(proceso.id, id, {
        interesConfirmado: true
      })

      toast({
        title: 'Interés confirmado',
        description: 'El interés de la empresa fue confirmado'
      })

      onUpdate?.()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al confirmar',
        description: error.response?.data?.message || 'Intente nuevamente'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetirar = async () => {
    if (!confirm('¿Está seguro de retirar esta empresa del proceso?')) return

    setLoading(true)
    try {
      await empresasAPI.retirar(proceso.id, id)

      toast({
        title: 'Empresa retirada',
        description: 'La empresa fue retirada del proceso'
      })

      onUpdate?.()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al retirar',
        description: error.response?.data?.message || 'Intente nuevamente'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReactivar = async () => {
    setLoading(true)
    try {
      await empresasAPI.reactivar(proceso.id, id)

      toast({
        title: 'Empresa reactivada',
        description: 'La empresa fue reactivada en el proceso'
      })

      onUpdate?.()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al reactivar',
        description: error.response?.data?.message || 'Intente nuevamente'
      })
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- UI -------------------- */

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">

              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {empresa?.razonSocial?.charAt(0) || 'E'}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {empresa?.razonSocial}
                    </h3>
                    {empresa?.verificada && (
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    RUC: {empresa?.ruc}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {rolConfig && (
                  <Badge className={rolConfig.color}>
                    {rolConfig.icon} {rolConfig.label}
                  </Badge>
                )}
                <Badge variant={isActiva ? 'default' : 'secondary'}>
                  {isActiva ? '✅ Activa' : '❌ Retirada'}
                </Badge>
                {!interesConfirmado && isActiva && (
                  <Badge className="bg-yellow-100 text-yellow-700">
                    ⏳ Interés pendiente
                  </Badge>
                )}
              </div>

              {/* Vinculación */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500">Fecha vinculación</span>
                    <p className="font-medium">{formatDate(fechaVinculacion)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Canal</span>
                    <p className="font-medium">{canalVinculacion || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {observaciones && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  💬 {observaciones}
                </div>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={loading}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {!interesConfirmado && isActiva && (
                  <>
                    <DropdownMenuItem onClick={handleConfirmarInteres}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirmar interés
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem onClick={() => setNdaModalOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Gestionar NDA
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setCartaModalOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Gestionar Carta Intención
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setRolModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Cambiar rol
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {isActiva ? (
                  <DropdownMenuItem
                    onClick={handleRetirar}
                    className="text-red-600 focus:text-red-600"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Retirar empresa
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleReactivar}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Reactivar empresa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <GestionarNDAModal
        open={ndaModalOpen}
        onOpenChange={setNdaModalOpen}
        vinculacion={vinculacion}
        proceso={proceso}
        onSuccess={() => {
          setNdaModalOpen(false)
          onUpdate?.()
        }}
      />

      <GestionarCartaIntencionModal
        open={cartaModalOpen}
        onOpenChange={setCartaModalOpen}
        vinculacion={vinculacion}
        proceso={proceso}
        onSuccess={() => {
          setCartaModalOpen(false)
          onUpdate?.()
        }}
      />

      <CambiarRolEmpresaModal
        open={rolModalOpen}
        onOpenChange={setRolModalOpen}
        vinculacion={vinculacion}
        proceso={proceso}
        onSuccess={() => {
          setRolModalOpen(false)
          onUpdate?.()
        }}
      />
    </>
  )
}
