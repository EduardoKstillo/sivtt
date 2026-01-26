import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'

export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}