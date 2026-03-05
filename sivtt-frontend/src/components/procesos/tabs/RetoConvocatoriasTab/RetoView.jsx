import { useState } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import {
  Building2, DollarSign, Calendar, Users,
  FileText, Edit, AlertTriangle, Target, Lock, Globe, ShieldAlert
} from 'lucide-react'
import { CrearRetoModal } from './modals/CrearRetoModal'
import { EditarRetoModal } from './modals/EditarRetoModal'
import { EmptyState } from '@components/common/EmptyState'
import { formatCurrency } from '@utils/formatters'
import { cn } from '@/lib/utils'

// ✅ Importaciones para ReBAC
import { useAuthStore } from '@store/authStore'
import { ROLES } from '@utils/permissions'

// Colores semánticos con opacidad — adaptan dark mode
const CONFIDENCIALIDAD_CONFIG = {
  PUBLICO: {
    label: 'Público',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    icon:  Globe
  },
  RESTRINGIDO: {
    label: 'Restringido',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    icon:  Lock
  },
  CONFIDENCIAL: {
    label: 'Confidencial',
    badge: 'bg-destructive/10 text-destructive border-destructive/20',
    icon:  ShieldAlert
  }
}

const PRIORIDAD_CONFIG = {
  1: { label: 'Muy Baja', badge: 'bg-muted text-muted-foreground' },
  2: { label: 'Baja',     badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  3: { label: 'Media',    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  4: { label: 'Alta',     badge: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  5: { label: 'Muy Alta', badge: 'bg-destructive/10 text-destructive border-destructive/20' }
}

export const RetoView = ({ reto, retoExists, proceso, onRetoCreated, onRetoUpdated }) => {
  const [crearModalOpen, setCrearModalOpen]   = useState(false)
  const [editarModalOpen, setEditarModalOpen] = useState(false)

  // ✅ LÓGICA ReBAC
  const { user } = useAuthStore()
  const isAdmin = user?.roles?.includes(ROLES.ADMIN_SISTEMA)
  const isGestorProceso = proceso?.usuarios?.some(
    u => u.id === user?.id && u.rol?.codigo === 'GESTOR_PROCESO'
  )
  const canManageReto = isAdmin || isGestorProceso

  if (!retoExists) {
    return (
      <>
        <EmptyState
          title="No hay reto registrado"
          description="Crea el reto tecnológico para este proceso de requerimiento"
          action={canManageReto ? () => setCrearModalOpen(true) : undefined}
          actionLabel="Crear Reto Tecnológico"
          icon={FileText}
        />
        {canManageReto && (
          <CrearRetoModal
            open={crearModalOpen}
            onOpenChange={setCrearModalOpen}
            proceso={proceso}
            onSuccess={() => { setCrearModalOpen(false); onRetoCreated() }}
          />
        )}
      </>
    )
  }

  const confidencialidad = CONFIDENCIALIDAD_CONFIG[reto.nivelConfidencialidad] || CONFIDENCIALIDAD_CONFIG.PUBLICO
  const prioridad        = PRIORIDAD_CONFIG[reto.prioridad] || PRIORIDAD_CONFIG[3]
  const IconConf         = confidencialidad.icon

  return (
    <>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground">
              {reto.titulo}
            </h3>
            {/* Badges — semánticos sin emojis */}
            <Badge
              variant="secondary"
              className={cn('text-[10px] h-5 gap-1', confidencialidad.badge)}
            >
              <IconConf className="h-2.5 w-2.5" />
              {confidencialidad.label}
            </Badge>
            <Badge
              variant="secondary"
              className={cn('text-[10px] h-5 gap-1', prioridad.badge)}
            >
              <AlertTriangle className="h-2.5 w-2.5" />
              Prioridad {reto.prioridad} — {prioridad.label}
            </Badge>
          </div>

          {canManageReto && (
            <Button
              onClick={() => setEditarModalOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
            >
              <Edit className="h-4 w-4" />
              Editar Reto
            </Button>
          )}
        </div>

        {/* Descripción */}
        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <h4 className="text-sm font-semibold text-foreground mb-3">Descripción General</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {reto.descripcion}
            </p>
          </CardContent>
        </Card>

        {/* Problema */}
        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              {/* text-destructive en lugar de text-red-600 */}
              <Target className="h-4 w-4 text-destructive" />
              Problema a Resolver
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {reto.problema}
            </p>
          </CardContent>
        </Card>

        {/* Objetivos */}
        {reto.objetivos && (
          <Card className="bg-card border-border">
            <CardContent className="pt-5">
              <h4 className="text-sm font-semibold text-foreground mb-3">Objetivos</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {reto.objetivos}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ficha Técnica */}
        {reto.fichaTecnica && (
          <Card className="bg-card border-border">
            <CardContent className="pt-5">
              <h4 className="text-sm font-semibold text-foreground mb-4">Ficha Técnica</h4>

              {reto.fichaTecnica.empresaSolicitante && (
                <div className="flex items-center gap-3 mb-5">
                  {/* Avatar empresa — bg-primary/10 text-primary sin gradiente */}
                  <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Empresa Solicitante</p>
                    <h5 className="text-base font-semibold text-foreground">
                      {reto.fichaTecnica.empresaSolicitante}
                    </h5>
                  </div>
                </div>
              )}

              {/* Métricas — bg-*-500/10 semántico en lugar de bg-*-50 hardcodeado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {reto.fichaTecnica.presupuestoEstimado && (
                  <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <DollarSign className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-emerald-600 font-medium">Presupuesto</p>
                      <p className="text-base font-bold text-foreground tabular-nums">
                        {formatCurrency(reto.fichaTecnica.presupuestoEstimado)}
                      </p>
                    </div>
                  </div>
                )}

                {reto.fichaTecnica.duracionEstimada && (
                  <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Duración</p>
                      <p className="text-base font-bold text-foreground tabular-nums">
                        {reto.fichaTecnica.duracionEstimada} meses
                      </p>
                    </div>
                  </div>
                )}

                {reto.timelineEstimado && (
                  <div className="flex items-start gap-3 p-4 bg-violet-500/10 rounded-lg border border-violet-500/20">
                    <Calendar className="h-5 w-5 text-violet-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-violet-600 font-medium">Timeline</p>
                      <p className="text-base font-bold text-foreground tabular-nums">
                        {reto.timelineEstimado} días
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {reto.fichaTecnica.equipoDisponible && (
                // bg-muted/40 border-border en lugar de bg-gray-50 hardcodeado
                <div className="mt-4 p-3 bg-muted/40 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Equipo Disponible</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{reto.fichaTecnica.equipoDisponible}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resultados Esperados */}
        {reto.resultadosEsperados && (
          <Card className="bg-card border-border">
            <CardContent className="pt-5">
              <h4 className="text-sm font-semibold text-foreground mb-3">Resultados Esperados</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {reto.resultadosEsperados}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Restricciones — amber semántico en lugar de orange hardcodeado */}
        {reto.restricciones && (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-5">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Restricciones
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {reto.restricciones}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {canManageReto && (
        <EditarRetoModal
          open={editarModalOpen}
          onOpenChange={setEditarModalOpen}
          reto={reto}
          proceso={proceso}
          onSuccess={() => { setEditarModalOpen(false); onRetoUpdated() }}
        />
      )}
    </>
  )
}