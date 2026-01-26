import { Search, X } from 'lucide-react'
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

export const ProcesoFilters = ({ filters, onFilterChange, onReset }) => {
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchInput, 500)

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({ search: debouncedSearch })
    }
  }, [debouncedSearch])

  const hasActiveFilters = 
    filters.search || 
    filters.tipoActivo || 
    filters.estado || 
    filters.faseActual

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por título, código o descripción..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 h-11"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="flex flex-wrap gap-3">
        {/* Tipo de Activo */}
        <Select
          value={filters.tipoActivo}
          onValueChange={(value) => onFilterChange({ tipoActivo: value })}
        >
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder="Tipo de activo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los tipos</SelectItem>
            <SelectItem value={TIPO_ACTIVO.PATENTE}>
              🔵 Patente
            </SelectItem>
            <SelectItem value={TIPO_ACTIVO.REQUERIMIENTO_EMPRESARIAL}>
              🟣 Requerimiento
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Estado */}
        <Select
          value={filters.estado}
          onValueChange={(value) => onFilterChange({ estado: value })}
        >
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los estados</SelectItem>
            <SelectItem value={ESTADO_PROCESO.ACTIVO}>
              ✅ Activo
            </SelectItem>
            <SelectItem value={ESTADO_PROCESO.PAUSADO}>
              ⏸️ Pausado
            </SelectItem>
            <SelectItem value={ESTADO_PROCESO.FINALIZADO}>
              🏁 Finalizado
            </SelectItem>
            <SelectItem value={ESTADO_PROCESO.CANCELADO}>
              ❌ Cancelado
            </SelectItem>
            <SelectItem value={ESTADO_PROCESO.ARCHIVADO}>
              📦 Archivado
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Fase Actual */}
        <Select
          value={filters.faseActual}
          onValueChange={(value) => onFilterChange({ faseActual: value })}
        >
          <SelectTrigger className="w-[200px] h-10">
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
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-10"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Active Filters Count */}
      {hasActiveFilters && (
        <div className="text-sm text-gray-500">
          Mostrando resultados filtrados
        </div>
      )}
    </div>
  )
}