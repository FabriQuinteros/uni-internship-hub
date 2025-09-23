import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterOrganization from "./pages/auth/RegisterOrganization";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import OrganizationDashboard from "./pages/dashboard/OrganizationDashboard";
import OrganizationProfilePage from "./pages/dashboard/OrganizationProfilePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import CatalogsPage from "./pages/admin/CatalogsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * Componente principal de la aplicación
 * 
 * Estructura de rutas:
 * / -> Landing Page
 * /auth/login -> Login general
 * /auth/student -> Login específico de estudiantes
 * /auth/organization -> Login específico de organizaciones
 * /auth/register-organization -> Registro de nuevas organizaciones
 * /auth/admin -> Login de administradores
 * /student/* -> Rutas protegidas de estudiantes
 * /organization/* -> Rutas protegidas de organizaciones
 * /admin/* -> Rutas protegidas de administradores
 * 
 * Configuración global:
 * - React Query para manejo de estado del servidor
 * - Sistema de notificaciones (Toaster y Sonner)
 * - Tooltips y otros providers UI
 * - React Router para navegación SPA
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Rutas de autenticación */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/student" element={<LoginPage />} />
          <Route path="/auth/organization" element={<LoginPage />} />
          <Route path="/auth/admin" element={<LoginPage />} />
          {/* Ruta para el registro de nuevas organizaciones
              Esta ruta maneja el flujo de registro completo incluyendo:
              - Formulario con validaciones
              - Redirección post-registro
              - Mensajes de confirmación */}
          <Route path="/auth/register-organization" element={<RegisterOrganization />} />
          
          {/* Student Routes */}
          <Route path="/student/*" element={
            <AuthGuard allowedRoles={['student']}>
              <DashboardLayout userRole="student">
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="profile" element={<div>Perfil de Estudiante</div>} />
                  <Route path="offers" element={<div>Ofertas Disponibles</div>} />
                  <Route path="applications" element={<div>Mis Postulaciones</div>} />
                  <Route path="favorites" element={<div>Favoritos</div>} />
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </AuthGuard>
          } />

          {/* Organization Routes */}
          <Route path="/organization/*" element={
            <AuthGuard allowedRoles={['organization']}>
              <DashboardLayout userRole="organization">
                <Routes>
                  <Route path="dashboard" element={<OrganizationDashboard />} />
                  <Route path="profile" element={<OrganizationProfilePage />} />
                  <Route path="offers" element={<div>Gestión de Ofertas</div>} />
                  <Route path="applications" element={<div>Postulaciones Recibidas</div>} />
                  <Route path="analytics" element={<div>Estadísticas</div>} />
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </AuthGuard>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <AuthGuard allowedRoles={['admin']}>
              <DashboardLayout userRole="admin">
                <Routes>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="users" element={<div>Gestión de Usuarios</div>} />
                  <Route path="approval" element={<div>Aprobación de Ofertas</div>} />
                  <Route path="catalogs" element={<CatalogsPage />} />
                  <Route path="settings" element={<div>Configuración</div>} />
                  <Route path="reports" element={<div>Reportes</div>} />
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </AuthGuard>
          } />
          
          {/* Catch-all route - DEBE IR AL FINAL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;