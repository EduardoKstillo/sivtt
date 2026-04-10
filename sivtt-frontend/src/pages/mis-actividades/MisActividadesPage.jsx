import { useState } from 'react'
import { useSearchParams } from 'react-router-dom' // ✅ Para el estado de Tabs
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Badge } from '@components/ui/badge'
import { Skeleton } from '@components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@components/ui/select'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@components/ui/accordion' // ✅ Importamos Accordion
import {
  Zap, Clock, CheckCircle2, Search, SlidersHorizontal,
  Plus, RefreshCw, Inbox, Building2,
} from 'lucide-react'
import { useMisActividades } from '@hooks/useMisActividades'
import { MiActividadCard } from './components/MiActividadCard'
import { ActividadDrawer } from '@components/procesos/tabs/ActividadesTab/ActividadDrawer'
import { CrearEditarActividadModal } from '@components/procesos/tabs/ActividadesTab/modals/CrearEditarActividadModal'
import { useAuth } from '@hooks/useAuth'
import { PERMISOS } from '@utils/permissions'
import { cn } from '@/lib/utils'

// ── Configuración de Tabs ────────────────────────────────────────────────────
const TABS = [
  {
    id:         'requierenAtencion',
    titulo:     'Requieren atención',
    icono:      Zap,
    countClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    emptyMsg:   'No tienes actividades urgentes o atrasadas.',
  },
  {
    id:         'enCurso',
    titulo:     'En curso',
    icono:      Clock,
    countClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    emptyMsg:   'No tienes actividades en ejecución.',
  },
  {
    id:         'finalizadas',
    titulo:     'Finalizadas',
    icono:      CheckCircle2,
    countClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    emptyMsg:   'Aún no has completado ninguna actividad.',
  },
]

// ── Grupo por proceso (AHORA ES UN ACORDEÓN) ─────────────────────────────────
const GrupoProceso = ({ grupo, onActividadClick }) => (
  <AccordionItem value={grupo.proceso?.id || 'sin-proceso'} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mb-3">
    <AccordionTrigger className="bg-muted/40 px-4 py-2.5 hover:no-underline hover:bg-muted/60 transition-colors">
      <div className="flex items-center justify-between w-full pr-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
            <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm font-medium text-foreground truncate">
            <span className="font-bold">{grupo.proceso?.codigo}</span>
            {grupo.proceso?.titulo && (
              <span className="ml-1.5 text-muted-foreground font-normal">
                · {grupo.proceso.titulo}
              </span>
            )}
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] bg-background shrink-0 tabular-nums shadow-sm">
          {grupo.actividades.length} act.
        </Badge>
      </div>
    </AccordionTrigger>

    <AccordionContent className="p-2.5 flex flex-col gap-2 bg-muted/10 border-t border-border/50">
      {grupo.actividades.map(act => (
        <MiActividadCard
          key={act.id}
          actividad={act}
          onClick={() => onActividadClick(act)}
        />
      ))}
    </AccordionContent>
  </AccordionItem>
)

// ── Skeletons ────────────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="space-y-3 mt-4">
    <Skeleton className="h-10 w-full rounded-lg" />
    <div className="space-y-3 pt-2">
      {[1, 2].map(i => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  </div>
)

// ── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ mensaje, hasFilters, onReset, canCrear, onCrear }) => (
  hasFilters ? (
    <div className="flex flex-col items-center justify-center py-14 gap-3 bg-muted/20 rounded-xl border border-dashed border-border mt-4">
      <p className="text-muted-foreground text-sm font-medium">
        No se encontraron resultados con los filtros actuales.
      </p>
      <Button variant="secondary" size="sm" onClick={onReset}>
        Limpiar filtros
      </Button>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-border rounded-xl bg-muted/10 mt-4">
      <p className="text-sm text-muted-foreground">{mensaje}</p>
      {canCrear && onCrear && (
        <Button onClick={onCrear} variant="outline" size="sm" className="gap-2 mt-1">
          <Plus className="h-3.5 w-3.5" />
          Crear actividad
        </Button>
      )}
    </div>
  )
)

