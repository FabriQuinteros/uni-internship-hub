import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';
import { authService } from '@/services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Intentar login real contra backend
        try {
          const resp = await authService.login(email, password);
          const token = resp.token;
          // Guardar token en localStorage para que el apiClient lo use
          localStorage.setItem('authToken', token);

          // Decodificar token para obtener role/id
          const payload = decodeJwt(token);
          const role = payload?.role || 'organization';
          const id = payload?.id ? String(payload.id) : undefined;

          const user: User = {
            id,
            email,
            role: role,
            name: payload?.name || undefined,
          };

          set({ user, isAuthenticated: true });
          return;
        } catch (err) {
          // Fallback: mock local (permitir pruebas rápidas)
          const mockUsers: Record<string, User> = {
            'estudiante@universidad.edu': {
              id: '1',
              email: 'estudiante@universidad.edu',
              role: 'student',
              first_name: 'María',
              last_name: 'González'
            },
            'empresa@org.com': {
              id: '2',
              email: 'empresa@org.com',
              role: 'organization',
              name: 'Tech Solutions Inc.'
            },
            'admin@uni.edu': {
              id: '3',
              email: 'admin@uni.edu',
              role: 'admin',
              name: 'Admin'
            }
          };

          // Simular delay de red
          await new Promise(resolve => setTimeout(resolve, 500));

          const user = mockUsers[email];
          if (!user) {
            throw new Error('Usuario no encontrado');
          }

          set({ user, isAuthenticated: true });
        }
      },
      logout: () => {
        localStorage.removeItem('authToken');
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
