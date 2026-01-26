import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { Badge } from '@components/ui/badge'
import { Users } from 'lucide-react'

export const EquipoCard = ({ proceso }) => {
  // El backend devuelve un array plano de usuarios con su rol
  const equipo = proceso.usuarios || []

  const getRolBadgeColor = (rol) => {
    switch (rol) {
      case 'RESPONSABLE_PROCESO':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'APOYO':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'OBSERVADOR':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Helper para iniciales
  const getInitials = (nombres, apellidos) => {
    return `${nombres?.charAt(0) || ''}${apellidos?.charAt(0) || ''}`.toUpperCase()
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          Equipo del Proceso
        </CardTitle>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Gestionar
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {equipo.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6 text-gray-500 text-sm">
            <Users className="h-8 w-8 text-gray-300 mb-2" />
            <p>No hay miembros asignados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {equipo.slice(0, 5).map((miembro) => (
              <div key={miembro.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-gray-200">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-medium">
                    {getInitials(miembro.nombres, miembro.apellidos)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {miembro.nombres} {miembro.apellidos}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {miembro.email}
                  </p>
                </div>

                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${getRolBadgeColor(miembro.rolProceso)}`}>
                  {miembro.rolProceso === 'RESPONSABLE_PROCESO' ? 'RESPONSABLE' : miembro.rolProceso}
                </Badge>
              </div>
            ))}

            {equipo.length > 5 && (
              <Button variant="ghost" size="sm" className="w-full text-xs text-gray-500 mt-2">
                Ver {equipo.length - 5} miembro{equipo.length - 5 > 1 ? 's' : ''} más
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}