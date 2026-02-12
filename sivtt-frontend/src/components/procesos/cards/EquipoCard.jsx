import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { Badge } from '@components/ui/badge'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const rolStyles = {
  RESPONSABLE_PROCESO: {
    label: 'Responsable',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40',
  },
  APOYO: {
    label: 'Apoyo',
    className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/40',
  },
  OBSERVADOR: {
    label: 'Observador',
    className: 'bg-muted text-muted-foreground border-border',
  },
}

export const EquipoCard = ({ proceso }) => {
  const equipo = proceso.usuarios || []

  const getInitials = (nombres, apellidos) => {
    return `${nombres?.charAt(0) || ''}${apellidos?.charAt(0) || ''}`.toUpperCase()
  }

  const getRolStyle = (rol) => {
    return rolStyles[rol] || { label: rol, className: 'bg-muted text-muted-foreground border-border' }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          Equipo del Proceso
        </CardTitle>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Gestionar
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {equipo.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No hay miembros asignados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {equipo.slice(0, 5).map((miembro) => {
              const rolStyle = getRolStyle(miembro.rolProceso)
              return (
                <div
                  key={miembro.id}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-400 dark:from-indigo-500 dark:to-violet-400 text-white text-[11px] font-medium">
                      {getInitials(miembro.nombres, miembro.apellidos)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {miembro.nombres} {miembro.apellidos}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {miembro.email}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-2 py-0.5 shrink-0', rolStyle.className)}
                  >
                    {rolStyle.label}
                  </Badge>
                </div>
              )
            })}

            {equipo.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground mt-1"
              >
                Ver {equipo.length - 5} miembro{equipo.length - 5 > 1 ? 's' : ''} más
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}