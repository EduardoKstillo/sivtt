import { Button } from '@components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { X } from 'lucide-react'
import { FLUJOS_FASES } from '@utils/constants'

const TIPOS_EVIDENCIA = [
  { value: 'DOCUMENTO', label: 'Documento' },
  { value: 'IMAGEN', label: 'Imagen' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'PRESENTACION', label: 'Presentación' },
  { value: 'INFORME', label: 'Informe' },
  { value: 'OTRO', label: 'Otro' }
]

const ESTADOS_EVIDENCIA = [
  { value: 'PENDIENTE', label: '⏳ Pendiente' },
  { value: 'APROBADA', label: '✅ Aprobada' },
  { value: 'RECHAZADA', label: '❌ Rechazada' }
]

export const EvidenciasFilters = ({ filters, onFilterChange, onReset, proceso }) => {
  const hasActiveFilters = filters.fase || filters.tipo || filters.estado

  const fasesDisponibles = FLUJOS_FASES[proceso.tipoActivo]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap gap-3">
        {/* Fase */}
        <Select
          value={filters.fase}
          onValueChange={(value) => onFilterChange({ fase: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas las fases" />
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

        {/* Tipo */}
        <Select
          value={filters.tipo}
          onValueChange={(value) => onFilterChange({ tipo: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los tipos</SelectItem>
            {TIPOS_EVIDENCIA.map(tipo => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Estado */}
        <Select
          value={filters.estado}
          onValueChange={(value) => onFilterChange({ estado: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los estados</SelectItem>
            {ESTADOS_EVIDENCIA.map(estado => (
              <SelectItem key={estado.value} value={estado.value}>
                {estado.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}