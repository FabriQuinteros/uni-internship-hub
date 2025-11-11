import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type AuthUser, type LoginResult } from '@/services/authService';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
  initialize: () => void;
}

// Helper simple para decodificar payload de JWT (sin verificar) — solo para extraer role/id en cliente
function decodeJwt(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string): Promise<LoginResult> => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await authService.login(email, password);
          
          if (result.success && result.user) {
            set({ 
              user: result.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: result.error || 'Error en el login' 
            });
          }
          
          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'Error de conexión';
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: errorMessage 
          });
          
          return {
            success: false,
            error: errorMessage
          };
        }
      },
      
      logout: async () => {
        // Limpiar el estado INMEDIATAMENTE para redirigir sin delay
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
        
        // Intentar llamar al endpoint de logout en segundo plano
        try {
          await authService.logout();
        } catch (error) {
          console.error('Error durante logout:', error);
        }
      },
      
      checkAuth: () => {
        try {
          const isAuthenticated = authService.isAuthenticated();
          const user = authService.getCurrentUser();
          
          if (isAuthenticated && user) {
            set({ user, isAuthenticated: true, error: null });
          } else {
            set({ user: null, isAuthenticated: false, error: null });
          }
        } catch (error) {
          console.error('Error verificando autenticación:', error);
          set({ user: null, isAuthenticated: false, error: null });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      initialize: () => {
        // Verificar autenticación al inicializar
        const { checkAuth } = get();
        checkAuth();
        
        // Verificar periódicamente el estado del token
        const checkInterval = setInterval(() => {
          if (!authService.isAuthenticated()) {
            const { user, isAuthenticated } = get();
            if (user || isAuthenticated) {
              // El token expiró, limpiar estado
              set({ user: null, isAuthenticated: false, error: null });
            }
          }
        }, 60000); // Verificar cada minuto
        
        // Limpiar intervalo cuando sea necesario (esto se puede mejorar con cleanup)
        if (typeof window !== 'undefined') {
          window.addEventListener('beforeunload', () => {
            clearInterval(checkInterval);
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      // Solo persistir datos básicos, no funciones
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      // Función que se ejecuta cuando se carga el estado persistido
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Verificar que la autenticación persistida siga siendo válida
          state.initialize();
        }
      },
    }
  )
);
