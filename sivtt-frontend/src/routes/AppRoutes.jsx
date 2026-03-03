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
import { MisActividadesPage } from '@pages/mis-actividades/MisActividadesPage'

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
            <ProtectedRoute requiredPermission={PERMISOS.ACCESO_BASICO}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard — requiere ver:dashboard */}
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute requiredPermission={PERMISOS.VER_DASHBOARD}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Procesos — El listado lo ve cualquiera, el detalle lo protege el backend */}
          <Route
            path="procesos"
            element={
              <ProtectedRoute requiredPermission={PERMISOS.VER_PROCESOS_GLOBAL}>
                <ProcesosList />
              </ProtectedRoute>
            }
          />
          <Route
            path="procesos/:id"
            element={
              <ProtectedRoute requiredPermission={PERMISOS.ACCESO_BASICO}>
                <ProcesoDetail />
              </ProtectedRoute>
            }
          />

          {/* Empresas */}
          <Route
            path="empresas"
            element={
              <ProtectedRoute requiredPermission={PERMISOS.VER_PROCESOS_GLOBAL}>
                <EmpresasList />
              </ProtectedRoute>
            }
          />

          {/* Grupos */}
          <Route
            path="grupos"
            element={
              <ProtectedRoute requiredPermission={PERMISOS.VER_CONVOCATORIAS}>
                <GruposList />
              </ProtectedRoute>
            }
          />

          {/* Convocatorias */}
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
              <ProtectedRoute requiredPermission={PERMISOS.ACCESO_BASICO}>
                <ConvocatoriaDetail />
              </ProtectedRoute>
            }
          />

          {/* Mis Actividades — accesible a todos los autenticados */}
          <Route path="mis-actividades" element={<MisActividadesPage />} />

          {/* Usuarios — Solo administradores */}
          <Route
            path="usuarios"
            element={
              <ProtectedRoute requiredPermission={PERMISOS.GESTIONAR_USUARIOS}>
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