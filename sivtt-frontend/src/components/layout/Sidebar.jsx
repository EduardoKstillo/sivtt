import { Link, useLocation } from 'react-router-dom'
import { useUIStore } from '@store/uiStore'
import { useAuthStore } from '@store/authStore'
import { Button } from '@components/ui/button'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Rocket,
  Building2,
  Users,
  Megaphone,
  User,
  ChevronLeft,
  ChevronRight,
  Lock
} from 'lucide-react'
import { ROL_SISTEMA } from '@utils/constants'

const navigationItems = [
  {
    section: 'Gestión Central',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: [] // Todos
      },
      {
        name: 'Procesos',
        href: '/procesos',
        icon: Rocket,
        roles: []
      }
    ]
  },
  {
    section: 'Actores',
    items: [
      {
        name: 'Empresas',
        href: '/empresas',
        icon: Building2,
        roles: []
      },
      {
        name: 'Grupos de Investigación',
        href: '/grupos',
        icon: Users,
        roles: []
      }
    ]
  },
  {
    section: 'Convocatorias',
    items: [
      {
        name: 'Convocatorias',
        href: '/convocatorias',
        icon: Megaphone,
        roles: []
      }
    ]
  },
  {
    section: 'Administración',
    items: [
      {
        name: 'Usuarios',
        href: '/usuarios',
        icon: User,
        // roles: [ROL_SISTEMA.ADMIN_SISTEMA, ROL_SISTEMA.GESTOR_VINCULACION]
      }
    ]
  }
]

export const Sidebar = () => {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user, hasAnyRole } = useAuthStore()

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const canAccess = (roles) => {
    if (!roles || roles.length === 0) return true
    return hasAnyRole(roles)
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo & Toggle */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">SIVTT</span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-6 overflow-y-auto h-[calc(100vh-8rem)]">
        {navigationItems.map((section, idx) => (
          <div key={idx}>
            {!sidebarCollapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.section}
              </h3>
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => {
                if (!canAccess(item.roles)) return null
                
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      "hover:bg-gray-100",
                      active && "bg-blue-50 text-blue-700 font-medium",
                      !active && "text-gray-700",
                      sidebarCollapsed && "justify-center"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", active && "text-blue-700")} />
                    {!sidebarCollapsed && (
                      <span className="text-sm">{item.name}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nombre || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}