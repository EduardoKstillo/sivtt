import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { Alert, AlertDescription } from '@components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const location = useLocation()
  const { isAuthenticated, hasAnyRole } = useAuthStore()

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si requiere roles específicos y no los tiene
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
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
  }

  return children
}