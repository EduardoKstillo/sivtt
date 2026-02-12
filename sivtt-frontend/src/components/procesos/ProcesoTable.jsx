import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/badge'
import { ESTADO_PROCESO, TIPO_ACTIVO } from '@utils/constants'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'
import {
  ESTADO_PROCESO_STYLES,
  FASE_STYLES,
} from '@utils/designTokens'

export const ProcesoTable = ({ procesos }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Código
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Título
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Responsable
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Fase
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Activ.
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Empresas
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Creado
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {procesos.map((p) => {
            const responsable = p.usuarios?.[0]?.usuario
            const responsableNombre = responsable
              ? `${responsable.nombres} ${responsable.apellidos}`
              : '—'

            const isPatente = p.tipoActivo === TIPO_ACTIVO.PATENTE
            const estadoStyle = ESTADO_PROCESO_STYLES[p.estado]
            const faseStyle = FASE_STYLES[p.faseActual]

            return (
              <tr
                key={p.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/procesos/${p.id}`}
                    className="font-mono text-xs font-medium text-primary hover:underline underline-offset-2"
                  >
                    {p.codigo}
                  </Link>
                </td>

                <td className="px-4 py-3 max-w-[280px]">
                  <Link
                    to={`/procesos/${p.id}`}
                    className="text-foreground hover:text-primary transition-colors truncate block"
                  >
                    {p.titulo}
                  </Link>
                </td>

                <td className="px-4 py-3">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-[11px] font-medium border',
                      isPatente
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40'
                        : 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/40'
                    )}
                  >
                    {isPatente ? 'Patente' : 'Requerimiento'}
                  </Badge>
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {responsableNombre}
                </td>

                <td className="px-4 py-3">
                  {faseStyle ? (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[11px] font-medium',
                        faseStyle.bgClass,
                        faseStyle.textClass,
                      )}
                    >
                      {faseStyle.label}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[11px]">
                      {p.faseActual}
                    </Badge>
                  )}
                </td>

                <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">
                  {p.actividadesTotales}
                </td>

                <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">
                  {p.empresasVinculadas}
                </td>

                <td className="px-4 py-3">
                  {estadoStyle ? (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[11px] font-medium border gap-1.5',
                        estadoStyle.bgClass,
                        estadoStyle.textClass,
                        estadoStyle.borderClass
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', estadoStyle.dotColor)} />
                      {estadoStyle.label}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[11px]">
                      {p.estado}
                    </Badge>
                  )}
                </td>

                <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {formatDate(p.createdAt)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}