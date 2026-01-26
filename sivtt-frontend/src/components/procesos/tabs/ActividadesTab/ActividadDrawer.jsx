import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@components/ui/sheet'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { 
  X, 
  Calendar, 
  Users,
  Paperclip,
  MessageSquare,
  Clock
} from 'lucide-react'
import { ActividadEstadoMachine } from './ActividadEstadoMachine' // ys
import { EvidenciasList } from './EvidenciasList'
import { AsignacionesManager } from './AsignacionesManager' // ya
import { ReunionManager } from './ReunionManager'
import { useActividadDetail } from '@hooks/useActividadDetail'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { formatDate, formatDateTime } from '@utils/formatters'
import { cn } from '@/lib/utils'

export const ActividadDrawer = ({ actividadId, open, onClose, proceso }) => {
  const { actividad, loading, refetch, updateActividad } = useActividadDetail(actividadId)

  if (!open) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : actividad ? (
          <>
            <SheetHeader className="space-y-4 pb-6 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-xl pr-8">
                    {actividad.nombre}
                  </SheetTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{actividad.fase}</Badge>
                <Badge variant="outline">{actividad.tipo}</Badge>
                {actividad.obligatoria && (
                  <Badge variant="destructive">Obligatoria</Badge>
                )}
              </div>

              {/* Descripción */}
              {actividad.descripcion && (
                <p className="text-sm text-gray-600">
                  {actividad.descripcion}
                </p>
              )}

              {/* Info adicional */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {actividad.fechaLimite && (
                  <div>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Fecha límite:
                    </span>
                    <span className={cn(
                      "font-medium",
                      new Date(actividad.fechaLimite) < new Date() && 
                      actividad.estado !== 'APROBADA' && 
                      "text-red-600"
                    )}>
                      {formatDate(actividad.fechaLimite)}
                    </span>
                  </div>
                )}

                {actividad.fechaCierre && (
                  <div>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Cerrada:
                    </span>
                    <span className="font-medium">
                      {formatDate(actividad.fechaCierre)}
                    </span>
                  </div>
                )}
              </div>
            </SheetHeader>

            {/* Content Tabs */}
            <div className="py-6">
              <Tabs defaultValue="estado" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="estado">Estado</TabsTrigger>
                  <TabsTrigger value="evidencias">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Evidencias
                  </TabsTrigger>
                  <TabsTrigger value="equipo">
                    <Users className="h-4 w-4 mr-2" />
                    Equipo
                  </TabsTrigger>
                  {actividad.tipo === 'REUNION' && (
                    <TabsTrigger value="reunion">
                      <Calendar className="h-4 w-4 mr-2" />
                      Reunión
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="estado" className="space-y-4">
                  <ActividadEstadoMachine
                    actividad={actividad}
                    onUpdate={(updated) => {
                      updateActividad(updated)
                      refetch()
                    }}
                  />
                </TabsContent>

                <TabsContent value="evidencias">
                  <EvidenciasList
                    actividad={actividad}
                    onUpdate={refetch}
                  />
                </TabsContent>

                <TabsContent value="equipo">
                  <AsignacionesManager
                    actividad={actividad}
                    proceso={proceso}
                    onUpdate={refetch}
                  />
                </TabsContent>

                {actividad.tipo === 'REUNION' && (
                  <TabsContent value="reunion">
                    <ReunionManager
                      actividad={actividad}
                      onUpdate={refetch}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-20 text-gray-500">
            No se pudo cargar la actividad
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}