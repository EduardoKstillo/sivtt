import { Badge } from '@components/ui/badge'
import { Building2, TrendingUp, CheckCircle2, MapPin } from 'lucide-react'
import { Avatar, AvatarFallback } from '@components/ui/avatar'

export const TopEmpresasTable = ({ empresas }) => {
  if (!empresas || empresas.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No hay datos disponibles
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {empresas.map((empresa, index) => (
        <div
          key={empresa.id}
          // bg-muted/30 hover:bg-muted/50 — patrón de filas del sistema
          className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border"
        >
          {/* Ranking — bg-primary/10 text-primary sin gradiente hardcodeado */}
          <div className="flex items-center justify-center w-7 h-7 bg-primary/10 rounded-full text-primary font-bold text-xs shrink-0">
            {index + 1}
          </div>

          {/* Avatar — bg-primary/10 text-primary en lugar de gradiente */}
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {empresa.nombre?.charAt(0) || 'E'}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {empresa.nombre}
              </h4>
              {empresa.verificada && (
                // emerald semántico — consistente con badge Verificada en EmpresaCard
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shrink-0"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                  Verificada
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                <span>{empresa.sector || 'Sin sector'}</span>
              </div>
              {empresa.ubicacion && (
                <div className="flex items-center gap-1">
                  {/* Ícono MapPin en lugar de emoji 📍 */}
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{empresa.ubicacion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats — text-emerald-500 en lugar de text-green-600 */}
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5 justify-end mb-0.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {empresa.procesosVinculados}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              proceso{empresa.procesosVinculados !== 1 ? 's' : ''} vinculado{empresa.procesosVinculados !== 1 ? 's' : ''}
            </p>
          </div>

          {/* NDA — sin emoji, ícono eliminado para Badge limpio */}
          {empresa.ndaFirmados > 0 && (
            <Badge
              variant="outline"
              className="whitespace-nowrap text-[10px] h-5 shrink-0"
            >
              {empresa.ndaFirmados} NDA
            </Badge>
          )}
        </div>
      ))}
    </div>
  )
}