// ── Página principal ─────────────────────────────────────────────────────────
export const MisActividadesPage = () => {
  const {
    loading, error, grupos, agruparPorProceso,
    filters, updateFilter, resetFilters, activeFilterCount,
    refetch, total,
  } = useMisActividades()

  const { can } = useAuth()
  const canCrear = can(PERMISOS.CREAR_ACTIVIDAD)

  // ✅ Obtenemos el tab de la URL
  const [searchParams, setSearchParams] = useSearchParams()
  const tabActivo = searchParams.get('tab') || 'requierenAtencion'

  const [actividadSeleccionada, setActividadSeleccionada] = useState(null)
  const [drawerOpen, setDrawerOpen]             = useState(false)
  const [modalCrearOpen, setModalCrearOpen]     = useState(false)

  const handleTabChange = (newTab) => {
    const currentParams = Object.fromEntries(searchParams.entries())
    setSearchParams({ ...currentParams, tab: newTab }, { replace: true })
  }

  const handleActividadClick = (actividad) => {
    setActividadSeleccionada(actividad)
    setDrawerOpen(true)
  }

  const handleDrawerClose = (isOpen) => {
    setDrawerOpen(isOpen)
    if (!isOpen) {
      refetch()
      setActividadSeleccionada(null)
    }
  }

  const handleCrearSuccess = () => {
    setModalCrearOpen(false)
    refetch()
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground text-sm">No se pudieron cargar tus actividades.</p>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Reintentar
        </Button>
      </div>
    )
  }

  // Empty total (sin filtros activos)
  if (!loading && total === 0 && activeFilterCount === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Mis actividades</h1>
            <p className="text-sm text-muted-foreground mt-1">Tu tablero está al día</p>
          </div>
          {canCrear && (
            <Button onClick={() => setModalCrearOpen(true)} className="gap-2 shrink-0 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Nueva actividad global
            </Button>
          )}
        </div>
        <div className="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-border rounded-xl bg-muted/10">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center max-w-sm">
            <h3 className="font-semibold text-foreground text-lg">Tu tablero está vacío</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Cuando te incluyan como responsable, revisor o participante en algún proceso, aparecerá aquí.
            </p>
          </div>
          {canCrear && (
            <Button onClick={() => setModalCrearOpen(true)} variant="outline" className="gap-2 mt-2">
              <Plus className="h-4 w-4" />
              Crear primera actividad
            </Button>
          )}
        </div>
        {canCrear && (
          <CrearEditarActividadModal
            open={modalCrearOpen}
            onOpenChange={setModalCrearOpen}
            proceso={null}
            actividadToEdit={null}
            onSuccess={handleCrearSuccess}
            modoMisActividades
          />
        )}
      </div>
    )
  }

  const tabActual = TABS.find(t => t.id === tabActivo)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-5 animate-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Mis actividades</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? 'Cargando tu tablero...'
              : total > 0
                ? `${total} actividad${total !== 1 ? 'es' : ''} asignada${total !== 1 ? 's' : ''} en total`
                : 'Tu tablero está al día'
            }
          </p>
        </div>
        {canCrear && (
          <Button
            onClick={() => setModalCrearOpen(true)}
            className="gap-2 shrink-0 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nueva actividad global
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-xl border border-border p-3 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            placeholder="Buscar por nombre o código de proceso..."
            className="pl-9 h-9 text-sm"
          />
        </div>

        <Select value={filters.estado} onValueChange={v => updateFilter('estado', v)}>
          <SelectTrigger className="h-9 w-[160px] text-sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="CREADA">Creada</SelectItem>
            <SelectItem value="EN_PROGRESO">En progreso</SelectItem>
            <SelectItem value="EN_REVISION">En revisión</SelectItem>
            <SelectItem value="OBSERVADA">Observada</SelectItem>
            <SelectItem value="LISTA_PARA_CIERRE">Lista para cierre</SelectItem>
            <SelectItem value="APROBADA">Aprobada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.rolCodigo} onValueChange={v => updateFilter('rolCodigo', v)}>
          <SelectTrigger className="h-9 w-[150px] text-sm">
            <SelectValue placeholder="Mi rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="RESPONSABLE_TAREA">Responsable</SelectItem>
            <SelectItem value="REVISOR_TAREA">Revisor</SelectItem>
            <SelectItem value="PARTICIPANTE_TAREA">Participante</SelectItem>
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 gap-1.5 text-muted-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Limpiar</span>
            ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Tabs Nav */}
      {!loading && (
        <div className="border-b border-border">
          <nav className="flex gap-0.5 -mb-px overflow-x-auto scrollbar-hide" role="tablist">
            {TABS.map(tab => {
              const gruposProceso = agruparPorProceso(grupos[tab.id])
              const count = gruposProceso.reduce((s, g) => s + g.actividades.length, 0)
              const Icono = tab.icono
              const isActive = tabActivo === tab.id

              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'flex items-center whitespace-nowrap gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-md',
                    isActive
                      ? 'border-foreground text-foreground font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                  )}
                >
                  <Icono className="h-4 w-4 shrink-0" />
                  <span>{tab.titulo}</span>
                  <span className={cn(
                    'inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold tabular-nums',
                    count > 0 
                      ? (tab.id === 'requierenAtencion' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 animate-pulse' : tab.countClass) 
                      : 'bg-muted text-muted-foreground',
                  )}>
                    {count}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <LoadingSkeleton />
      ) : (() => {
        const gruposProceso = agruparPorProceso(grupos[tabActivo])
        const count = gruposProceso.reduce((s, g) => s + g.actividades.length, 0)

        if (count === 0) {
          return (
            <EmptyState
              mensaje={tabActual?.emptyMsg}
              hasFilters={activeFilterCount > 0}
              onReset={resetFilters}
              canCrear={canCrear && tabActivo !== 'finalizadas'}
              onCrear={() => setModalCrearOpen(true)}
            />
          )
        }

        return (
          <div
            key={tabActivo}
            className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 mt-4"
          >
            {/* ✅ Implementación del Accordion Nativo */}
            <Accordion 
              type="multiple" 
              defaultValue={gruposProceso.map(g => g.proceso?.id || 'sin-proceso')}
              className="space-y-0"
            >
              {gruposProceso.map(grupo => (
                <GrupoProceso
                  key={grupo.proceso?.id ?? 'sin-proceso'}
                  grupo={grupo}
                  onActividadClick={handleActividadClick}
                />
              ))}
            </Accordion>
          </div>
        )
      })()}

      {/* Drawer y modal */}
      {actividadSeleccionada && (
        <ActividadDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          actividadId={actividadSeleccionada.id}
          proceso={actividadSeleccionada.proceso}
        />
      )}

      {canCrear && (
        <CrearEditarActividadModal
          open={modalCrearOpen}
          onOpenChange={setModalCrearOpen}
          proceso={null}
          actividadToEdit={null}
          onSuccess={handleCrearSuccess}
          modoMisActividades
        />
      )}
    </div>
  )
}