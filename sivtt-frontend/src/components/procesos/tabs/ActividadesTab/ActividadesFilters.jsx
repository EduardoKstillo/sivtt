import { Button } from '@components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { X, Filter } from 'lucide-react'
import { 
  ESTADO_ACTIVIDAD, 
  TIPO_ACTIVIDAD, 
  FLUJOS_FASES 
} from '@utils/constants'

export const ActividadesFilters = ({ filters, onFilterChange, onReset, proceso }) => {
  // Comprobar si hay filtros activos para mostrar botón de limpiar
  const hasActiveFilters = 
    (filters.fase && filters.fase !== 'Todas') || 
    (filters.estado && filters.estado !== 'Todos') || 
    (filters.tipo && filters.tipo !== 'Todos') || 
    filters.responsableId

  const fasesDisponibles = FLUJOS_FASES[proceso.tipoActivo] || []

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 mr-2">
            <Filter className="h-4 w-4" />
            <span>Filtrar por:</span>
        </div>

        {/* Fase */}
        <Select
          value={filters.fase || "Todas"}
          onValueChange={(value) => onFilterChange({ fase: value })}
        >
          <SelectTrigger className="w-[180px] bg-white">
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
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los estados</SelectItem>
            <SelectItem value={ESTADO_ACTIVIDAD.CREADA}>Creada</SelectItem>
            <SelectItem value={ESTADO_ACTIVIDAD.EN_PROGRESO}>En Progreso</SelectItem>
            <SelectItem value={ESTADO_ACTIVIDAD.EN_REVISION}>En Revisión</SelectItem>
            <SelectItem value={ESTADO_ACTIVIDAD.OBSERVADA}>Observada</SelectItem>
            <SelectItem value={ESTADO_ACTIVIDAD.LISTA_PARA_CIERRE}>Lista para Cierre</SelectItem>
            <SelectItem value={ESTADO_ACTIVIDAD.APROBADA}>Aprobada</SelectItem>
          </SelectContent>
        </Select>

        {/* Tipo */}
        <Select
          value={filters.tipo || "Todos"}
          onValueChange={(value) => onFilterChange({ tipo: value })}
        >
          <SelectTrigger className="w-[180px] bg-white">
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
            className="text-gray-500 hover:text-gray-900 ml-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}