/**
 * AuthProvider - Componente que inicializa y maneja el estado de autenticación global
 */

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { initialize } = useAuth();

  useEffect(() => {
    // Inicializar el sistema de autenticación al montar la aplicación
    initialize();
  }, [initialize]);

  return <>{children}</>;
};