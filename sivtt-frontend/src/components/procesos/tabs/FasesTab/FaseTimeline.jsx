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
  // Indexar fases por nombre (Enum) para acceso rápido
  const fasesMap = {}
  fases.forEach(fase => {
    fasesMap[fase.fase] = fase
  })

  // Encontrar índice de fase actual para lógica de bloqueos
  const currentPhaseIndex = flujoCompleto.indexOf(faseActual)

  return (
    <div className="space-y-0 relative pb-10">
      {/* Línea vertical de fondo */}
      <div className="absolute left-[27px] top-4 bottom-0 w-0.5 bg-gray-200 -z-10" />

      {flujoCompleto.map((nombreFase, index) => {
        const faseData = fasesMap[nombreFase]
        const isExpanded = expandedFase === nombreFase
        
        // Estados lógicos
        const isActual = nombreFase === faseActual
        const isCompleted = faseData?.estado === 'CERRADA'
        // Bloqueado si el índice es mayor al actual y no tiene datos (futuro)
        const isBlocked = index > currentPhaseIndex

        return (
          <div key={nombreFase} className="relative pl-16 pb-6 last:pb-0">
            {/* Connector Dot & Line Overlay */}
            <div 
              className={cn(
                "absolute left-[21px] top-6 w-3.5 h-3.5 rounded-full border-2 bg-white z-10 transition-colors",
                isCompleted ? "border-green-500 bg-green-500" :
                isActual ? "border-blue-600 ring-4 ring-blue-50" :
                "border-gray-300"
              )}
            />
            
            {/* Line coloring for completed phases */}
            {index < currentPhaseIndex && (
               <div className="absolute left-[27px] top-6 h-full w-0.5 bg-green-500 -z-0" />
            )}

            {/* Fase Card */}
            <FaseCard
              fase={faseData} // Datos resumen (listByProceso)
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