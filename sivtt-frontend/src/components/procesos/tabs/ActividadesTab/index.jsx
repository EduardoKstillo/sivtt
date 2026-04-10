import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom' // ✅ Importamos para URL
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Plus, Layers, History, Building2 } from 'lucide-react'
import { ActividadCard } from './ActividadCard'
import { ActividadDrawer } from './ActividadDrawer'
import { ActividadesFilters } from './ActividadesFilters'
import { CrearEditarActividadModal } from './modals/CrearEditarActividadModal'
import { Pagination } from '@components/common/Pagination'
import { Skeleton } from '@components/ui/skeleton'
import { EmptyState } from '@components/common/EmptyState'
import { ErrorState } from '@components/common/ErrorState'
import { useActividades } from '@hooks/useActividades'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@components/ui/accordion' // ✅ Importamos Accordion
import { useAuthStore } from '@store/authStore'
import { ROLES } from '@utils/permissions'
import { FLUJOS_FASES } from '@utils/constants'
import { FASE_STYLES } from '@utils/designTokens'
import { cn } from '@/lib/utils'

const FASES_POR_PAGINA = 5 // ✅ Lo aumenté un poco ya que con acordeones ocupa menos espacio

export const ActividadesTab = ({ proceso, onUpdate }) => {
  const [selectedActividad, setSelectedActividad] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [actividadToEdit, setActividadToEdit] = useState(null)

  // ✅ Conectamos paginación a la URL
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page')) || 1

  const { user } = useAuthStore()
  const isAdmin = user?.roles?.includes(ROLES.ADMIN_SISTEMA)
  const isGestorProceso = proceso.usuarios?.some(
    u => u.id === user?.id && u.rol?.codigo === 'GESTOR_PROCESO'
  )
  const isLiderFase = proceso.usuarios?.some(
    u => u.id === user?.id && u.rol?.codigo === 'LIDER_FASE'
  )
  const canManageActividades = isAdmin || isGestorProceso || isLiderFase

  // ✅ Tu hook useActividades. Asumo que internamente también lo conectaste a la URL si hiciste el cambio ahí. 
  // Si useActividades no maneja la URL, la paginación aquí es puramente visual en esta pestaña.
  const { actividades, loading, error, filters, updateFilters, resetFilters, refetch } = useActividades(proceso.id)

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
        const ia = flujoOrden.indexOf(a); const ib = flujoOrden.indexOf(b)
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
            if (a === 'legacy') return 1; if (b === 'legacy') return -1
            return Number(b) - Number(a)
          })
          .map((id, index) => ({ id, esActual: index === 0, items: porCiclo[id] }))
        return { nombreFase, total: acts.length, ciclos }
      })
  }, [actividades, proceso.tipoActivo])

  const totalPages = Math.ceil(fases.length / FASES_POR_PAGINA)
  const fasesPagina = fases.slice((page - 1) * FASES_POR_PAGINA, page * FASES_POR_PAGINA)
  const hasFilters = (filters.fase && filters.fase !== 'Todas') || (filters.estado && filters.estado !== 'Todos') || (filters.tipo && filters.tipo !== 'Todos') || filters.responsableId

  const handleCreate = () => { setActividadToEdit(null); setCreateModalOpen(true) }
  const handleEdit = (act) => { setActividadToEdit(act); setCreateModalOpen(true) }

  const handlePageChange = (newPage) => {
    const currentParams = Object.fromEntries(searchParams.entries())
    setSearchParams({ ...currentParams, page: newPage }, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ✅ Función para manejar cambio de filtros y resetear la página
  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters)
    const currentParams = Object.fromEntries(searchParams.entries())
    setSearchParams({ ...currentParams, page: 1 }, { replace: true })
  }

  return (
    <div className="space-y-6 fade-in animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Tablero de Actividades</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestión por fase, ciclo e historial</p>
        </div>

        {canManageActividades && (
          <Button onClick={handleCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Nueva Actividad
          </Button>
        )}
      </div>

      <ActividadesFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onReset={() => { resetFilters(); handlePageChange(1); }} 
        proceso={proceso} 
      />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
      ) : error ? (
        <ErrorState title="Error al cargar actividades" message={error.response?.data?.message} onRetry={refetch} />
      ) : fases.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No se encontraron resultados' : 'No hay actividades registradas'}
          description={hasFilters ? 'Intenta ajustar los filtros' : canManageActividades ? 'Comienza creando la primera actividad' : 'No hay actividades registradas aún'}
          action={hasFilters ? resetFilters : canManageActividades ? handleCreate : null}
          actionLabel={hasFilters ? 'Limpiar filtros' : 'Crear actividad'}
        />
      ) : (
        <>
          {/* ✅ Cambiamos el contenedor estático por un Accordion */}
          <Accordion 
            type="multiple" 
            defaultValue={[proceso.faseActual]} // Abrimos por defecto la fase en la que se encuentra el proceso
            className="space-y-4"
          >
            {fasesPagina.map(fase => {
              const faseStyle = FASE_STYLES[fase.nombreFase]
              
              return (
                <AccordionItem 
                  key={fase.nombreFase} 
                  value={fase.nombreFase}
                  className="border border-border rounded-xl overflow-hidden bg-card shadow-sm"
                >
                  <div className="h-1 w-full" style={{ backgroundColor: faseStyle?.color || 'var(--border)' }} />
                  
                  {/* ✅ El Trigger del Acordeón ahora es la cabecera */}
                  <AccordionTrigger className="bg-muted/30 px-5 py-3 hover:no-underline hover:bg-muted/50 transition-colors data-[state=open]:border-b data-[state=open]:border-border">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-1.5 rounded-md shrink-0", faseStyle ? faseStyle.bgClass : "bg-muted")}>
                           <Layers className={cn("h-4 w-4", faseStyle ? faseStyle.textClass : "text-muted-foreground")} />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">{faseStyle?.label || fase.nombreFase}</h3>
                      </div>
                      <Badge variant="outline" className="text-[11px] bg-background shrink-0 shadow-sm tabular-nums">
                        {fase.total} actividades
                      </Badge>
                    </div>
                  </AccordionTrigger>

                  {/* ✅ El contenido se oculta/muestra automáticamente */}
                  <AccordionContent className="p-5 space-y-6">
                    {fase.ciclos.map(ciclo => (
                      <div key={ciclo.id} className={!ciclo.esActual ? 'opacity-75' : ''}>
                        {!ciclo.esActual && (
                          <div className="flex items-center gap-2 mb-3 text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                            <History className="h-3.5 w-3.5" /> Historial de Ciclo Pasado
                          </div>
                        )}
                        <div className={cn(
                          ciclo.esActual ? 'space-y-3' : 'space-y-2 pl-4 border-l-2 border-border/60'
                        )}>
                          {ciclo.items.map(act => (
                            <ActividadCard
                              key={act.id}
                              actividad={act}
                              onClick={() => setSelectedActividad(act)}
                              onRefresh={refetch}
                              onEdit={handleEdit}
                              compact={!ciclo.esActual}
                              canManage={canManageActividades && ciclo.esActual} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          {totalPages > 1 && <Pagination pagination={{ page, totalPages }} onPageChange={handlePageChange} />}
        </>
      )}

      {canManageActividades && (
        <CrearEditarActividadModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          proceso={proceso}
          actividadToEdit={actividadToEdit}
          onSuccess={() => { setCreateModalOpen(false); setActividadToEdit(null); refetch(); if (onUpdate) onUpdate() }}
        />
      )}

      {selectedActividad && (
        <ActividadDrawer
          actividadId={selectedActividad.id}
          open={!!selectedActividad}
          proceso={proceso}
          onClose={() => { setSelectedActividad(null); refetch() }}
        />
      )}
    </div>
  )
}