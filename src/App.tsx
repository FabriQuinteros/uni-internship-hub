import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterOrganization from "./pages/auth/RegisterOrganization";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import { DashboardLayout } from "./components/layouts/DashboardLayout";
import NotFound from "./pages/NotFound";
import CatalogsPage from "./pages/admin/CatalogsPage";

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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Rutas de autenticación */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/student" element={<LoginPage />} />
          <Route path="/auth/organization" element={<LoginPage />} />
          {/* Ruta para el registro de nuevas organizaciones
              Esta ruta maneja el flujo de registro completo incluyendo:
              - Formulario con validaciones
              - Redirección post-registro
              - Mensajes de confirmación */}
          <Route path="/auth/register-organization" element={<RegisterOrganization />} />
          <Route path="/auth/admin" element={<LoginPage />} />
          
          {/* Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <DashboardLayout userRole="student">
                <StudentDashboard />
              </DashboardLayout>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/catalogs" 
            element={
              <DashboardLayout userRole="admin">
                <CatalogsPage />
              </DashboardLayout>
            } 
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
