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

  if (!isAuthenticated) {
    // Guardar la ubicación intentada para redirigir después del login
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Si el usuario no tiene el rol permitido, redirigir a su dashboard correspondiente
    const dashboardRoutes: Record<string, string> = {
      student: '/student/dashboard',
      organization: '/organization/dashboard',
      admin: '/admin/dashboard'
    };

    return <Navigate to={dashboardRoutes[user.role]} replace />;
  }

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
