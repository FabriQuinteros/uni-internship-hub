import React, { useState, useEffect } from 'react';

export interface AdminPermissions {
  canManageOrganizations: boolean;
  canManageUsers: boolean;
  canApproveOffers: boolean;
  canAccessReports: boolean;
  canManageSystem: boolean;
}

export interface UseAdminPermissionsReturn {
  permissions: AdminPermissions;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  checkPermissions: () => Promise<void>;
}

/**
 * Hook para manejar permisos de administrador
 * @param userId - ID del usuario actual
 * @returns Objeto con permisos y funciones de validación
 */
export const useAdminPermissions = (userId: string | null): UseAdminPermissionsReturn => {
  const [permissions, setPermissions] = useState<AdminPermissions>({
    canManageOrganizations: false,
    canManageUsers: false,
    canApproveOffers: false,
    canAccessReports: false,
    canManageSystem: false,
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Valida los permisos del usuario actual
   */
  const checkPermissions = async () => {
    if (!userId) {
      setIsAdmin(false);
      setPermissions({
        canManageOrganizations: false,
        canManageUsers: false,
        canApproveOffers: false,
        canAccessReports: false,
        canManageSystem: false,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implementar validación real cuando el backend esté listo
      // Por ahora, asumir permisos de admin para desarrollo
      const adminStatus = true; // Cambiar según lógica de autenticación real
      setIsAdmin(adminStatus);

      if (adminStatus) {
        setPermissions({
          canManageOrganizations: true,
          canManageUsers: true,
          canApproveOffers: true,
          canAccessReports: true,
          canManageSystem: true,
        });
      } else {
        setPermissions({
          canManageOrganizations: false,
          canManageUsers: false,
          canApproveOffers: false,
          canAccessReports: false,
          canManageSystem: false,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al validar permisos');
      setIsAdmin(false);
      setPermissions({
        canManageOrganizations: false,
        canManageUsers: false,
        canApproveOffers: false,
        canAccessReports: false,
        canManageSystem: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // Validar permisos cuando cambie el userId
  useEffect(() => {
    checkPermissions();
  }, [userId]);

  return {
    permissions,
    isAdmin,
    loading,
    error,
    checkPermissions,
  };
};

/**
 * Hook para validar un permiso específico
 * @param userId - ID del usuario actual
 * @param permission - Permiso específico a validar
 * @returns Booleano indicando si el usuario tiene el permiso
 */
export const useHasPermission = (
  userId: string | null, 
  permission: keyof AdminPermissions
): boolean => {
  const { permissions } = useAdminPermissions(userId);
  return permissions[permission];
};

/**
 * HOC para proteger componentes que requieren permisos de administrador
 * @param WrappedComponent - Componente a proteger
 * @param requiredPermission - Permiso requerido (opcional, por defecto valida isAdmin)
 * @returns Componente protegido
 */
export function withAdminPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission?: keyof AdminPermissions
) {
  return function ProtectedComponent(props: P) {
    // TODO: Obtener userId del contexto de autenticación
    const userId = 'current-user-id'; // Placeholder
    const { permissions, isAdmin, loading, error } = useAdminPermissions(userId);

    // TEMPORAL: Para desarrollo, permitir acceso sin validación real
    const isDevelopment = true; // Cambiar a false en producción
    
    if (isDevelopment) {
      return <WrappedComponent {...props} />;
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Validando permisos...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <p className="text-destructive mb-2">Error al validar permisos</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      );
    }

    // Validar permiso específico o administrador general
    const hasPermission = requiredPermission 
      ? permissions[requiredPermission] 
      : isAdmin;

    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground">
              No tienes permisos para acceder a esta sección.
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Componente para mostrar contenido condicionalmente basado en permisos
 */
export interface PermissionGateProps {
  userId: string | null;
  permission?: keyof AdminPermissions;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  userId,
  permission,
  fallback = null,
  children,
}) => {
  const { permissions, isAdmin, loading } = useAdminPermissions(userId);

  if (loading) {
    return <div className="animate-pulse">Cargando...</div>;
  }

  const hasPermission = permission 
    ? permissions[permission] 
    : isAdmin;

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};