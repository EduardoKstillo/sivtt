import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@components/layout/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { PERMISOS } from '@utils/permissions'

// Pages
import Login from '@pages/Login'
import Dashboard from '@pages/Dashboard/Dashboard'
import ProcesosList from '@pages/procesos/ProcesosList'
import ProcesoDetail from '@pages/procesos/ProcesoDetail'
import NotFound from '@pages/NotFound'
import { EmpresasList } from '@pages/empresas/EmpresasList'
import { GruposList } from '@pages/grupos/GruposList'
import { ConvocatoriasList } from '@pages/convocatorias/ConvocatoriasList'
import { ConvocatoriaDetail } from '@pages/convocatorias/ConvocatoriaDetail'
import { UsuariosList } from '@pages/usuarios/UsuariosList'

export const AppRoutes = () => {
  return (
    <BrowserRouter basename="/sivtt">
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Rutas protegidas — solo requieren estar autenticado */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard — accesible a todos los autenticados */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Procesos — requiere ver:proceso */}
          <Route
            path="procesos"
            element={
              <ProtectedRoute requiredPermission={PERMISOS.VER_PROCESO}>
                <ProcesosList />
              </ProtectedRoute>
            }
          />
          <Route
            path="procesos/:id"
            element={
              <ProtectedRoute requiredPermission={PERMISOS.VER_PROCESO}>
                <ProcesoDetail />
              </ProtectedRoute>
            }
          />

          {/* Empresas — requiere ver:proceso */}
          <Route
            path="empresas"
            element={
              <ProtectedRoute requiredPermission={PERMISOS.VER_PROCESO}>
                <EmpresasList />
              </ProtectedRoute>
            }
          />

          {/* Grupos — requiere ver:convocatorias */}
          <Route
            path="grupos"
            element={
              <ProtectedRoute requiredPermission={PERMISOS.VER_CONVOCATORIAS}>
                <GruposList />
              </ProtectedRoute>
            }
          />

          {/* Convocatorias — requiere ver:convocatorias */}
          <Route
            path="convocatorias"
            element={
              <ProtectedRoute requiredPermission={PERMISOS.VER_CONVOCATORIAS}>
                <ConvocatoriasList />
              </ProtectedRoute>
            }
          />
          <Route
            path="convocatorias/:id"
            element={
              <ProtectedRoute requiredPermission={PERMISOS.VER_CONVOCATORIAS}>
                <ConvocatoriaDetail />
              </ProtectedRoute>
            }
          />

          {/* Usuarios — requiere ver:usuarios */}
          <Route
            path="usuarios"
            element={
              <ProtectedRoute requiredPermission={PERMISOS.VER_USUARIOS}>
                <UsuariosList />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}