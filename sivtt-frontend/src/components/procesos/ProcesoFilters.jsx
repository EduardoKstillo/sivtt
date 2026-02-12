import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { TIPO_ACTIVO, ESTADO_PROCESO, FASE_VINCULACION } from '@utils/constants'
import { useDebounce } from '@hooks/useDebounce'
import { useEffect, useState } from 'react'
import { Badge } from '@components/ui/badge'

export const ProcesoFilters = ({ filters, onFilterChange, onReset }) => {
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchInput, 500)

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({ search: debouncedSearch })
    }
  }, [debouncedSearch])

  const activeFilterCount = [
    filters.search,
    filters.tipoActivo,
    filters.estado,
    filters.faseActual
  ].filter(Boolean).length

  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, código o descripción..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 h-10"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />

        {/* Tipo de Activo */}
        <Select
          value={filters.tipoActivo}
          onValueChange={(value) => onFilterChange({ tipoActivo: value })}
        >
          <SelectTrigger className="w-[170px] h-9 text-sm">
            <SelectValue placeholder="Tipo de activo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los tipos</SelectItem>
            <SelectItem value={TIPO_ACTIVO.PATENTE}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Patente
              </span>
            </SelectItem>
            <SelectItem value={TIPO_ACTIVO.REQUERIMIENTO_EMPRESARIAL}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Requerimiento
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Estado */}
        <Select
          value={filters.estado}
          onValueChange={(value) => onFilterChange({ estado: value })}
        >
          <SelectTrigger className="w-[170px] h-9 text-sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los estados</SelectItem>
            <SelectItem value={ESTADO_PROCESO.ACTIVO}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Activo
              </span>
            </SelectItem>
            <SelectItem value={ESTADO_PROCESO.PAUSADO}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pausado
              </span>
            </SelectItem>
            <SelectItem value={ESTADO_PROCESO.FINALIZADO}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Finalizado
              </span>
            </SelectItem>
            <SelectItem value={ESTADO_PROCESO.CANCELADO}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Cancelado
              </span>
            </SelectItem>
            <SelectItem value={ESTADO_PROCESO.ARCHIVADO}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Archivado
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Fase Actual */}
        <Select
          value={filters.faseActual}
          onValueChange={(value) => onFilterChange({ faseActual: value })}
        >
          <SelectTrigger className="w-[200px] h-9 text-sm">
            <SelectValue placeholder="Fase actual" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todas las fases</SelectItem>

            {/* Fases de Patente */}
            <SelectItem value={FASE_VINCULACION.CARACTERIZACION}>
              Caracterización
            </SelectItem>
            <SelectItem value={FASE_VINCULACION.ENRIQUECIMIENTO}>
              Enriquecimiento
            </SelectItem>
            <SelectItem value={FASE_VINCULACION.MATCH}>
              Match
            </SelectItem>
            <SelectItem value={FASE_VINCULACION.ESCALAMIENTO}>
              Escalamiento
            </SelectItem>
            <SelectItem value={FASE_VINCULACION.TRANSFERENCIA}>
              Transferencia
            </SelectItem>

            {/* Fases de Requerimiento */}
            <SelectItem value={FASE_VINCULACION.FORMULACION_RETO}>
              Formulación de Reto
            </SelectItem>
            <SelectItem value={FASE_VINCULACION.CONVOCATORIA}>
              Convocatoria
            </SelectItem>
            <SelectItem value={FASE_VINCULACION.POSTULACION}>
              Postulación
            </SelectItem>
            <SelectItem value={FASE_VINCULACION.SELECCION}>
              Selección
            </SelectItem>
            <SelectItem value={FASE_VINCULACION.ANTEPROYECTO}>
              Anteproyecto
            </SelectItem>
            <SelectItem value={FASE_VINCULACION.EJECUCION}>
              Ejecución
            </SelectItem>
            <SelectItem value={FASE_VINCULACION.CIERRE}>
              Cierre
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
            <Badge
              variant="secondary"
              className="ml-0.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  )
}