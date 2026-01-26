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
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        {description}
      </p>
      {action && actionLabel && (
        <Button onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}