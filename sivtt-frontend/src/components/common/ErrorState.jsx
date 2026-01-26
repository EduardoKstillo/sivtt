import { AlertCircle } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription } from '@components/ui/alert'

export const ErrorState = ({ 
  title = 'Error al cargar datos',
  message = 'Ocurrió un error inesperado',
  onRetry
}) => {
  return (
    <div className="p-8">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-1">{title}</div>
          <div className="text-sm">{message}</div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-4"
            >
              Reintentar
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}