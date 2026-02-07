import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from '@components/ui/sheet'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { X, Calendar, Users, Paperclip, Activity } from 'lucide-react' // Usamos Activity para el icono de estado
import { ActividadEstadoMachine } from './ActividadEstadoMachine'
import { EvidenciasList } from './EvidenciasList'
import { AsignacionesManager } from './AsignacionesManager'
import { ReunionManager } from './ReunionManager'
import { useActividadDetail } from '@hooks/useActividadDetail'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { formatDate } from '@utils/formatters'
import { cn } from '@/lib/utils'

export const ActividadDrawer = ({ actividadId, open, onClose, proceso }) => {
  const { actividad, loading, refetch, updateActividad } = useActividadDetail(actividadId)

  if (!open) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
        ) : actividad ? (
          <>
            <SheetHeader className="space-y-4 pb-6 border-b">
              <div className="flex justify-between items-start">
                <SheetTitle className="text-xl">{actividad.nombre}</SheetTitle>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4"/></Button>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{actividad.fase}</Badge>
                <Badge variant="outline">{actividad.tipo}</Badge>
                {actividad.obligatoria && <Badge variant="destructive">Obligatoria</Badge>}
              </div>
              {actividad.descripcion && <p className="text-sm text-gray-600">{actividad.descripcion}</p>}
            </SheetHeader>

            <div className="py-6">
              <Tabs defaultValue="evidencias" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="evidencias"><Paperclip className="h-4 w-4 mr-2"/> Evidencias</TabsTrigger>
                  <TabsTrigger value="estado"><Activity className="h-4 w-4 mr-2"/> Estado</TabsTrigger>
                  <TabsTrigger value="equipo"><Users className="h-4 w-4 mr-2"/> Equipo</TabsTrigger>
                  {actividad.tipo === 'REUNION' && (
                    <TabsTrigger value="reunion"><Calendar className="h-4 w-4 mr-2"/> Reunión</TabsTrigger>
                  )}
                </TabsList>

                {/* Contenidos */}
                <TabsContent value="evidencias">
                    <EvidenciasList actividad={actividad} onUpdate={refetch} />
                </TabsContent>
                <TabsContent value="estado">
                    <ActividadEstadoMachine actividad={actividad} onUpdate={(d) => { updateActividad(d); refetch(); }} />
                </TabsContent>
                <TabsContent value="equipo">
                    <AsignacionesManager actividad={actividad} proceso={proceso} onUpdate={refetch} />
                </TabsContent>
                <TabsContent value="reunion">
                    <ReunionManager actividad={actividad} onUpdate={refetch} />
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}