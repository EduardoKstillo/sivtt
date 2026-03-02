import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Badge } from '@components/ui/badge'
import { Skeleton } from '@components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@components/ui/select'

import {
  Zap, Clock, CheckCircle2, Search, SlidersHorizontal,
  Plus, ChevronDown, RefreshCw, Inbox, Building2
} from 'lucide-react'
import { useMisActividades } from '@hooks/useMisActividades'
import { MiActividadCard } from './components/MiActividadCard'
import { ActividadDrawer } from '@components/procesos/tabs/ActividadesTab/ActividadDrawer'
import { CrearEditarActividadModal } from '@components/procesos/tabs/ActividadesTab/modals/CrearEditarActividadModal'
import { useAuth } from '@hooks/useAuth'
import { PERMISOS } from '@utils/permissions'
import { cn } from '@/lib/utils'

// Secciones fijas en orden de urgencia
const SECCIONES = [
  {
    key:         'requierenAtencion',
    titulo:      'Requieren tu atención',
    icono:       Zap,
    iconClass:   'text-amber-500',
    emptyMsg:    'No tienes actividades urgentes.',
    collapsible: false,
  },
  {
    key:         'enCurso',
    titulo:      'En curso',
    icono:       Clock,
    iconClass:   'text-primary',
    emptyMsg:    'No tienes actividades en curso.',
    collapsible: false,
  },
  {
    key:         'finalizadas',
    titulo:      'Finalizadas',
    icono:       CheckCircle2,
    iconClass:   'text-emerald-500',
    emptyMsg:    'No tienes actividades finalizadas aún.',
    collapsible: true,   // Colapsado por defecto
  },
]

// ── Componente de grupo por proceso ──────────────────────
const GrupoProceso = ({ grupo, onActividadClick }) => (
  <div className="space-y-2">
    {/* Encabezado del proceso */}
    <div className="flex items-center gap-2 px-1">
      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs font-medium text-muted-foreground truncate">
        <span className="text-foreground font-semibold">{grupo.proceso?.codigo}</span>
        {grupo.proceso?.titulo && (
          <span className="ml-1 text-muted-foreground">· {grupo.proceso.titulo}</span>
        )}
      </span>
      <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-auto shrink-0 tabular-nums">
        {grupo.actividades.length}
      </Badge>
    </div>

    {/* Tarjetas de actividades */}
    <div className="space-y-1.5 pl-5">
      {grupo.actividades.map(act => (
        <MiActividadCard
          key={act.id}
          actividad={act}
          onClick={() => onActividadClick(act)}
        />
      ))}
    </div>
  </div>
)

// ── Sección collapsible o fija ────────────────────────────
const Seccion = ({ config, grupos, onActividadClick }) => {
  const [abierta, setAbierta] = useState(!config.collapsible)
  const Icono = config.icono
  const total = grupos.reduce((s, g) => s + g.actividades.length, 0)

  const header = (
    <div className="flex items-center gap-2.5">
      <Icono className={cn('h-4 w-4 shrink-0', config.iconClass)} />
      <h2 className="text-sm font-semibold text-foreground">{config.titulo}</h2>
      <Badge
        variant={config.key === 'requierenAtencion' && total > 0 ? 'destructive' : 'secondary'}
        className={cn(
          'text-[10px] h-5 px-1.5 tabular-nums',
          config.key === 'requierenAtencion' && total > 0 &&
          'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40'
        )}
      >
        {total}
      </Badge>
      {config.collapsible && (
        <ChevronDown className={cn(
          'h-4 w-4 text-muted-foreground ml-auto transition-transform duration-200',
          abierta && 'rotate-180'
        )} />
      )}
    </div>
  )

  const content = (
    <div className="mt-3 space-y-5">
      {grupos.length === 0 ? (
        <p className="text-sm text-muted-foreground py-3 px-1">{config.emptyMsg}</p>
      ) : (
        grupos.map(grupo => (
          <GrupoProceso
            key={grupo.proceso?.id ?? 'sin-proceso'}
            grupo={grupo}
            onActividadClick={onActividadClick}
          />
        ))
      )}
    </div>
  )

  if (!config.collapsible) {
    return (
      <section className="space-y-0">
        {header}
        {content}
      </section>
    )
  }

  return (
    <section>
      <button
        onClick={() => setAbierta(v => !v)}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      >
        {header}
      </button>
      {abierta && content}
    </section>
  )
}

