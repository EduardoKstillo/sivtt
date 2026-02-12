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
      {/* Background timeline line */}
      <div className="absolute left-[27px] top-4 bottom-0 w-0.5 bg-border -z-10" />

      {flujoCompleto.map((nombreFase, index) => {
        const intentos = fasesGrouped[nombreFase] || []
        const faseVigente = intentos.length > 0 ? intentos[intentos.length - 1] : null
        const isExpanded = expandedFase === nombreFase
        const isActual = nombreFase === faseActual
        const isCompleted = faseVigente?.estado === 'CERRADA'
        const isBlocked = (index > currentPhaseIndex) && intentos.length === 0

        return (
          <div key={nombreFase} className="relative pl-16 pb-6 last:pb-0">
            {/* Connector Dot */}
            <div 
              className={cn(
                "absolute left-[21px] top-6 w-3.5 h-3.5 rounded-full border-2 bg-card z-10 transition-colors",
                isCompleted && "border-emerald-500 bg-emerald-500",
                isActual && !isCompleted && "border-primary ring-4 ring-primary/10",
                !isCompleted && !isActual && intentos.length > 0 && "border-muted-foreground/50 bg-muted",
                !isCompleted && !isActual && intentos.length === 0 && "border-border"
              )}
            />
            
            {/* Green progress line for completed phases */}
            {index < currentPhaseIndex && (
              <div className="absolute left-[27px] top-6 h-full w-0.5 bg-emerald-500 -z-0" />
            )}

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