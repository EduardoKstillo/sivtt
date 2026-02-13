import { useState } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import {
  MoreVertical, CheckCircle2, FileText, Edit, UserX, UserCheck,
  Shield, FileSignature
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
    label: 'Interesada',
    className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/40',
    dotColor: 'bg-sky-500',
    avatarGradient: 'from-sky-500 to-blue-500',
  },
  ALIADA: {
    label: 'Aliada',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40',
    dotColor: 'bg-indigo-500',
    avatarGradient: 'from-indigo-500 to-violet-500',
  },
  FINANCIADORA: {
    label: 'Financiadora',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40',
    dotColor: 'bg-amber-500',
    avatarGradient: 'from-amber-500 to-orange-500',
  },
}

export const EmpresaCard = ({ vinculacion, proceso, onUpdate }) => {
  const [ndaModalOpen, setNdaModalOpen] = useState(false)
  const [cartaModalOpen, setCartaModalOpen] = useState(false)
  const [rolModalOpen, setRolModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!vinculacion) return null

  const {
    id, empresa, rolEmpresa, estado, interesConfirmado,
    fechaVinculacion, canalVinculacion, ndaFirmado, ndaFechaFirma,
    cartaIntencionFirmada, cartaIntencionFecha, observaciones
  } = vinculacion

  const rolConfig = ROL_CONFIG[rolEmpresa]
  const isActiva = estado === 'ACTIVA'

  const handleConfirmarInteres = async () => {
    setLoading(true)
    try {
      await empresasAPI.updateVinculacion(proceso.id, id, { interesConfirmado: true })
      toast({ title: 'Interés confirmado' })
      onUpdate?.()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    } finally { setLoading(false) }
  }

  const handleRetirar = async () => {
    if (!confirm('¿Está seguro de retirar esta empresa del proceso?')) return
    setLoading(true)
    try {
      await empresasAPI.retirar(proceso.id, id)
      toast({ title: 'Empresa retirada' })
      onUpdate?.()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    } finally { setLoading(false) }
  }

  const handleReactivar = async () => {
    setLoading(true)
    try {
      await empresasAPI.reactivar(proceso.id, id)
      toast({ title: 'Empresa reactivada' })
      onUpdate?.()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    } finally { setLoading(false) }
  }

  return (
    <>
      <Card className="group">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">

              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className={cn(
                  "w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0 bg-gradient-to-br",
                  rolConfig?.avatarGradient || "from-slate-500 to-slate-600"
                )}>
                  {empresa?.razonSocial?.charAt(0) || 'E'}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {empresa?.razonSocial}
                    </h3>
                    {empresa?.verificada && (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    RUC: {empresa?.ruc}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {rolConfig && (
                  <Badge
                    variant="secondary"
                    className={cn("text-[11px] font-medium border gap-1.5", rolConfig.className)}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", rolConfig.dotColor)} />
                    {rolConfig.label}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[11px] font-medium border gap-1",
                    isActiva
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isActiva ? "bg-emerald-500" : "bg-muted-foreground/40"
                  )} />
                  {isActiva ? 'Activa' : 'Retirada'}
                </Badge>
                {!interesConfirmado && isActiva && (
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-medium border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                  >
                    Interés pendiente
                  </Badge>
                )}
              </div>

              {/* Metadata grid */}
              <div className="bg-muted/30 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Vinculación</span>
                    <p className="font-medium text-foreground tabular-nums mt-0.5">{formatDate(fechaVinculacion)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Canal</span>
                    <p className="font-medium text-foreground mt-0.5">{canalVinculacion || '—'}</p>
                  </div>
                </div>

                {/* Document status indicators */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Shield className={cn("h-3.5 w-3.5", ndaFirmado ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/40")} />
                    <span className={ndaFirmado ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-muted-foreground/60"}>
                      NDA {ndaFirmado ? '✓' : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <FileSignature className={cn("h-3.5 w-3.5", cartaIntencionFirmada ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/40")} />
                    <span className={cartaIntencionFirmada ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-muted-foreground/60"}>
                      Carta {cartaIntencionFirmada ? '✓' : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Observations */}
              {observaciones && (
                <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-md leading-relaxed italic">
                  "{observaciones}"
                </p>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled={loading}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {!interesConfirmado && isActiva && (
                  <>
                    <DropdownMenuItem onClick={handleConfirmarInteres}>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                      Confirmar interés
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem onClick={() => setNdaModalOpen(true)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Gestionar NDA
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setCartaModalOpen(true)}>
                  <FileSignature className="mr-2 h-4 w-4" />
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
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Retirar empresa
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleReactivar}>
                    <UserCheck className="mr-2 h-4 w-4 text-emerald-500" />
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
        onSuccess={() => { setNdaModalOpen(false); onUpdate?.() }}
      />
      <GestionarCartaIntencionModal
        open={cartaModalOpen}
        onOpenChange={setCartaModalOpen}
        vinculacion={vinculacion}
        proceso={proceso}
        onSuccess={() => { setCartaModalOpen(false); onUpdate?.() }}
      />
      <CambiarRolEmpresaModal
        open={rolModalOpen}
        onOpenChange={setRolModalOpen}
        vinculacion={vinculacion}
        proceso={proceso}
        onSuccess={() => { setRolModalOpen(false); onUpdate?.() }}
      />
    </>
  )
}