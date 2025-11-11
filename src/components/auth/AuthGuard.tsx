import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const AuthGuard = ({ children, allowedRoles = [] }: AuthGuardProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  console.log('🛡️ AuthGuard check:', {
    isAuthenticated,
    user: user ? { id: user.id, role: user.role } : null,
    allowedRoles,
    currentPath: location.pathname
  });

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    // Guardar la ubicación intentada para redirigir después del login
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    console.log('❌ Role not allowed, redirecting to appropriate dashboard');
    // Si el usuario no tiene el rol permitido, redirigir a su dashboard correspondiente
    const dashboardRoutes: Record<string, string> = {
      student: '/student/dashboard',
      organization: '/organization/dashboard',
      admin: '/admin/dashboard'
    };

    const redirectTo = dashboardRoutes[user.role];
    console.log('🔄 Redirecting to:', redirectTo, 'for role:', user.role);
    return <Navigate to={redirectTo} replace />;
  }

  console.log('✅ AuthGuard passed, rendering protected content');
  // Si todo está bien, mostrar el contenido protegido
  return <>{children}</>;
};

export const withAuthGuard = (Component: React.ComponentType, allowedRoles?: string[]) => {
  return function WrappedComponent(props: any) {
    return (
      <AuthGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </AuthGuard>
    );
  };
};