// ── Skeletons de carga ────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="space-y-6">
    {[1, 2].map(s => (
      <div key={s} className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      </div>
    ))}
  </div>
)

// ── Página principal ──────────────────────────────────────
export const MisActividadesPage = () => {
  const {
    loading, error, grupos, agruparPorProceso,
    filters, updateFilter, resetFilters, activeFilterCount,
    refetch, total
  } = useMisActividades()

  const { can } = useAuth()
  const canCrear = can(PERMISOS.CREAR_ACTIVIDAD)

  // Estado del drawer de detalle
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Estado del modal de creación
  const [modalCrearOpen, setModalCrearOpen] = useState(false)

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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Mis Actividades
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? 'Cargando...' : (
              total > 0
                ? `${total} actividad${total !== 1 ? 'es' : ''} asignada${total !== 1 ? 's' : ''}`
                : 'No tienes actividades asignadas'
            )}
          </p>
        </div>

        {canCrear && (
          <Button onClick={() => setModalCrearOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nueva Actividad
          </Button>
        )}
      </div>

      {/* ── Filtros ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            placeholder="Buscar actividad o proceso..."
            className="pl-9 h-9"
          />
        </div>

        <Select value={filters.estado} onValueChange={v => updateFilter('estado', v)}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="CREADA">Creada</SelectItem>
            <SelectItem value="EN_PROGRESO">En Progreso</SelectItem>
            <SelectItem value="EN_REVISION">En Revisión</SelectItem>
            <SelectItem value="OBSERVADA">Observada</SelectItem>
            <SelectItem value="LISTA_PARA_CIERRE">Lista para Cierre</SelectItem>
            <SelectItem value="APROBADA">Aprobada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.rolCodigo} onValueChange={v => updateFilter('rolCodigo', v)}>
          <SelectTrigger className="h-9 w-[150px]">
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
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 gap-1.5 text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Limpiar ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* ── Contenido ───────────────────────────────────── */}
      {loading ? (
        <LoadingSkeleton />
      ) : total === 0 && activeFilterCount === 0 ? (
        // Empty state global
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">No tienes actividades asignadas</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cuando alguien te asigne en una actividad, aparecerá aquí.
            </p>
          </div>
          {canCrear && (
            <Button onClick={() => setModalCrearOpen(true)} variant="outline" className="gap-2 mt-2">
              <Plus className="h-4 w-4" />
              Crear primera actividad
            </Button>
          )}
        </div>
      ) : total === 0 && activeFilterCount > 0 ? (
        // Empty state con filtros activos
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-muted-foreground text-sm">No hay actividades con los filtros seleccionados.</p>
          <Button variant="ghost" size="sm" onClick={resetFilters}>Limpiar filtros</Button>
        </div>
      ) : (
        // Tres secciones
        <div className="space-y-8">
          {SECCIONES.map(seccion => (
            <Seccion
              key={seccion.key}
              config={seccion}
              grupos={agruparPorProceso(grupos[seccion.key])}
              onActividadClick={handleActividadClick}
            />
          ))}
        </div>
      )}

      {/* ── Drawer de detalle ───────────────────────────── */}
      {/* Siempre montado cuando hay actividadSeleccionada para que
          useActividadDetail no se reinicie en cada apertura */}
      {actividadSeleccionada && (
        <ActividadDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          actividadId={actividadSeleccionada.id}
          proceso={actividadSeleccionada.proceso}
        />
      )}

      {/* ── Modal crear actividad ───────────────────────── */}
      {canCrear && (
        <CrearEditarActividadModal
          open={modalCrearOpen}
          onOpenChange={setModalCrearOpen}
          proceso={null}             // null = el modal debe pedir el proceso
          actividadToEdit={null}
          onSuccess={handleCrearSuccess}
          modoMisActividades         // prop extra para que el modal muestre selector de proceso
        />
      )}
    </div>
  )
}