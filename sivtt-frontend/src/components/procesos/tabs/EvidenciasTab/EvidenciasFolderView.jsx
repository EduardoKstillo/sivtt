import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { ChevronDown, ChevronRight, Folder, FileText, Link as LinkIcon } from 'lucide-react'
import { EvidenciaItem } from './EvidenciaItem'
import { FASE_STYLES } from '@utils/designTokens'
import { cn } from '@/lib/utils'

export const EvidenciasFolderView = ({ fase, evidencias, onEvidenciaClick }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const total = evidencias.length
  const aprobadas = evidencias.filter(e => e.estado === 'APROBADA').length
  const pendientes = evidencias.filter(e => e.estado === 'PENDIENTE').length
  const rechazadas = evidencias.filter(e => e.estado === 'RECHAZADA').length

  const links = evidencias.filter(e => e.tipoEvidencia === 'ENLACE').length
  const archivos = total - links

  const faseStyle = FASE_STYLES[fase]

  return (
    <Card className={cn(
      "transition-all overflow-hidden",
      isExpanded && "ring-1 ring-primary/10 dark:ring-primary/20"
    )}>
      {/* Phase color accent */}
      {isExpanded && (
        <div
          className="h-0.5 w-full"
          style={{ backgroundColor: faseStyle?.color || 'var(--primary)' }}
        />
      )}

      <CardHeader 
        className="py-3 px-4 cursor-pointer hover:bg-muted/30 transition-colors" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-0 h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted transition-colors shrink-0">
              {isExpanded
                ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                : <ChevronRight className="h-4 w-4 text-muted-foreground" />
              }
            </button>

            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                isExpanded
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                <Folder className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  {faseStyle?.label || fase}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                  <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {archivos}</span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1"><LinkIcon className="h-3 w-3" /> {links}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {aprobadas > 0 && (
              <Badge
                variant="secondary"
                className="h-5 text-[10px] tabular-nums border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {aprobadas}
              </Badge>
            )}
            {pendientes > 0 && (
              <Badge
                variant="secondary"
                className="h-5 text-[10px] tabular-nums border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40 gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {pendientes}
              </Badge>
            )}
            {rechazadas > 0 && (
              <Badge
                variant="secondary"
                className="h-5 text-[10px] tabular-nums border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40 gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {rechazadas}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-3 px-3">
          <div className="space-y-1.5 mt-1 pl-2 sm:pl-4 border-l-2 border-border ml-6">
            {evidencias.map((evidencia) => (
              <EvidenciaItem
                key={evidencia.id}
                evidencia={evidencia}
                onClick={() => onEvidenciaClick(evidencia)}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}