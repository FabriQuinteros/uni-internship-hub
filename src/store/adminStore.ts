import { create } from 'zustand';

interface AdminStore {
  totalUsers: number;
  totalCatalogs: number;
  setTotalUsers: (count: number) => void;
  setTotalCatalogs: (count: number) => void;
  fetchDashboardData: () => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set) => ({
  totalUsers: 0,
  totalCatalogs: 0,

  setTotalUsers: (count: number) => set({ totalUsers: count }),
  setTotalCatalogs: (count: number) => set({ totalCatalogs: count }),

  fetchDashboardData: async () => {
    try {
      // Aquí puedes agregar la lógica para obtener los datos reales de tu API
      // Por ahora usaremos datos de ejemplo
      const mockApiCall = () => 
        new Promise<{ users: number; catalogs: number }>((resolve) => {
          setTimeout(() => {
            resolve({ users: 150, catalogs: 25 });
          }, 1000);
        });

      const data = await mockApiCall();
      
      set({
        totalUsers: data.users,
        totalCatalogs: data.catalogs,
      });
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
    }
  },
}));
