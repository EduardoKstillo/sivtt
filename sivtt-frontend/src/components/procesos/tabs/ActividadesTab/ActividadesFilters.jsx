import { Button } from '@components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Badge } from '@components/ui/badge'
import { X, SlidersHorizontal } from 'lucide-react'
import { 
  ESTADO_ACTIVIDAD, 
  TIPO_ACTIVIDAD, 
  FLUJOS_FASES 
} from '@utils/constants'

export const ActividadesFilters = ({ filters, onFilterChange, onReset, proceso }) => {
  const activeFilterCount = [
    filters.fase && filters.fase !== 'Todas',
    filters.estado && filters.estado !== 'Todos',
    filters.tipo && filters.tipo !== 'Todos',
    filters.responsableId
  ].filter(Boolean).length

  const hasActiveFilters = activeFilterCount > 0
  const fasesDisponibles = FLUJOS_FASES[proceso.tipoActivo] || []

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mr-1">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Filtrar:</span>
        </div>

        {/* Fase */}
        <Select
          value={filters.fase || "Todas"}
          onValueChange={(value) => onFilterChange({ fase: value })}
        >
          <SelectTrigger className="w-[170px] h-9 text-sm">
            <SelectValue placeholder="Fase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas las fases</SelectItem>
            {fasesDisponibles.map(fase => (
              <SelectItem key={fase} value={fase}>
                {fase}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Estado */}
        <Select
          value={filters.estado || "Todos"}
          onValueChange={(value) => onFilterChange({ estado: value })}
        >
          <SelectTrigger className="w-[170px] h-9 text-sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los estados</SelectItem>
            <SelectItem value={ESTADO_ACTIVIDAD.CREADA}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Creada
              </span>
            </SelectItem>
            <SelectItem value={ESTADO_ACTIVIDAD.EN_PROGRESO}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                En Progreso
              </span>
            </SelectItem>
            <SelectItem value={ESTADO_ACTIVIDAD.EN_REVISION}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                En Revisión
              </span>
            </SelectItem>
            <SelectItem value={ESTADO_ACTIVIDAD.OBSERVADA}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Observada
              </span>
            </SelectItem>
            <SelectItem value={ESTADO_ACTIVIDAD.LISTA_PARA_CIERRE}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Lista para Cierre
              </span>
            </SelectItem>
            <SelectItem value={ESTADO_ACTIVIDAD.APROBADA}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Aprobada
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Tipo */}
        <Select
          value={filters.tipo || "Todos"}
          onValueChange={(value) => onFilterChange({ tipo: value })}
        >
          <SelectTrigger className="w-[170px] h-9 text-sm">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los tipos</SelectItem>
            <SelectItem value={TIPO_ACTIVIDAD.DOCUMENTO}>Documento</SelectItem>
            <SelectItem value={TIPO_ACTIVIDAD.REUNION}>Reunión</SelectItem>
            <SelectItem value={TIPO_ACTIVIDAD.TAREA}>Tarea</SelectItem>
            <SelectItem value={TIPO_ACTIVIDAD.REVISION}>Revisión</SelectItem>
            <SelectItem value={TIPO_ACTIVIDAD.OTRO}>Otro</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground ml-auto"
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