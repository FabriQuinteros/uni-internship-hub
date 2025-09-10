import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: Array<'student' | 'organization' | 'admin'>;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirigir a login guardando la ubicación actual
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // Redirigir al dashboard correspondiente si el usuario no tiene el rol requerido
    switch (user.role) {
      case 'student':
        return <Navigate to="/dashboard/student" replace />;
      case 'organization':
        return <Navigate to="/dashboard/organization" replace />;
      case 'admin':
        return <Navigate to="/dashboard/admin" replace />;
      default:
        return <Navigate to="/auth/login" replace />;
    }
  }

  return <>{children}</>;
};
