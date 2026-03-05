import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Badge } from '@components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { X, SlidersHorizontal } from 'lucide-react'

const TIPOS_EVENTO = [
  { value: 'ESTADO',     label: 'Estados'     },
  { value: 'FASE',       label: 'Fases'       },
  { value: 'TRL',        label: 'TRL'         },
  { value: 'DECISION',   label: 'Decisiones'  },
  { value: 'EMPRESA',    label: 'Empresas'    },
  { value: 'ACTIVIDAD',  label: 'Actividades' }
]

export const HistorialFilters = ({ filters, onFilterChange, onReset }) => {
  const activeFilterCount = [
    filters.tipoEvento,
    filters.fechaInicio,
    filters.fechaFin
  ].filter(Boolean).length

  const hasActiveFilters = activeFilterCount > 0

  const handleChange = (field, value) => {
    onFilterChange(prev => ({ ...prev, [field]: value }))
  }

  return (
    // Patrón idéntico al contenedor de ActividadesFilters
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-end gap-3">

        {/* Icono de filtro — mismo patrón que ActividadesFilters */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mr-1 self-center pb-0.5">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Filtrar:</span>
        </div>

        {/* Tipo de evento */}
        <Select
          value={filters.tipoEvento || 'Todos'}
          onValueChange={(value) => handleChange('tipoEvento', value === 'Todos' ? '' : value)}
        >
          <SelectTrigger className="w-[170px] h-9 text-sm">
            <SelectValue placeholder="Tipo de evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los eventos</SelectItem>
            {TIPOS_EVENTO.map(tipo => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Fecha inicio */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground px-0.5">Desde</Label>
          <Input
            type="date"
            value={filters.fechaInicio}
            onChange={(e) => handleChange('fechaInicio', e.target.value)}
            className="h-9 text-sm w-[160px]"
          />
        </div>

        {/* Fecha fin */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground px-0.5">Hasta</Label>
          <Input
            type="date"
            value={filters.fechaFin}
            onChange={(e) => handleChange('fechaFin', e.target.value)}
            className="h-9 text-sm w-[160px]"
          />
        </div>

        {/* Botón reset — patrón de ActividadesFilters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground ml-auto self-end"
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