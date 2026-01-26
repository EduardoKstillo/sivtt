import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { X } from 'lucide-react'

const TIPOS_EVENTO = [
  { value: 'ESTADO', label: '🔄 Cambio de Estado' },
  { value: 'FASE', label: '📍 Cambio de Fase' },
  { value: 'TRL', label: '📊 Actualización TRL' },
  { value: 'DECISION', label: '✅ Decisión' },
  { value: 'EMPRESA', label: '🏢 Empresa' },
  { value: 'EQUIPO', label: '👥 Equipo' },
  { value: 'ACTIVIDAD', label: '📋 Actividad' },
  { value: 'EVIDENCIA', label: '📎 Evidencia' },
  { value: 'FINANCIAMIENTO', label: '💰 Financiamiento' },
  { value: 'OTRO', label: '📝 Otro' }
]

export const HistorialFilters = ({ filters, onFilterChange, onReset }) => {
  const hasActiveFilters = filters.tipoEvento || filters.fechaInicio || filters.fechaFin

  const handleChange = (field, value) => {
    onFilterChange(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tipo de Evento */}
        <div className="space-y-2">
          <Label htmlFor="tipoEvento">Tipo de evento</Label>
          <Select
            value={filters.tipoEvento}
            onValueChange={(value) => handleChange('tipoEvento', value)}
          >
            <SelectTrigger id="tipoEvento">
              <SelectValue placeholder="Todos los eventos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los eventos</SelectItem>
              {TIPOS_EVENTO.map(tipo => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fecha Inicio */}
        <div className="space-y-2">
          <Label htmlFor="fechaInicio">Desde</Label>
          <Input
            id="fechaInicio"
            type="date"
            value={filters.fechaInicio}
            onChange={(e) => handleChange('fechaInicio', e.target.value)}
          />
        </div>

        {/* Fecha Fin */}
        <div className="space-y-2">
          <Label htmlFor="fechaFin">Hasta</Label>
          <Input
            id="fechaFin"
            type="date"
            value={filters.fechaFin}
            onChange={(e) => handleChange('fechaFin', e.target.value)}
          />
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  )
}