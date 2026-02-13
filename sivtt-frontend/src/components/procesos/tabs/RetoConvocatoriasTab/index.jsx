import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { FileText, Megaphone } from 'lucide-react'
import { RetoView } from './RetoView'
import { ConvocatoriasList } from './ConvocatoriasList'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { useReto } from '@hooks/useReto'
import { useConvocatorias } from '@hooks/useConvocatorias'

export const RetoConvocatoriasTab = ({ proceso }) => {
  const [activeTab, setActiveTab] = useState('reto')
  
  // Cargar reto
  const {
    reto,
    loading: loadingReto,
    exists: retoExists,
    refetch: refetchReto
  } = useReto(proceso.id)

  // Cargar convocatorias (solo si existe el reto)
  const {
    convocatorias,
    loading: loadingConvocatorias,
    refetch: refetchConvocatorias
  } = useConvocatorias(reto?.id)

  const handleRetoCreated = () => {
    refetchReto()
    setActiveTab('reto')
  }

  const handleRetoUpdated = () => {
    refetchReto()
  }

  const handleConvocatoriaCreated = () => {
    refetchConvocatorias()
  }

  if (loadingReto) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Reto Empresarial y Convocatorias
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Define el reto tecnológico y gestiona las convocatorias para grupos de investigación
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="reto" className="gap-2">
            <FileText className="h-4 w-4" />
            Reto Empresarial
          </TabsTrigger>
          <TabsTrigger value="convocatorias" className="gap-2" disabled={!retoExists}>
            <Megaphone className="h-4 w-4" />
            Convocatorias
            {convocatorias.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                {convocatorias.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reto">
          <RetoView
            reto={reto}
            retoExists={retoExists}
            proceso={proceso}
            onRetoCreated={handleRetoCreated}
            onRetoUpdated={handleRetoUpdated}
          />
        </TabsContent>

        <TabsContent value="convocatorias">
          <ConvocatoriasList
            convocatorias={convocatorias}
            loading={loadingConvocatorias}
            reto={reto}
            proceso={proceso}
            onConvocatoriaCreated={handleConvocatoriaCreated}
            onUpdate={refetchConvocatorias}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}