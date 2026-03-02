import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Badge } from '@components/ui/badge'
import { Skeleton } from '@components/ui/skeleton'
import { Plus, Users, Info } from 'lucide-react'
import { MiembroEquipoCard } from './MiembroEquipoCard'
import { GestionarEquipoModal } from './modals/GestionarEquipoModal'
import { ErrorState } from '@components/common/ErrorState'
import { EmptyState } from '@components/common/EmptyState'
import { useEquipo } from '@hooks/useEquipo'
import { useAuth } from '@hooks/useAuth'
import { PERMISOS } from '@utils/permissions'
import { cn } from '@/lib/utils'

/**
 * Grupos de rol por código del seed (ámbito PROCESO).
 * ⚠️ El código correcto es OBSERVADOR_PROCESO, no OBSERVADOR.
 *    Ver constants.js actualizado.
 */
const GRUPOS_ROL = [
  {
    codigo:    'RESPONSABLE_PROCESO',
    titulo:    'Responsables',
    subtitulo: 'Dirección del proceso',
    dotClass:  'bg-primary',
  },
  {
    codigo:    'APOYO',
    titulo:    'Apoyo',
    subtitulo: 'Soporte operativo',
    dotClass:  'bg-violet-500',
  },
  {
    codigo:    'OBSERVADOR_PROCESO',
    titulo:    'Observadores',
    subtitulo: 'Solo lectura',
    dotClass:  'bg-muted-foreground/40',
  },
]

export const EquipoTab = ({ proceso }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const { equipo, loading, error, refetch } = useEquipo(proceso.id)

  const { can } = useAuth()
  const canEdit = can(PERMISOS.EDITAR_PROCESO)

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar equipo"
        message={error.response?.data?.message || 'No se pudo cargar la información del equipo'}
        onRetry={refetch}
      />
    )
  }

  // ── Agrupar por rol.codigo ────────────────────────────────
  const grupos = GRUPOS_ROL.map(g => ({
    ...g,
    miembros: equipo.filter(m => m.rol?.codigo === g.codigo)
  })).filter(g => g.miembros.length > 0)

  // Miembros con rol no contemplado en GRUPOS_ROL (fallback)
  const codigosConocidos = new Set(GRUPOS_ROL.map(g => g.codigo))
  const sinGrupo = equipo.filter(m => !codigosConocidos.has(m.rol?.codigo))

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            Equipo del Proceso
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Miembros con acceso y responsabilidades en este proceso
          </p>
        </div>

        {canEdit && (
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Miembro
          </Button>
        )}
      </div>

      {/* ── Info ────────────────────────────────────────────── */}
      <Alert className="bg-primary/5 border-primary/15 dark:bg-primary/10 dark:border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-muted-foreground text-xs">
          Los roles determinan permisos y responsabilidades dentro del proceso.
          Para cambiar el rol de un miembro, remuévelo y vuelve a asignarlo con el nuevo rol.
        </AlertDescription>
      </Alert>

      {/* ── Stats ───────────────────────────────────────────── */}
      {equipo.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total equipo
              </p>
              <p className="text-2xl font-bold text-foreground tabular-nums leading-tight">
                {equipo.length}
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-right">
            {GRUPOS_ROL.map(g => {
              const count = equipo.filter(m => m.rol?.codigo === g.codigo).length
              if (count === 0) return null
              return (
                <div key={g.codigo}>
                  <p className="text-xs text-muted-foreground">{g.titulo}</p>
                  <p className="text-lg font-semibold text-foreground tabular-nums">{count}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Lista ───────────────────────────────────────────── */}
      {equipo.length === 0 ? (
        <EmptyState
          title="No hay miembros en el equipo"
          description={
            canEdit
              ? 'Comienza agregando el primer miembro al proceso'
              : 'Aún no se han asignado miembros a este proceso'
          }
          action={canEdit ? () => setModalOpen(true) : undefined}
          actionLabel="Agregar primer miembro"
        />
      ) : (
        <div className="space-y-6">
          {grupos.map(grupo => (
            <section key={grupo.codigo}>
              <div className="flex items-center gap-2 mb-3">
                <span className={cn('w-2 h-2 rounded-full shrink-0', grupo.dotClass)} />
                <h3 className="text-sm font-semibold text-foreground">{grupo.titulo}</h3>
                <span className="text-xs text-muted-foreground">{grupo.subtitulo}</span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4 px-1.5 ml-auto tabular-nums"
                >
                  {grupo.miembros.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {grupo.miembros.map(miembro => (
                  <MiembroEquipoCard
                    key={`${miembro.usuarioId}-${miembro.rol?.id}`}
                    miembro={miembro}
                    proceso={proceso}
                    canEdit={canEdit}
                    onUpdate={refetch}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Fallback para roles no mapeados */}
          {sinGrupo.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full shrink-0 bg-muted-foreground/30" />
                <h3 className="text-sm font-semibold text-foreground">Otros roles</h3>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-auto">
                  {sinGrupo.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {sinGrupo.map(miembro => (
                  <MiembroEquipoCard
                    key={`${miembro.usuarioId}-${miembro.rol?.id}`}
                    miembro={miembro}
                    proceso={proceso}
                    canEdit={canEdit}
                    onUpdate={refetch}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Modal — solo se monta si tiene permiso ───────────── */}
      {canEdit && (
        <GestionarEquipoModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          proceso={proceso}
          equipoActual={equipo}
          onSuccess={() => { setModalOpen(false); refetch() }}
        />
      )}
    </div>
  )
}