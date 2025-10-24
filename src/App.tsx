import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import UnifiedLoginPage from "./pages/auth/UnifiedLoginPage";
import RegisterOrganization from "./pages/auth/RegisterOrganization";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import StudentProfilePage from "./pages/dashboard/StudentProfilePage";
import StudentOffersPage from "./pages/dashboard/StudentOffersPage";
import StudentApplicationsPage from "./pages/dashboard/StudentApplicationsPage";
import OrganizationDashboard from "./pages/dashboard/OrganizationDashboard";
import OrganizationProfilePage from "./pages/dashboard/OrganizationProfilePage";
import OrganizationOffersPage from './pages/organization/OrganizationOffersPage';
import OrganizationOfferForm from './pages/organization/OrganizationOfferForm';
import OfferApplicationsPage from './pages/organization/OfferApplicationsPage';
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminOffersManagementPage from "./pages/admin/AdminOffersManagementPage";
import AdminApplicationsPage from "./pages/admin/AdminApplicationsPage";
import CatalogsPage from "./pages/admin/CatalogsPage";
import OrganizationManagementPage from "./pages/admin/OrganizationManagementPage";
import StudentManagement from "./pages/admin/StudentManagement";
import NotFound from "./pages/NotFound";
import RegisterPageStudent from "./pages/auth/RegisterPageStudent";

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
        <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Rutas de autenticación */}
          <Route path="/auth/login" element={<UnifiedLoginPage />} />
          {/* Rutas de registro */}
          <Route path="/auth/register-organization" element={<RegisterOrganization />} />
          <Route path="/auth/register/student" element={<RegisterPageStudent />} />

          {/* Student Routes */}
          <Route path="/student/*" element={
            <AuthGuard allowedRoles={['student']}>
              <DashboardLayout userRole="student">
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="profile" element={<StudentProfilePage />} />
                  <Route path="offers" element={<StudentOffersPage />} />
                  <Route path="applications" element={<StudentApplicationsPage />} />
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
                  <Route path="offers" element={<OrganizationOffersPage />} />
                  <Route path="offers/new" element={<OrganizationOfferForm />} />
                  <Route path="offers/:offerId/edit" element={<OrganizationOfferForm />} />
                  <Route path="offers/:offerId/applications" element={<OfferApplicationsPage />} />
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
                  <Route path="students" element={<StudentManagement />} />
                  <Route path="organizations" element={<OrganizationManagementPage />} />
                  <Route path="offers" element={<AdminOffersManagementPage />} />
                  <Route path="applications" element={<AdminApplicationsPage />} />
                  <Route path="catalogs" element={<CatalogsPage />} />
                  {/* Rutas deshabilitadas hasta implementar funcionalidad */}
                  {/* <Route path="settings" element={<div>Configuración</div>} /> */}
                  {/* <Route path="reports" element={<div>Reportes</div>} /> */}
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </AuthGuard>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;