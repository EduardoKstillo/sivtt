import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: true })
      },

      setAccessToken: (accessToken) => {
        set({ accessToken })
      },

      setUser: (user) => {
        set({ user })
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false
        })
      },

      // ─── Helpers de roles ────────────────────────────────────────
      // El backend devuelve roles como array de strings: ['ADMIN_SISTEMA']
      hasRole: (role) => {
        const user = get().user
        if (!user?.roles) return false
        return user.roles.includes(role)
      },

      hasAnyRole: (roles) => {
        return roles.some(role => get().hasRole(role))
      },

      // ─── Helpers de permisos (nuevo sistema RBAC) ────────────────
      // El backend devuelve permisos como array de strings: ['ver:proceso', 'editar:proceso']
      hasPermission: (permiso) => {
        const user = get().user
        if (!user) return false
        // ADMIN_SISTEMA bypasea todo
        if (user.roles?.includes('ADMIN_SISTEMA')) return true
        return user.permisos?.includes(permiso) ?? false
      },

      hasAnyPermission: (permisos) => {
        return permisos.some(p => get().hasPermission(p))
      },

      hasAllPermissions: (permisos) => {
        return permisos.every(p => get().hasPermission(p))
      },

      isAdmin: () => {
        return get().hasRole('ADMIN_SISTEMA')
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)