import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { authAPI } from '@api/endpoints/auth'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Alert, AlertDescription } from '@components/ui/alert'
import { Loader2, Lock, Mail, AlertCircle } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data } = await authAPI.login(formData)
      
      // Guardar tokens
      setTokens(data.data.accessToken, data.data.refreshToken)
      
      // Guardar usuario
      setUser(data.data.user)
      
      // Redireccionar al dashboard
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Error al iniciar sesión. Verifique sus credenciales.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Lock className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">
              SIVTT
            </h1>
            <p className="text-center text-blue-100 text-sm">
              Sistema de Vinculación y Transferencia Tecnológica
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="usuario@unsa.edu.pe"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-11"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 h-11"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                ¿Problemas para acceder?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Contactar soporte
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Version info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            DITT - Universidad Nacional de San Agustín
          </p>
          <p className="text-xs text-gray-400 mt-1">
            v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </p>
        </div>
      </div>
    </div>
  )
}