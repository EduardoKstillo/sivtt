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

      hasRole: (role) => {
        const user = get().user
        if (!user || !user.roles) return false
        return user.roles.some(r => r.codigo === role)
      },

      hasAnyRole: (roles) => {
        return roles.some(role => get().hasRole(role))
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