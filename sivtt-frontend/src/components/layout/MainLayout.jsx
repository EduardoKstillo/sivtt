import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
// import { Toaster } from '@components/ui/toaster'
import { useUIStore } from '@store/uiStore'
import { cn } from '@/lib/utils'

export const MainLayout = () => {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Toast Notifications */}
      {/* <Toaster /> */}
    </div>
  )
}