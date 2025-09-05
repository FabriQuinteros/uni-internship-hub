import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'student' | 'organization' | 'admin';
  name: string;
  imageUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Aquí irá la llamada real a tu API
        // Por ahora simulamos una autenticación basada en el email
        const mockUsers: Record<string, User> = {
          'estudiante@universidad.edu': {
            id: '1',
            email: 'estudiante@universidad.edu',
            role: 'student',
            name: 'María González'
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
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user = mockUsers[email];
        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        set({ user, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
