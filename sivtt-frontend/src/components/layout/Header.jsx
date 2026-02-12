import { useAuthStore } from '@store/authStore'
import { useUIStore } from '@store/uiStore'
import { Button } from '@components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { Bell, LogOut, Settings, User, Sun, Moon, Monitor } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '@api/endpoints/auth'
import { useEffect, useState } from 'react'

export const Header = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sivtt-theme') || 'system'
    }
    return 'system'
  })

  // Apply theme
  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (mode) => {
      if (mode === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches ? 'dark' : 'light')

      const handler = (e) => applyTheme(e.matches ? 'dark' : 'light')
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      applyTheme(theme)
    }

    localStorage.setItem('sivtt-theme', theme)
  }, [theme])

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

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ]

  const currentThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  const userInitial = user?.nombre?.charAt(0) || 'U'

  return (
    <header className="h-14 bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side — Breadcrumb placeholder */}
        <div className="flex items-center gap-4">
          {/* Breadcrumbs can be added here */}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1">
          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <currentThemeIcon className="h-[18px] w-[18px]" />
                <span className="sr-only">Cambiar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {themeOptions.map((opt) => {
                const Icon = opt.icon
                return (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={theme === opt.value ? 'bg-accent' : ''}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{opt.label}</span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-card" />
            <span className="sr-only">Notificaciones</span>
          </Button>

          {/* Divider */}
          <div className="h-6 w-px bg-border mx-2" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2.5 h-9 pl-1.5 pr-3 hover:bg-accent"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-primary to-indigo-400 dark:from-indigo-500 dark:to-violet-400 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-sm">
                  {userInitial}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {user?.nombre || 'Usuario'}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {user?.roles?.[0]?.nombre || 'Sin rol'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.nombre || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                </div>
              </DropdownMenuLabel>
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
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
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