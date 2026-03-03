import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Badge } from '@components/ui/badge'
import { Plus, Info, Building2 } from 'lucide-react'

import { EmpresaCard } from './EmpresaCard'
import { VincularEmpresaModal } from './modals/VincularEmpresaModal'

import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { EmptyState } from '@components/common/EmptyState'

import { useEmpresasProceso } from '@hooks/useEmpresasProceso'

// ✅ Importaciones para ReBAC
import { useAuthStore } from '@store/authStore'
import { ROLES } from '@utils/permissions'

export const EmpresasTab = ({ proceso, onUpdate }) => {
  const [vincularModalOpen, setVincularModalOpen] = useState(false)

  const {
    empresasActivas,
    empresasRetiradas,
    loading,
    error,
    refetch
  } = useEmpresasProceso(proceso.id)

  // ✅ LÓGICA ReBAC: Solo Admin o Gestor del Proceso pueden gestionar empresas
  const { user } = useAuthStore()
  const isAdmin = user?.roles?.includes(ROLES.ADMIN_SISTEMA)
  const isGestorProceso = proceso?.usuarios?.some(
    u => u.id === user?.id && u.rol?.codigo === 'GESTOR_PROCESO'
  )
  const canManageEmpresas = isAdmin || isGestorProceso

  if (loading) {
    return <div className="py-10"><LoadingSpinner /></div>
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar empresas"
        message="No se pudo cargar la información de las empresas vinculadas"
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="space-y-6 fade-in animate-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Empresas Vinculadas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión de aliados estratégicos y financiamiento
          </p>
        </div>

        {/* ✅ Solo los autorizados ven el botón de vincular */}
        {canManageEmpresas && (
          <Button onClick={() => setVincularModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Vincular Empresa
          </Button>
        )}
      </div>

      {/* Info */}
      <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-muted-foreground text-sm">
          Define el rol de cada empresa:
          <strong className="text-foreground"> Interesada</strong> (exploración),
          <strong className="text-foreground"> Aliada</strong> (compromiso técnico) o
          <strong className="text-foreground"> Financiadora</strong> (aporta recursos).
        </AlertDescription>
      </Alert>

      {/* Active companies */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground text-sm flex items-center gap-2">
          Activas
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 tabular-nums">
            {empresasActivas.length}
          </Badge>
        </h3>

        {empresasActivas.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No hay empresas vinculadas"
            description="Vincular empresas aumenta la viabilidad de la transferencia tecnológica."
            action={canManageEmpresas ? () => setVincularModalOpen(true) : undefined}
            actionLabel="Vincular primera empresa"
          />
        ) : (
          <div className="space-y-3">
            {empresasActivas.map((vinculacion) => (
              <EmpresaCard
                key={vinculacion.id}
                vinculacion={vinculacion}
                proceso={proceso}
                onUpdate={() => { refetch(); onUpdate?.() }}
                canManage={canManageEmpresas} // ✅ Pasamos el permiso a la tarjeta
              />
            ))}
          </div>
        )}
      </div>

      {/* Retired / Inactive */}
      {empresasRetiradas.length > 0 && (
        <div className="pt-6 border-t border-border">
          <h3 className="font-medium text-foreground text-sm mb-4 flex items-center gap-2">
            Historial de Retiros
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 tabular-nums">
              {empresasRetiradas.length}
            </Badge>
          </h3>

          <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
            {empresasRetiradas.map((vinculacion) => (
              <EmpresaCard
                key={vinculacion.id}
                vinculacion={vinculacion}
                proceso={proceso}
                onUpdate={refetch}
                canManage={canManageEmpresas} // ✅ Pasamos el permiso a la tarjeta
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal - Protegido en el renderizado */}
      {canManageEmpresas && (
        <VincularEmpresaModal
          open={vincularModalOpen}
          onOpenChange={setVincularModalOpen}
          proceso={proceso}
          onSuccess={() => { setVincularModalOpen(false); refetch(); onUpdate?.() }}
        />
      )}
    </div>
  )
}