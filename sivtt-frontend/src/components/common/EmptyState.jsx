import { FileQuestion } from 'lucide-react'
import { Button } from '@components/ui/button'

export const EmptyState = ({ 
  title = 'No hay resultados',
  description = 'No se encontraron elementos',
  action,
  actionLabel,
  icon: Icon = FileQuestion
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed border-border bg-dot-pattern">
      <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4 ring-4 ring-background">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
        {description}
      </p>
      {action && actionLabel && (
        <Button onClick={action} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}