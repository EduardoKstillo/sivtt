import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { Alert, AlertDescription } from '@components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export const ProtectedRoute = ({
  children,
  requiredRoles = [],
  requiredPermission = null,
}) => {
  const location = useLocation()
  const { isAuthenticated, hasAnyRole, hasPermission } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar permiso específico si se proporcionó
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AccessDenied />
  }

  // Verificar roles si se proporcionaron (compatibilidad)
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <AccessDenied />
  }

  return children
}

const AccessDenied = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No tiene permisos para acceder a esta sección.
        </AlertDescription>
      </Alert>
      <div className="mt-4 text-center">
        <button
          onClick={() => window.history.back()}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Volver atrás
        </button>
      </div>
    </div>
  </div>
)