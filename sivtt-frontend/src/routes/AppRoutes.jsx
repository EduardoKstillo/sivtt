import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@components/layout/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

// Pages
import Login from '@pages/Login'
import Dashboard from '@pages/Dashboard'
import ProcesosList from '@pages/procesos/ProcesosList'
import ProcesoDetail from '@pages/procesos/ProcesoDetail'
import NotFound from '@pages/NotFound'
import { EmpresasList } from '@pages/empresas/EmpresasList'
import { GruposList } from '@pages/grupos/GruposList'
import { ConvocatoriasList } from '@pages/convocatorias/ConvocatoriasList'
import { ConvocatoriaDetail } from '@pages/convocatorias/ConvocatoriaDetail'
import { UsuariosList } from '@pages/usuarios/UsuariosList'


import { ROL_SISTEMA } from '@utils/constants'

export const AppRoutes = () => {
  return (
    <BrowserRouter>
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

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />

          {/* Módulo Procesos */}
          <Route path="procesos">
            <Route index element={<ProcesosList />} />
            <Route path=":id" element={<ProcesoDetail />} />
          </Route>

          {/* Empresas */}
          <Route path="/empresas" element={<EmpresasList />} />
          <Route path="/grupos" element={<GruposList />} />

          <Route path="convocatorias">
            <Route index element={<ConvocatoriasList />} />
            <Route path=":id" element={<ConvocatoriaDetail />} />
          </Route>

          {/* <Route
            path="usuarios"
            element={
              <ProtectedRoute requiredRoles={[ROL_SISTEMA.ADMIN_SISTEMA]}>
                <div className="p-8 text-center text-gray-500">Módulo Usuarios - Fase 11</div>
              </ProtectedRoute>
            }
          /> */}
        <Route path="/usuarios" element={<UsuariosList />} />

        </Route>


        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}