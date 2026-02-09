import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Alert, AlertDescription } from '@components/ui/alert'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { actividadesAPI } from '@api/endpoints/actividades'
import { toast } from '@components/ui/use-toast'

export const ActividadEstadoMachine = ({ actividad, onUpdate }) => {
  const [loading, setLoading] = useState(false)

  // 1. Obtener evidencias
  const evidencias = Array.isArray(actividad.evidencias) ? actividad.evidencias : []

  // 2. 🔥 CORRECCIÓN CRÍTICA: Calcular estados basándonos en ÚLTIMAS VERSIONES
  // Agrupamos por requisitoId (o usamos un Map) para quedarnos solo con la versión más reciente
  const ultimasVersiones = Object.values(
    evidencias.reduce((acc, ev) => {
      // Si no tiene requisito (archivo extra), usamos su ID como clave única
      const key = ev.requisitoId ? `req-${ev.requisitoId}` : `extra-${ev.id}`;
      
      // Si no existe, o la versión actual es mayor que la guardada, actualizamos
      if (!acc[key] || ev.version > acc[key].version) {
        acc[key] = ev;
      }
      return acc;
    }, {})
  );

  // 3. Recalcular contadores usando SOLO las últimas versiones
  const pendientes = ultimasVersiones.filter(e => e.estado === 'PENDIENTE').length
  const rechazadas = ultimasVersiones.filter(e => e.estado === 'RECHAZADA').length
  
  // 4. 🔥 Simplificar la condición del botón
  // Si el backend dice LISTA_PARA_CIERRE, es porque ya validó todo.
  // Pero por doble seguridad visual, usamos los contadores filtrados.
  const puedeAprobar = actividad.estado === 'LISTA_PARA_CIERRE' && pendientes === 0 && rechazadas === 0

  const handleAprobar = async () => {
    setLoading(true)
    try {
      const { data } = await actividadesAPI.aprobar(actividad.id)
      
      // Ajuste para leer la respuesta correctamente según tu estructura
      const actividadActualizada = data.data || data
      
      toast({ title: "Actividad Aprobada", description: "El ciclo de vida de la actividad ha finalizado." })
      onUpdate(actividadActualizada)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Error al aprobar" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Banner de Estado */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500 uppercase">Estado Actual</span>
            <Badge variant="outline" className="bg-white">{actividad.estado.replace(/_/g, ' ')}</Badge>
        </div>
        
        {/* Explicación Contextual (Usando contadores corregidos) */}
        <div className="text-sm text-gray-700">
            {actividad.estado === 'CREADA' && "La actividad ha sido creada. Se iniciará cuando se suba el primer archivo."}
            {actividad.estado === 'EN_PROGRESO' && "El responsable está trabajando. Faltan entregar documentos o asignar revisor."}
            {actividad.estado === 'EN_REVISION' && `Hay ${pendientes} documento(s) pendiente(s) de revisión.`}
            {actividad.estado === 'OBSERVADA' && `Hay ${rechazadas} documento(s) rechazado(s) que requieren corrección.`}
            {actividad.estado === 'LISTA_PARA_CIERRE' && "Todos los documentos han sido aprobados. Lista para cierre formal."}
            {actividad.estado === 'APROBADA' && "Actividad finalizada y cerrada."}
        </div>
      </div>

      {/* Acción de Cierre */}
      {actividad.estado === 'LISTA_PARA_CIERRE' && (
        <div className="pt-2">
            <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-xs">
                    Todas las evidencias están correctas. Puedes proceder al cierre.
                </AlertDescription>
            </Alert>
            <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={handleAprobar} 
                disabled={loading || !puedeAprobar}
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle2 className="mr-2 h-4 w-4"/>}
                Aprobar y Cerrar Actividad
            </Button>
        </div>
      )}
    </div>
  )
}