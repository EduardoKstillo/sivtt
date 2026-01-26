import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/badge'
import { ESTADO_PROCESO, TIPO_ACTIVO } from '@utils/constants'
import { formatDate } from '@utils/formatters'

export const ProcesoTable = ({ procesos }) => {
  const getEstadoVariant = (estado) => {
    switch (estado) {
      case ESTADO_PROCESO.ACTIVO:
        return 'default'
      case ESTADO_PROCESO.FINALIZADO:
        return 'outline'
      case ESTADO_PROCESO.CANCELADO:
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-md text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">Código</th>
            <th className="px-3 py-2 text-left">Título</th>
            <th className="px-3 py-2 text-left">Tipo</th>
            <th className="px-3 py-2 text-left">Responsable</th>
            <th className="px-3 py-2 text-left">Fase</th>
            <th className="px-3 py-2 text-center">Activ.</th>
            <th className="px-3 py-2 text-center">Empresas</th>
            <th className="px-3 py-2 text-left">Estado</th>
            <th className="px-3 py-2 text-left">Creado</th>
          </tr>
        </thead>

        <tbody>
          {procesos.map((p) => {
            const responsable = p.usuarios?.[0]?.usuario
            const responsableNombre = responsable
              ? `${responsable.nombres} ${responsable.apellidos}`
              : '—'

            return (
              <tr
                key={p.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-3 py-2 font-medium">
                  <Link
                    to={`/procesos/${p.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {p.codigo}
                  </Link>
                </td>

                <td className="px-3 py-2 max-w-[280px] truncate">
                  {p.titulo}
                </td>

                <td className="px-3 py-2">
                  <Badge variant="outline">
                    {p.tipoActivo === TIPO_ACTIVO.PATENTE
                      ? 'PATENTE'
                      : 'REQUERIMIENTO'}
                  </Badge>
                </td>

                <td className="px-3 py-2">{responsableNombre}</td>

                <td className="px-3 py-2">
                  <Badge variant="secondary">{p.faseActual}</Badge>
                </td>

                <td className="px-3 py-2 text-center">
                  {p.actividadesTotales}
                </td>

                <td className="px-3 py-2 text-center">
                  {p.empresasVinculadas}
                </td>

                <td className="px-3 py-2">
                  <Badge variant={getEstadoVariant(p.estado)}>
                    {p.estado}
                  </Badge>
                </td>

                <td className="px-3 py-2 text-xs text-gray-500">
                  {formatDate(p.createdAt)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
