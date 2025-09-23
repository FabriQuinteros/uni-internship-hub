import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import OrganizationDashboard from "./pages/dashboard/OrganizationDashboard";
import OrganizationProfilePage from "./pages/dashboard/OrganizationProfilePage";
import { DashboardLayout } from "./components/layouts/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/student" element={<LoginPage />} />
          <Route path="/auth/organization" element={<LoginPage />} />
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
          
          {/* Organization Routes */}
          <Route 
            path="/dashboard/organization" 
            element={
              <DashboardLayout userRole="organization">
                <OrganizationDashboard />
              </DashboardLayout>
            } 
          />
          <Route 
            path="/dashboard/organization/profile" 
            element={<OrganizationProfilePage />} 
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
