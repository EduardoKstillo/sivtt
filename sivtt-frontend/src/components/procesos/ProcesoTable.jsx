import { useNavigate } from 'react-router-dom'
import { Badge } from '@components/ui/badge'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { ESTADO_PROCESO, TIPO_ACTIVO } from '@utils/constants'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'
import { ESTADO_PROCESO_STYLES, FASE_STYLES } from '@utils/designTokens'
import { ChevronRight, Layers, Building2, User2 } from 'lucide-react'

export const ProcesoTable = ({ procesos }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="h-11 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Proceso
              </th>
              <th className="h-11 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">
                Tipo
              </th>
              <th className="h-11 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">
                Fase
              </th>
              <th className="h-11 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">
                Responsable
              </th>
              <th className="h-11 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider text-center hidden xl:table-cell">
                Métricas
              </th>
              <th className="h-11 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Estado
              </th>
              <th className="h-11 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider text-right">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {procesos.map((p) => {
              const responsable = p.usuarios?.find(
                (u) => u.rol?.codigo === 'GESTOR_PROCESO'
              )

              const responsableNombre = responsable
                ? `${responsable.nombres} ${responsable.apellidos}`
                : 'Sin asignar'
              
              const iniciales = responsable 
                ? `${responsable.nombres?.charAt(0) || ''}${responsable.apellidos?.charAt(0) || ''}` 
                : <User2 className="h-3.5 w-3.5 text-muted-foreground/60" />

              const isPatente = p.tipoActivo === TIPO_ACTIVO.PATENTE
              const estadoStyle = ESTADO_PROCESO_STYLES[p.estado]
              const faseStyle = FASE_STYLES[p.faseActual]

              return (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/procesos/${p.id}`)}
                  className="group hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  {/* Columna: Código y Título */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                          {p.codigo}
                        </span>
                        {/* En móvil, mostramos la fecha aquí arriba */}
                        <span className="text-[10px] text-muted-foreground md:hidden tabular-nums">
                          {formatDate(p.createdAt)}
                        </span>
                      </div>
                      <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[280px] md:max-w-[320px] group-hover:text-primary transition-colors">
                        {p.titulo}
                      </span>
                    </div>
                  </td>

                  {/* Columna: Tipo (Oculta en móvil muy pequeño) */}
                  <td className="px-4 py-3.5 hidden sm:table-cell align-middle">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[10px] font-semibold border h-5 px-2',
                        isPatente
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40'
                          : 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/40'
                      )}
                    >
                      {isPatente ? 'PATENTE' : 'REQUERIMIENTO'}
                    </Badge>
                  </td>

                  {/* Columna: Fase (Oculta en tablets pequeñas) */}
                  <td className="px-4 py-3.5 hidden lg:table-cell align-middle">
                    {faseStyle ? (
                      <Badge
                        variant="secondary"
                        className={cn('text-[11px] font-medium h-5.5 px-2', faseStyle.bgClass, faseStyle.textClass)}
                      >
                        {faseStyle.label}
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {p.faseActual}
                      </span>
                    )}
                  </td>

                  {/* Columna: Responsable con Avatar */}
                  <td className="px-4 py-3.5 hidden md:table-cell align-middle">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-6 w-6 border border-border shadow-sm">
                        <AvatarFallback className="bg-muted text-[10px] font-medium">
                          {iniciales}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "text-[13px] truncate max-w-[150px]", 
                        responsable ? "text-foreground/90 font-medium" : "text-muted-foreground italic"
                      )}>
                        {responsableNombre}
                      </span>
                    </div>
                  </td>

                  {/* Columna: Métricas agrupadas */}
                  <td className="px-4 py-3.5 hidden xl:table-cell align-middle">
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground" title="Actividades totales">
                        <Layers className="h-3.5 w-3.5" />
                        <span className="text-[12px] font-medium tabular-nums">{p.actividadesTotales}</span>
                      </div>
                      <div className="w-px h-3 bg-border" />
                      <div className="flex items-center gap-1.5 text-muted-foreground" title="Empresas vinculadas">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="text-[12px] font-medium tabular-nums">{p.empresasVinculadas}</span>
                      </div>
                    </div>
                  </td>

                  {/* Columna: Estado */}
                  <td className="px-4 py-3.5 align-middle">
                    {estadoStyle ? (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[10px] font-medium border gap-1.5 h-5.5 px-2 whitespace-nowrap',
                          estadoStyle.bgClass,
                          estadoStyle.textClass,
                          estadoStyle.borderClass
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', estadoStyle.dotColor)} />
                        {estadoStyle.label}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">{p.estado}</Badge>
                    )}
                  </td>

                  {/* Columna: Flecha de Acción */}
                  <td className="px-4 py-3.5 align-middle text-right">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors ml-auto shrink-0" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}