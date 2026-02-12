import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { ProcesoHeader } from '@components/procesos/ProcesoHeader'
import { VisionGeneralTab } from '@components/procesos/tabs/VisionGeneralTab'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { ErrorState } from '@components/common/ErrorState'
import { useProcesoDetail } from '@hooks/useProcesoDetail'
import { TIPO_ACTIVO } from '@utils/constants'
import { FasesTab } from '@components/procesos/tabs/FasesTab'
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
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="bg-card border border-border p-1 h-auto inline-flex w-auto min-w-full sm:min-w-0 gap-0.5">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none px-3.5 py-2 text-sm text-muted-foreground whitespace-nowrap rounded-md transition-colors"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="vision">
          <VisionGeneralTab
            proceso={proceso}
            onUpdate={updateProceso}
          />
        </TabsContent>

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