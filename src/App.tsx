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
import OrganizationDashboard from "./pages/dashboard/OrganizationDashboard";
import OrganizationOffersPage from './pages/organization/OrganizationOffersPage';
import OrganizationProfile from './pages/organization/OrganizationProfile';
import OrganizationOfferForm from './pages/organization/OrganizationOfferForm';
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminOfferApprovalPage from "./pages/admin/AdminOfferApprovalPage";
import CatalogsPage from "./pages/admin/CatalogsPage";
import OrganizationManagementPage from "./pages/admin/OrganizationManagementPage";
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
 * /dashboard -> Dashboard principal (requiere autenticación)
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
          {/* Mantener rutas legacy para compatibilidad temporal */}
          <Route path="/auth/student" element={<UnifiedLoginPage />} />
          <Route path="/auth/organization" element={<UnifiedLoginPage />} />
          <Route path="/auth/admin" element={<UnifiedLoginPage />} />
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
                  <Route path="offers" element={<div>Ofertas Disponibles</div>} />
                  <Route path="applications" element={<div>Mis Postulaciones</div>} />
                  <Route path="favorites" element={<div>Favoritos</div>} />
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
                  <Route path="profile" element={<OrganizationProfile />} />
                  <Route path="offers" element={<OrganizationOffersPage />} />
                  <Route path="offers/new" element={<OrganizationOfferForm />} />
                  <Route path="offers/:offerId/edit" element={<OrganizationOfferForm />} />
                  <Route path="applications" element={<div>Postulaciones Recibidas</div>} />
                  <Route path="analytics" element={<div>Estadísticas</div>} />
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
                  <Route path="organizations" element={<OrganizationManagementPage />} />
                  <Route path="approval" element={<AdminOfferApprovalPage />} />
                  <Route path="catalogs" element={<CatalogsPage />} />
                  <Route path="settings" element={<div>Configuración</div>} />
                  <Route path="reports" element={<div>Reportes</div>} />
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
