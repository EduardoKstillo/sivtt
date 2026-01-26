import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { ProcesoHeader } from '@components/procesos/ProcesoHeader' //corregido
import { VisionGeneralTab } from '@components/procesos/tabs/VisionGeneralTab' //corregido
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { useProcesoDetail } from '@hooks/useProcesoDetail'
import { TIPO_ACTIVO } from '@utils/constants'
import { FasesTab } from '@components/procesos/tabs/FasesTab' // corregido
import { ActividadesTab } from '@components/procesos/tabs/ActividadesTab'
import { EvidenciasTab } from '@components/procesos/tabs/EvidenciasTab'
import { EmpresasTab } from '@components/procesos/tabs/EmpresasTab'
import { RetoConvocatoriasTab } from '@components/procesos/tabs/RetoConvocatoriasTab'
import { FinanciamientosTab } from '@components/procesos/tabs/FinanciamientosTab'
import { EquipoTab } from '@components/procesos/tabs/EquipoTab'
import { HistorialTab } from '@components/procesos/tabs/HistorialTab'

export default function ProcesoDetail() {
  const { id } = useParams()
  const { proceso, loading, error, refetch, updateProceso } = useProcesoDetail(id)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !proceso) {
    return (
      <ErrorState
        title="Error al cargar proceso"
        message="No se pudo cargar la información del proceso"
        onRetry={refetch}
      />
    )
  }
  
  console.log("PROCESO DETALLE")
  console.log(proceso)

  const isPatente = proceso.tipoActivo === TIPO_ACTIVO.PATENTE

  // Tabs disponibles según tipo de proceso
  const tabs = [
    { value: 'vision', label: 'Visión General' },
    { value: 'fases', label: 'Fases' },
    { value: 'actividades', label: 'Actividades' },
    { value: 'evidencias', label: 'Evidencias' },
    ...(isPatente
      ? [{ value: 'empresas', label: 'Empresas' }]
      : [{ value: 'reto-convocatorias', label: 'Reto y Convocatorias' }]
    ),
    { value: 'financiamientos', label: 'Financiamientos' },
    { value: 'equipo', label: 'Equipo' },
    { value: 'historial', label: 'Historial' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProcesoHeader
        proceso={proceso}
        onUpdate={updateProceso}
        onRefresh={refetch}
      />

      {/* Tabs */}
      <Tabs defaultValue="vision" className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1 h-auto flex-wrap justify-start">
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 px-4 py-2"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab: Visión General */}
        <TabsContent value="vision">
          <VisionGeneralTab
            proceso={proceso}
            onUpdate={updateProceso}
          />
        </TabsContent>

        {/* Tabs Placeholder - Se implementarán en siguientes fases */}
        <TabsContent value="fases">
          <FasesTab
            proceso={proceso}
            onUpdate={updateProceso}
          />
        </TabsContent>

        <TabsContent value="actividades">
          <ActividadesTab
            proceso={proceso}
            onUpdate={updateProceso}
          />
        </TabsContent>

        <TabsContent value="evidencias">
          <EvidenciasTab proceso={proceso} />
        </TabsContent>

        {isPatente ? (
          <TabsContent value="empresas">
            <EmpresasTab
              proceso={proceso}
              onUpdate={updateProceso}
            />
          </TabsContent>
        ) : (
          <TabsContent value="reto-convocatorias">
            <RetoConvocatoriasTab
              proceso={proceso}
              onUpdate={updateProceso}
            />
          </TabsContent>
        )}

        <TabsContent value="financiamientos">
          <FinanciamientosTab proceso={proceso} />
        </TabsContent>

        <TabsContent value="equipo">
          <EquipoTab proceso={proceso} />
        </TabsContent>

        <TabsContent value="historial">
          <HistorialTab proceso={proceso} />
        </TabsContent>
      </Tabs>
    </div>
  )
}