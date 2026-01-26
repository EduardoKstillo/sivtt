import { useAuthStore } from '@store/authStore'
import { Button } from '@components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { Bell, LogOut, Settings, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '@api/endpoints/auth'

export const Header = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      logout()
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Breadcrumb or Page Title - Placeholder */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {/* Esto se puede reemplazar con breadcrumbs dinámicos */}
          </h2>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.nombre?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.nombre || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.roles?.[0]?.nombre || 'Sin rol'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}