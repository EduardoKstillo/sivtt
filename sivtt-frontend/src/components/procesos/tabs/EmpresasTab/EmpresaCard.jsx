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
  AlertCircle,
  Building2,
  Mail,
  Phone,
  MapPin
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

export const EmpresaCard = ({ empresa, proceso, onUpdate }) => {
  const [ndaModalOpen, setNdaModalOpen] = useState(false)
  const [cartaModalOpen, setCartaModalOpen] = useState(false)
  const [rolModalOpen, setRolModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const rolConfig = ROL_CONFIG[empresa.rolEmpresa]
  const isActiva = empresa.estadoVinculacion === 'ACTIVA'

  const handleConfirmarInteres = async () => {
    setLoading(true)
    try {
      await empresasAPI.updateVinculacion(proceso.id, empresa.empresaId, {
        interesConfirmado: true
      })

      toast({
        title: "Interés confirmado",
        description: "El interés de la empresa fue confirmado"
      })

      onUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al confirmar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetirar = async () => {
    if (!confirm('¿Está seguro de retirar esta empresa del proceso?')) return

    setLoading(true)
    try {
      await empresasAPI.retirar(proceso.id, empresa.empresaId)

      toast({
        title: "Empresa retirada",
        description: "La empresa fue retirada del proceso"
      })

      onUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al retirar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReactivar = async () => {
    setLoading(true)
    try {
      await empresasAPI.reactivar(proceso.id, empresa.empresaId)

      toast({
        title: "Empresa reactivada",
        description: "La empresa fue reactivada en el proceso"
      })

      onUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al reactivar",
        description: error.response?.data?.message || "Intente nuevamente"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {empresa.empresa?.nombre?.charAt(0) || 'E'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {empresa.empresa?.nombre}
                    </h3>
                    {empresa.empresa?.verificada && (
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    RUC: {empresa.empresa?.ruc}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={rolConfig.color}>
                  {rolConfig.icon} {rolConfig.label}
                </Badge>
                <Badge variant={isActiva ? 'default' : 'secondary'}>
                  {isActiva ? '✅ Activa' : '❌ Retirada'}
                </Badge>
                {!empresa.interesConfirmado && isActiva && (
                  <Badge className="bg-yellow-100 text-yellow-700">
                    ⏳ Interés pendiente
                  </Badge>
                )}
              </div>

              {/* Vinculación Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Fecha vinculación:</span>
                    <p className="font-medium text-gray-900">
                      {formatDate(empresa.fechaVinculacion)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Canal:</span>
                    <p className="font-medium text-gray-900">
                      {empresa.canalVinculacion || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* NDA y Carta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {/* NDA */}
                <div className={cn(
                  "border rounded-lg p-3",
                  empresa.ndaFirmado 
                    ? "border-green-200 bg-green-50"
                    : "border-yellow-200 bg-yellow-50"
                )}>
                  <div className="flex items-start gap-2">
                    <FileText className={cn(
                      "h-4 w-4 mt-0.5",
                      empresa.ndaFirmado ? "text-green-600" : "text-yellow-600"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium",
                        empresa.ndaFirmado ? "text-green-900" : "text-yellow-900"
                      )}>
                        NDA (Acuerdo de Confidencialidad)
                      </p>
                      {empresa.ndaFirmado ? (
                        <p className="text-xs text-green-700">
                          Firmado el {formatDate(empresa.ndaFechaFirma)}
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-700">
                          Pendiente de firma
                        </p>
                      )}
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-1 text-xs"
                        onClick={() => setNdaModalOpen(true)}
                      >
                        {empresa.ndaFirmado ? 'Ver documento' : 'Gestionar'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Carta de Intención */}
                <div className={cn(
                  "border rounded-lg p-3",
                  empresa.cartaIntencionFirmada 
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                )}>
                  <div className="flex items-start gap-2">
                    <FileText className={cn(
                      "h-4 w-4 mt-0.5",
                      empresa.cartaIntencionFirmada ? "text-green-600" : "text-gray-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium",
                        empresa.cartaIntencionFirmada ? "text-green-900" : "text-gray-700"
                      )}>
                        Carta de Intención
                      </p>
                      {empresa.cartaIntencionFirmada ? (
                        <p className="text-xs text-green-700">
                          Firmada el {formatDate(empresa.cartaIntencionFecha)}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          No registrada
                        </p>
                      )}
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-1 text-xs"
                        onClick={() => setCartaModalOpen(true)}
                      >
                        {empresa.cartaIntencionFirmada ? 'Ver documento' : 'Registrar'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacto */}
              {empresa.contactoNombre && (
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Contacto Principal
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="h-3 w-3" />
                      <span>{empresa.contactoNombre}</span>
                    </div>
                    {empresa.contactoEmail && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-3 w-3" />
                        <a href={`mailto:${empresa.contactoEmail}`} className="hover:underline">
                          {empresa.contactoEmail}
                        </a>
                      </div>
                    )}
                    {empresa.contactoTelefono && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{empresa.contactoTelefono}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {empresa.observaciones && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  💬 {empresa.observaciones}
                </div>
              )}
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={loading}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {!empresa.interesConfirmado && isActiva && (
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
        empresa={empresa}
        proceso={proceso}
        onSuccess={() => {
          setNdaModalOpen(false)
          onUpdate()
        }}
      />

      <GestionarCartaIntencionModal
        open={cartaModalOpen}
        onOpenChange={setCartaModalOpen}
        empresa={empresa}
        proceso={proceso}
        onSuccess={() => {
          setCartaModalOpen(false)
          onUpdate()
        }}
      />

      <CambiarRolEmpresaModal
        open={rolModalOpen}
        onOpenChange={setRolModalOpen}
        empresa={empresa}
        proceso={proceso}
        onSuccess={() => {
          setRolModalOpen(false)
          onUpdate()
        }}
      />
    </>
  )
}