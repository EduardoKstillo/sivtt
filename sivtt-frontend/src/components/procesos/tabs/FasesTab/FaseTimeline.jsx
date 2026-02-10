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
  // 1. 🔥 AGRUPAR FASES: En lugar de mapa simple, usamos mapa de arrays
  const fasesGrouped = {}
  
  fases.forEach(fase => {
    if (!fasesGrouped[fase.fase]) {
      fasesGrouped[fase.fase] = []
    }
    // Guardamos todas las ocurrencias (históricas y actuales)
    fasesGrouped[fase.fase].push(fase)
  })

  // Índice de fase actual en el flujo ideal
  const currentPhaseIndex = flujoCompleto.indexOf(faseActual)

  return (
    <div className="space-y-0 relative pb-10">
      <div className="absolute left-[27px] top-4 bottom-0 w-0.5 bg-gray-200 -z-10" />

      {flujoCompleto.map((nombreFase, index) => {
        // Obtenemos el ARRAY de intentos (puede ser undefined, [1], o [1, 2, ...])
        const intentos = fasesGrouped[nombreFase] || []
        
        // La versión "vigente" siempre es la última del array (por orden cronológico del backend)
        const faseVigente = intentos.length > 0 ? intentos[intentos.length - 1] : null
        
        const isExpanded = expandedFase === nombreFase
        const isActual = nombreFase === faseActual
        
        // Completada si tenemos datos y la ÚLTIMA versión está cerrada
        const isCompleted = faseVigente?.estado === 'CERRADA'
        
        // Bloqueado si es futura y no tenemos NINGÚN dato
        const isBlocked = (index > currentPhaseIndex) && intentos.length === 0

        return (
          <div key={nombreFase} className="relative pl-16 pb-6 last:pb-0">
            {/* ... lógica del punto (Connector Dot) igual que antes ... */}
            <div 
              className={cn(
                "absolute left-[21px] top-6 w-3.5 h-3.5 rounded-full border-2 bg-white z-10 transition-colors",
                isCompleted ? "border-green-500 bg-green-500" :
                isActual ? "border-blue-600 ring-4 ring-blue-50" :
                (intentos.length > 0) ? "border-gray-400 bg-gray-200" : // Historial abandonado
                "border-gray-300"
              )}
            />
            
            {/* ... línea verde igual ... */}
            {index < currentPhaseIndex && (
               <div className="absolute left-[27px] top-6 h-full w-0.5 bg-green-500 -z-0" />
            )}

            {/* 🔥 PASAMOS EL ARRAY COMPLETO DE INTENTOS */}
            <FaseCard
              intentos={intentos} // <--- CAMBIO CLAVE
              faseVigente={faseVigente} // Para datos de cabecera rápida
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