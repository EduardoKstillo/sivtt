import { FaseCard } from './FaseCard'
import { cn } from '@/lib/utils'

export const FaseTimeline = ({ 
  fases, 
  flujoCompleto, 
  faseActual, 
  expandedFase, 
  onToggleFase,
  proceso,
  onUpdate,
  onRefresh
}) => {
  const fasesGrouped = {}
  
  fases.forEach(fase => {
    if (!fasesGrouped[fase.fase]) {
      fasesGrouped[fase.fase] = []
    }
    fasesGrouped[fase.fase].push(fase)
  })

  const currentPhaseIndex = flujoCompleto.indexOf(faseActual)

  return (
    <div className="space-y-0 relative pb-10">
      {/* Background timeline line (Gris suave por defecto) */}
      <div className="absolute left-[27px] top-6 bottom-4 w-[2px] bg-border/60 -z-10 rounded-full" />

      {flujoCompleto.map((nombreFase, index) => {
        const intentos = fasesGrouped[nombreFase] || []
        const faseVigente = intentos.length > 0 ? intentos[intentos.length - 1] : null
        const isExpanded = expandedFase === nombreFase
        const isActual = nombreFase === faseActual
        const isCompleted = faseVigente?.estado === 'CERRADA'
        const isBlocked = (index > currentPhaseIndex) && intentos.length === 0

        return (
          <div key={nombreFase} className="relative pl-14 sm:pl-16 pb-8 last:pb-0">
            {/* ✅ Connector Dot con Ring/Glow animado */}
            <div 
              className={cn(
                "absolute left-[21px] top-7 w-[14px] h-[14px] rounded-full border-2 z-10 transition-all duration-500",
                isCompleted && "border-emerald-500 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
                isActual && !isCompleted && "border-primary bg-background ring-4 ring-primary/20",
                !isCompleted && !isActual && intentos.length > 0 && "border-muted-foreground/50 bg-muted",
                !isCompleted && !isActual && intentos.length === 0 && "border-border bg-background"
              )}
            />
            
            {/* ✅ Green progress line (Crece desde arriba fluidamente) */}
            <div 
              className={cn(
                "absolute left-[27px] top-6 w-[2px] bg-emerald-500 -z-0 transition-all duration-700 ease-in-out origin-top rounded-full",
                index < currentPhaseIndex ? "h-full scale-y-100" : "h-0 scale-y-0"
              )} 
            />

            <FaseCard
              intentos={intentos}
              faseVigente={faseVigente}
              nombreFase={nombreFase}
              isExpanded={isExpanded}
              isActual={isActual}
              isCompleted={isCompleted}
              isBlocked={isBlocked}
              onToggle={() => onToggleFase(nombreFase)}
              proceso={proceso}
              onUpdate={onUpdate}
              onRefresh={onRefresh}
            />
          </div>
        )
      })}
    </div>
  )
}