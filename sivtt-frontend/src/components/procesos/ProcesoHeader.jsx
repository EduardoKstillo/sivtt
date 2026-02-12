import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { 
  ArrowLeft, 
  MoreVertical, 
  Edit, 
  TrendingUp, 
  Users, 
  Pause, 
  XCircle, 
  Archive,
  Play
} from 'lucide-react'
import { TIPO_ACTIVO, ESTADO_PROCESO } from '@utils/constants'
import { formatDate } from '@utils/formatters'
import { EditProcesoModal } from './modals/EditProcesoModal'
import { UpdateTRLModal } from './modals/UpdateTRLModal'
import { cn } from '@/lib/utils'
import {
  ESTADO_PROCESO_STYLES,
  FASE_STYLES,
} from '@utils/designTokens'

export const ProcesoHeader = ({ proceso, onUpdate, onRefresh }) => {
  const navigate = useNavigate()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [trlModalOpen, setTrlModalOpen] = useState(false)

  const isPatente = proceso.tipoActivo === TIPO_ACTIVO.PATENTE
  const isActivo = proceso.estado === ESTADO_PROCESO.ACTIVO
  const isPausado = proceso.estado === ESTADO_PROCESO.PAUSADO

  const responsable = proceso.usuarios?.find(u => u.rolProceso === 'RESPONSABLE_PROCESO')
  const nombreResponsable = responsable 
    ? `${responsable.nombres} ${responsable.apellidos}` 
    : 'Sin responsable asignado'

  const estadoStyle = ESTADO_PROCESO_STYLES[proceso.estado]
  const faseStyle = FASE_STYLES[proceso.faseActual]

  // TODO: Conectar estos handlers con endpoints reales en el futuro
  const handleEstadoChange = (nuevoEstado) => {
    console.log("Cambiar estado a:", nuevoEstado)
  }

  return (
    <>
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/procesos')}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Procesos
        </Button>

        {/* Header Content */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Top badges */}
            <div className="flex items-center gap-3 mb-3">
              <Badge 
                variant="secondary"
                className={cn(
                  "font-medium border text-xs px-2.5 py-0.5",
                  isPatente 
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40" 
                    : "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/40"
                )}
              >
                {isPatente ? 'PATENTE' : 'REQUERIMIENTO'}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md border border-border">
                {proceso.codigo}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight tracking-tight">
              {proceso.titulo}
            </h1>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              
              {/* Estado */}
              {estadoStyle && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs font-medium border gap-1.5',
                    estadoStyle.bgClass,
                    estadoStyle.textClass,
                    estadoStyle.borderClass
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', estadoStyle.dotColor)} />
                  {estadoStyle.label}
                </Badge>
              )}
              
              {/* Fase */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Fase:</span>
                {faseStyle ? (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs font-medium',
                      faseStyle.bgClass,
                      faseStyle.textClass,
                    )}
                  >
                    {faseStyle.label}
                  </Badge>
                ) : (
                  <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded text-xs">
                    {proceso.faseActual}
                  </span>
                )}
              </div>

              {/* TRL (Solo Patente) */}
              {isPatente && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">TRL:</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span className="font-bold text-foreground tabular-nums">{proceso.trlActual}</span>
                    <span className="text-muted-foreground text-xs">/ 9</span>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="hidden md:block h-4 w-px bg-border" />

              {/* Responsable */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span title={nombreResponsable} className="truncate max-w-[200px] text-xs">
                  {nombreResponsable}
                </span>
              </div>

              {/* Fecha */}
              <span className="text-muted-foreground text-xs hidden md:inline tabular-nums">
                Creado el {formatDate(proceso.createdAt)}
              </span>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="flex-shrink-0 pt-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 hidden md:flex">
                  <MoreVertical className="h-4 w-4" />
                  Acciones
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar información
                </DropdownMenuItem>

                {isPatente && (
                  <DropdownMenuItem onClick={() => setTrlModalOpen(true)}>
                    <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                    Actualizar TRL
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {isActivo && (
                  <DropdownMenuItem onClick={() => handleEstadoChange('PAUSADO')}>
                    <Pause className="mr-2 h-4 w-4 text-amber-500" />
                    Pausar proceso
                  </DropdownMenuItem>
                )}
                
                {isPausado && (
                  <DropdownMenuItem onClick={() => handleEstadoChange('ACTIVO')}>
                    <Play className="mr-2 h-4 w-4 text-emerald-500" />
                    Reanudar proceso
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={() => handleEstadoChange('CANCELADO')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar proceso
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-muted-foreground"
                  onClick={() => handleEstadoChange('ARCHIVADO')}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archivar proceso
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProcesoModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        proceso={proceso}
        onSuccess={(updated) => {
          onUpdate(updated)
          setEditModalOpen(false)
        }}
      />

      {isPatente && (
        <UpdateTRLModal
          open={trlModalOpen}
          onOpenChange={setTrlModalOpen}
          proceso={proceso}
          onSuccess={(updated) => {
            onUpdate(updated)
            onRefresh() 
            setTrlModalOpen(false)
          }}
        />
      )}
    </>
  )
}