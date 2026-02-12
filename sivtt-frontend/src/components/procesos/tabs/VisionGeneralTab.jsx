import { MetricCard } from '../cards/MetricCard'
import { TRLEvolutionChart } from '../charts/TRLEvolutionChart'
import { ActividadesProgressCard } from '../cards/ActividadesProgressCard'
import { EquipoCard } from '../cards/EquipoCard'
import { AlertasCard } from '../cards/AlertasCard'
import { TIPO_ACTIVO } from '@utils/constants'
import { Activity, Building2, TrendingUp, DollarSign } from 'lucide-react'

export const VisionGeneralTab = ({ proceso, onUpdate }) => {
  const isPatente = proceso.tipoActivo === TIPO_ACTIVO.PATENTE

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Actividades Completadas"
          value={`${proceso.actividadesCompletadas}/${proceso.actividadesTotales}`}
          icon={Activity}
          color="blue"
          subtitle={`${Math.round((proceso.actividadesCompletadas / proceso.actividadesTotales) * 100)}% completado`}
        />

        {isPatente && (
          <>
            <MetricCard
              title="Empresas Vinculadas"
              value={proceso.empresasVinculadas || 0}
              icon={Building2}
              color="purple"
              subtitle={proceso.empresasVinculadas > 0 ? 'Activas' : 'Sin empresas'}
            />

            <MetricCard
              title="TRL Actual"
              value={`${proceso.trlActual}/9`}
              icon={TrendingUp}
              color="green"
              subtitle={`Meta: TRL ${proceso.trlObjetivo || 9}`}
            />
          </>
        )}

        <MetricCard
          title="Financiamientos"
          value="S/. 0"
          icon={DollarSign}
          color="orange"
          subtitle="Sin financiamientos"
        />
      </div>

      {/* Progreso de Actividades */}
      <ActividadesProgressCard proceso={proceso} />

      {/* TRL Evolution Chart - Solo para PATENTE */}
      {isPatente && (
        <TRLEvolutionChart procesoId={proceso.id} />
      )}

      {/* Equipo y Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EquipoCard proceso={proceso} />
        <AlertasCard proceso={proceso} />
      </div>
    </div>
  )
}