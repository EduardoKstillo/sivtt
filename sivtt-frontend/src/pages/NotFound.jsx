import { Link } from 'react-router-dom'
import { Button } from '@components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          Página no encontrada
        </h2>
        <p className="text-gray-500 mt-2 mb-8">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link to="/dashboard">
          <Button>
            <Home className="mr-2 h-4 w-4" />
            Ir al Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}