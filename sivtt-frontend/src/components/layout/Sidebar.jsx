import { Link, useLocation } from 'react-router-dom'
import { useUIStore } from '@store/uiStore'
import { useAuthStore } from '@store/authStore'
import { Button } from '@components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip'
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
  Zap
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

  const userInitial = user?.nombre?.charAt(0) || 'U'

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen z-50",
          "bg-card border-r border-border",
          "transition-all duration-300 ease-out",
          "flex flex-col",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* ── Logo & Toggle ─────────────────────────────────── */}
        <div className="h-16 border-b border-border flex items-center justify-between px-3 shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-400 dark:from-indigo-500 dark:to-violet-400 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-foreground text-sm tracking-tight">
                  SIVTT
                </span>
                <p className="text-[10px] text-muted-foreground leading-tight truncate">
                  Vinculación Tecnológica
                </p>
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-400 dark:from-indigo-500 dark:to-violet-400 rounded-lg flex items-center justify-center shadow-sm">
                <Zap className="h-4 w-4 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Toggle button — floats on the edge */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "absolute -right-3 top-20 z-50",
            "w-6 h-6 rounded-full",
            "bg-card border border-border shadow-sm",
            "flex items-center justify-center",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-accent transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>

        {/* ── Navigation ────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2 space-y-6">
          {navigationItems.map((section, idx) => (
            <div key={idx}>
              {/* Section label */}
              {!sidebarCollapsed && (
                <h3 className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {section.section}
                </h3>
              )}

              {/* Collapsed: thin divider between sections */}
              {sidebarCollapsed && idx > 0 && (
                <div className="mx-3 mb-2 border-t border-border" />
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  if (!canAccess(item.roles)) return null

                  const Icon = item.icon
                  const active = isActive(item.href)

                  const linkContent = (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2 rounded-lg",
                        "transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active && [
                          "bg-primary/10 text-primary font-medium",
                          "dark:bg-primary/15 dark:text-primary",
                        ],
                        !active && [
                          "text-muted-foreground",
                          "hover:bg-accent hover:text-accent-foreground",
                        ],
                        sidebarCollapsed && "justify-center px-0"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-colors duration-150",
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-accent-foreground"
                        )}
                      />
                      {!sidebarCollapsed && (
                        <span className="text-sm truncate">{item.name}</span>
                      )}
                    </Link>
                  )

                  // Wrap in tooltip when collapsed
                  if (sidebarCollapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12}>
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return linkContent
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User Info ─────────────────────────────────────── */}
        <div className="shrink-0 p-3 border-t border-border">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-400 dark:from-indigo-500 dark:to-violet-400 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-sm">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate leading-tight">
                  {user?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                  {user?.email || ''}
                </p>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center cursor-default">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-400 dark:from-indigo-500 dark:to-violet-400 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                    {userInitial}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                <p className="font-medium">{user?.nombre || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}