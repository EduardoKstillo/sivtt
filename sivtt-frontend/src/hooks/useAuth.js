import { useCallback } from 'react'
import { useAuthStore } from '@store/authStore'
import { authAPI } from '@api/endpoints/auth'
import { PERMISOS, ROLES } from '@utils/permissions'

/**
 * Hook principal de autenticación.
 * Expone todo lo necesario para login/logout y verificación de permisos en componentes.
 */
export const useAuth = () => {
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    setTokens,
    setUser,
    setAccessToken,
    logout: storeLogout,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
  } = useAuthStore()

  // ─── Login ────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const response = await authAPI.login({ email, password })
    const { accessToken, refreshToken, usuario } = response.data.data

    setTokens(accessToken, refreshToken)
    setUser(usuario)

    return usuario
  }, [setTokens, setUser])

  // ─── Logout ───────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await authAPI.logout({ refreshToken })
      }
    } catch {
      // Ignorar errores de logout en el servidor
    } finally {
      storeLogout()
    }
  }, [refreshToken, storeLogout])

  // ─── Helpers de permiso para uso directo en JSX ──────────
  /**
   * Retorna true si el usuario tiene el permiso indicado.
   * Uso: can(PERMISOS.EDITAR_PROCESO)
   */
  const can = useCallback((permiso) => hasPermission(permiso), [hasPermission])

  /**
   * Retorna true si el usuario tiene AL MENOS UNO de los permisos.
   * Uso: canAny([PERMISOS.EDITAR_PROCESO, PERMISOS.VER_PROCESO])
   */
  const canAny = useCallback((permisos) => hasAnyPermission(permisos), [hasAnyPermission])

  /**
   * Retorna true si el usuario tiene TODOS los permisos.
   */
  const canAll = useCallback((permisos) => hasAllPermissions(permisos), [hasAllPermissions])

  return {
    // Estado
    user,
    accessToken,
    isAuthenticated,
    isAdmin: isAdmin(),

    // Acciones
    login,
    logout,

    // Verificación de roles (compatibilidad)
    hasRole,
    hasAnyRole,

    // Verificación de permisos (nuevo sistema)
    hasPermission,
    can,
    canAny,
    canAll,

    // Constantes re-exportadas para conveniencia
    PERMISOS,
    ROLES,
  }
}