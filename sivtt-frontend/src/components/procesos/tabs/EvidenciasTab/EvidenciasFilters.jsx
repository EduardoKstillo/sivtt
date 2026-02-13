import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@components/ui/select'
import { X, SlidersHorizontal } from 'lucide-react'
import { FLUJOS_FASES } from '@utils/constants'

const TIPOS_EVIDENCIA = [
  { value: 'DOCUMENTO', label: 'Documento' },
  { value: 'IMAGEN', label: 'Imagen' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'PRESENTACION', label: 'Presentación' },
  { value: 'INFORME', label: 'Informe' },
  { value: 'OTRO', label: 'Otro' },
]

const ESTADOS_EVIDENCIA = [
  { value: 'PENDIENTE', label: 'Pendiente', dot: 'bg-amber-500' },
  { value: 'APROBADA', label: 'Aprobada', dot: 'bg-emerald-500' },
  { value: 'RECHAZADA', label: 'Rechazada', dot: 'bg-rose-500' },
]

export const EvidenciasFilters = ({ filters, onFilterChange, onReset, proceso }) => {
  const activeCount = [filters.fase, filters.tipo, filters.estado].filter(Boolean).length
  const hasActiveFilters = activeCount > 0
  const fasesDisponibles = FLUJOS_FASES[proceso.tipoActivo]

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mr-1">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Filtrar:</span>
        </div>

        {/* Fase */}
        <Select
          value={filters.fase}
          onValueChange={(value) => onFilterChange({ fase: value })}
        >
          <SelectTrigger className="w-[170px] h-9 text-sm">
            <SelectValue placeholder="Todas las fases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas las fases</SelectItem>
            {fasesDisponibles.map(fase => (
              <SelectItem key={fase} value={fase}>{fase}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tipo */}
        <Select
          value={filters.tipo}
          onValueChange={(value) => onFilterChange({ tipo: value })}
        >
          <SelectTrigger className="w-[170px] h-9 text-sm">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los tipos</SelectItem>
            {TIPOS_EVIDENCIA.map(tipo => (
              <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Estado */}
        <Select
          value={filters.estado}
          onValueChange={(value) => onFilterChange({ estado: value })}
        >
          <SelectTrigger className="w-[170px] h-9 text-sm">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los estados</SelectItem>
            {ESTADOS_EVIDENCIA.map(estado => (
              <SelectItem key={estado.value} value={estado.value}>
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${estado.dot}`} />
                  {estado.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground ml-auto"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
            <Badge variant="secondary" className="ml-0.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
              {activeCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  )
}