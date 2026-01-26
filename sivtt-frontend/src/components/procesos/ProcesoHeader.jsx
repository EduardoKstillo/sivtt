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

export const ProcesoHeader = ({ proceso, onUpdate, onRefresh }) => {
  const navigate = useNavigate()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [trlModalOpen, setTrlModalOpen] = useState(false)

  const isPatente = proceso.tipoActivo === TIPO_ACTIVO.PATENTE
  const isActivo = proceso.estado === ESTADO_PROCESO.ACTIVO
  const isPausado = proceso.estado === ESTADO_PROCESO.PAUSADO

  // ✅ CORRECCIÓN: Buscar al responsable dentro del array de usuarios
  const responsable = proceso.usuarios?.find(u => u.rolProceso === 'RESPONSABLE_PROCESO')
  const nombreResponsable = responsable 
    ? `${responsable.nombres} ${responsable.apellidos}` 
    : 'Sin responsable asignado'

  const getEstadoBadgeVariant = (estado) => {
    switch (estado) {
      case ESTADO_PROCESO.ACTIVO:
        return 'default' // o una clase custom bg-green-...
      case ESTADO_PROCESO.PAUSADO:
        return 'secondary'
      case ESTADO_PROCESO.FINALIZADO:
        return 'outline'
      case ESTADO_PROCESO.CANCELADO:
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // TODO: Conectar estos handlers con endpoints reales en el futuro
  const handleEstadoChange = (nuevoEstado) => {
    console.log("Cambiar estado a:", nuevoEstado)
    // Aquí iría la llamada a la API
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/procesos')}
          className="mb-4 -ml-2 text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Procesos
        </Button>

        {/* Header Content */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Badges Superiores */}
            <div className="flex items-center gap-3 mb-3">
              <Badge 
                className={cn(
                  "text-white border-0 px-3 py-1",
                  isPatente 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200" 
                    : "bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-200"
                )}
              >
                {isPatente ? 'PATENTE' : 'REQUERIMIENTO'}
              </Badge>
              <span className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded border">
                {proceso.codigo}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {proceso.titulo}
            </h1>

            {/* Metadata Grid */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
              
              {/* Estado */}
              <div className="flex items-center gap-2">
                <Badge variant={getEstadoBadgeVariant(proceso.estado)} className="uppercase tracking-wider text-xs">
                  {proceso.estado.replace('_', ' ')}
                </Badge>
              </div>
              
              {/* Fase */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Fase Actual:</span>
                <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    {proceso.faseActual}
                </span>
              </div>

              {/* TRL (Solo Patente) */}
              {isPatente && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">TRL:</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="font-bold text-gray-900">{proceso.trlActual}</span>
                    <span className="text-gray-400">/ 9</span>
                  </div>
                </div>
              )}

              {/* Responsable */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span title={nombreResponsable} className="truncate max-w-[200px]">
                  {nombreResponsable}
                </span>
              </div>

              {/* Fecha */}
              <div className="text-gray-400 pl-2 border-l border-gray-200 hidden md:block">
                Creado el {formatDate(proceso.createdAt)}
              </div>
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
              {/* Mobile Trigger icon only */}
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
                    <TrendingUp className="mr-2 h-4 w-4 text-blue-600" />
                    Actualizar TRL
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* Lógica de Estados */}
                {isActivo && (
                  <DropdownMenuItem onClick={() => handleEstadoChange('PAUSADO')}>
                    <Pause className="mr-2 h-4 w-4 text-yellow-600" />
                    Pausar proceso
                  </DropdownMenuItem>
                )}
                
                {isPausado && (
                   <DropdownMenuItem onClick={() => handleEstadoChange('ACTIVO')}>
                    <Play className="mr-2 h-4 w-4 text-green-600" />
                    Reanudar proceso
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => handleEstadoChange('CANCELADO')}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar proceso
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => handleEstadoChange('ARCHIVADO')}>
                  <Archive className="mr-2 h-4 w-4 text-gray-500" />
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
            // Si el TRL cambia, suele refrescarse el historial, así que mejor refrescar todo
            onRefresh() 
            setTrlModalOpen(false)
          }}
        />
      )}
    </>
  )
}