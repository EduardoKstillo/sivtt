import { useState, useMemo } from 'react'
import { Button } from '@components/ui/button'
import { Plus, Layers, History } from 'lucide-react'
import { ActividadCard } from './ActividadCard'
import { ActividadDrawer } from './ActividadDrawer'
import { ActividadesFilters } from './ActividadesFilters'
import { CrearEditarActividadModal } from './modals/CrearActividadModal' 
import { Pagination } from '@components/common/Pagination'
import { Skeleton } from '@components/ui/skeleton'
import { EmptyState } from '@components/common/EmptyState'
import { ErrorState } from '@components/common/ErrorState'
import { useActividades } from '@hooks/useActividades'
import { FLUJOS_FASES } from '@utils/constants'
import { FASE_STYLES } from '@utils/designTokens'
import { cn } from '@/lib/utils'

const FASES_POR_PAGINA = 3

export const ActividadesTab = ({ proceso, onUpdate }) => {
  const [selectedActividad, setSelectedActividad] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [actividadToEdit, setActividadToEdit] = useState(null)
  const [page, setPage] = useState(1)

  const {
    actividades,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch
  } = useActividades(proceso.id)

  const fases = useMemo(() => {
    if (!actividades?.length) return []

    const porFase = {}

    actividades.forEach(act => {
      if (!porFase[act.fase]) porFase[act.fase] = []
      porFase[act.fase].push(act)
    })

    const flujoOrden = FLUJOS_FASES[proceso.tipoActivo] || []

    return Object.entries(porFase)
      .sort(([a], [b]) => {
        const ia = flujoOrden.indexOf(a)
        const ib = flujoOrden.indexOf(b)
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
      })
      .map(([nombreFase, acts]) => {
        const porCiclo = {}

        acts.forEach(act => {
          const key = act.faseProcesoId || 'legacy'
          if (!porCiclo[key]) porCiclo[key] = []
          porCiclo[key].push(act)
        })

        const ciclos = Object.keys(porCiclo)
          .sort((a, b) => {
            if (a === 'legacy') return 1
            if (b === 'legacy') return -1
            return Number(b) - Number(a)
          })
          .map((id, index) => ({
            id,
            esActual: index === 0,
            items: porCiclo[id]
          }))

        return {
          nombreFase,
          total: acts.length,
          ciclos
        }
      })
  }, [actividades, proceso.tipoActivo])

  const totalPages = Math.ceil(fases.length / FASES_POR_PAGINA)
  const fasesPagina = fases.slice(
    (page - 1) * FASES_POR_PAGINA,
    page * FASES_POR_PAGINA
  )

  const hasFilters =
    (filters.fase && filters.fase !== 'Todas') ||
    (filters.estado && filters.estado !== 'Todos') ||
    (filters.tipo && filters.tipo !== 'Todos') ||
    filters.responsableId

  const handleCreate = () => {
    setActividadToEdit(null)
    setCreateModalOpen(true)
  }

  const handleEdit = (act) => {
    setActividadToEdit(act)
    setCreateModalOpen(true)
  }

  return (
    <div className="space-y-6 fade-in animate-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Tablero de Actividades
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión por fase, ciclo e historial
          </p>
        </div>

        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Actividad
        </Button>
      </div>

      <ActividadesFilters
        filters={filters}
        onFilterChange={(f) => {
          updateFilters(f)
          setPage(1)
        }}
        onReset={() => {
          resetFilters()
          setPage(1)
        }}
        proceso={proceso}
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Error al cargar actividades"
          message={error.response?.data?.message}
          onRetry={refetch}
        />
      ) : fases.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No se encontraron resultados' : 'No hay actividades registradas'}
          description={hasFilters ? 'Intenta ajustar los filtros' : 'Comienza creando la primera actividad'}
          action={hasFilters ? resetFilters : handleCreate}
          actionLabel={hasFilters ? 'Limpiar filtros' : 'Crear actividad'}
        />
      ) : (
        <>
          <div className="space-y-6">
            {fasesPagina.map(fase => {
              const faseStyle = FASE_STYLES[fase.nombreFase]
              return (
                <div
                  key={fase.nombreFase}
                  className="border border-border rounded-lg overflow-hidden bg-card shadow-sm"
                >
                  {/* Phase color accent */}
                  <div
                    className="h-0.5 w-full"
                    style={{ backgroundColor: faseStyle?.color || 'var(--border)' }}
                  />

                  <div className="bg-muted/30 px-4 py-3 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground text-sm">
                        {faseStyle?.label || fase.nombreFase}
                      </h3>
                    </div>
                    <span className="text-[11px] bg-card border border-border px-2 py-0.5 rounded-full text-muted-foreground font-medium tabular-nums">
                      {fase.total} actividades
                    </span>
                  </div>

                  <div className="p-4 space-y-6">
                    {fase.ciclos.map(ciclo => (
                      <div
                        key={ciclo.id}
                        className={!ciclo.esActual ? 'opacity-70' : ''}
                      >
                        {!ciclo.esActual && (
                          <div className="flex items-center gap-2 mb-3 text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                            <History className="h-3 w-3" />
                            Historial
                          </div>
                        )}

                        <div className={cn(
                          ciclo.esActual
                            ? 'space-y-3'
                            : 'space-y-2 pl-4 border-l-2 border-border'
                        )}>
                          {ciclo.items.map(act => (
                            <ActividadCard
                              key={act.id}
                              actividad={act}
                              onClick={() => setSelectedActividad(act)}
                              onRefresh={refetch}
                              onEdit={handleEdit}
                              compact={!ciclo.esActual}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <Pagination
              pagination={{ page, totalPages }}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <CrearEditarActividadModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        proceso={proceso}
        actividadToEdit={actividadToEdit}
        onSuccess={() => {
          setCreateModalOpen(false)
          setActividadToEdit(null)
          refetch()
          if (onUpdate) onUpdate()
        }}
      />

      {selectedActividad && (
        <ActividadDrawer
          actividadId={selectedActividad.id}
          open={!!selectedActividad}
          proceso={proceso}
          onClose={() => {
            setSelectedActividad(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}