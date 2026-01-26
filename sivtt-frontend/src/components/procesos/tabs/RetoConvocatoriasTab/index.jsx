import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { RetoView } from './RetoView'
import { ConvocatoriasList } from './ConvocatoriasList'
import { FileText, Megaphone, Users } from 'lucide-react'

export const RetoConvocatoriasTab = ({ proceso, onUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Reto y Convocatorias
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona el reto empresarial y las convocatorias para grupos de investigación
        </p>
      </div>

      {/* Sub-Tabs */}
      <Tabs defaultValue="reto" className="space-y-6">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="reto">
            <FileText className="h-4 w-4 mr-2" />
            Reto Empresarial
          </TabsTrigger>
          <TabsTrigger value="convocatorias">
            <Megaphone className="h-4 w-4 mr-2" />
            Convocatorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reto">
          <RetoView proceso={proceso} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="convocatorias">
          <ConvocatoriasList proceso={proceso} onUpdate={onUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  )
}