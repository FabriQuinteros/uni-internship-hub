import { create } from 'zustand';
import { 
  OrganizationListItem as Organization, 
  OrganizationFilters, 
  PaginationParams, 
  ListOrganizationsResponse,
  OrganizationStatus,
  StatusChangeRequest,
  OrganizationStats
} from '../types/user';
import { 
  getOrganizations, 
  changeOrganizationStatus,
  getOrganizationsStats
} from '../services/organizationService';

interface OrganizationStore {
  // Estado
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  filters: OrganizationFilters;
  pagination: PaginationParams;
  totalPages: number;
  totalOrganizations: number;
  selectedOrganization: Organization | null;
  stats: OrganizationStats;

  // Acciones para gestión de lista
  setFilters: (filters: OrganizationFilters) => void;
  setPagination: (pagination: Partial<PaginationParams>) => void;
  fetchOrganizations: () => Promise<void>;
  clearError: () => void;

  // Acciones para gestión de organización individual
  selectOrganization: (organization: Organization) => void;
  clearSelection: () => void;
  updateOrganizationStatus: (request: StatusChangeRequest) => Promise<void>;
  
  // Acciones para observaciones (futuras implementaciones)
  // fetchObservations: (organizationId: string) => Promise<void>;
  // addObservation: (organizationId: string, observation: string, adminId: string) => Promise<void>;
  
  // Acciones para estadísticas
  fetchStats: () => Promise<void>;
  
  // Utilidades
  updateStatsOptimistically: (newStatus: OrganizationStatus) => void;
  refreshCurrentPage: () => Promise<void>;
  resetStore: () => void;
}

export const useOrganizationStore = create<OrganizationStore>((set, get) => ({
  // Estado inicial
  organizations: [],
  loading: false,
  error: null,
  filters: {},
  pagination: { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
  totalPages: 0,
  totalOrganizations: 0,
  selectedOrganization: null,
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  },

  // Setters básicos
  setFilters: (filters: OrganizationFilters) => {
    set({ filters, pagination: { ...get().pagination, page: 1 } });
    get().fetchOrganizations();
  },

  setPagination: (pagination: Partial<PaginationParams>) => {
    set({ pagination: { ...get().pagination, ...pagination } });
    get().fetchOrganizations();
  },

  clearError: () => set({ error: null }),

  // Fetch organizaciones con filtros y paginación
  fetchOrganizations: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const response: ListOrganizationsResponse = await getOrganizations(filters);
      
      console.log('🔍 Response en store:', response); // Debug temporal
      
      set({
        organizations: response.data,
        totalPages: response.totalPages,
        totalOrganizations: response.total,
        loading: false,
      });
    } catch (error: any) {
      set({
        organizations: [], // Asegurar que siempre sea un array vacío en caso de error
        error: error.message || 'Error al cargar las organizaciones',
        loading: false,
      });
    }
  },

  // Gestión de organización seleccionada
  selectOrganization: (organization: Organization) => {
    set({ selectedOrganization: organization });
  },

  clearSelection: () => {
    set({ selectedOrganization: null });
  },

  // Cambiar estado de organización con actualización optimista
  updateOrganizationStatus: async (request: StatusChangeRequest) => {
    const currentState = get();
    
    // Actualización optimista
    const optimisticOrganizations = currentState.organizations.map(org => {
      if (org.id === request.organizationId) {
        return {
          ...org,
          status: request.newStatus,
          lastStatusChange: new Date().toISOString()
        };
      }
      return org;
    });

    const optimisticSelectedOrg = currentState.selectedOrganization?.id === request.organizationId
      ? { ...currentState.selectedOrganization, status: request.newStatus }
      : currentState.selectedOrganization;

    // Aplicar actualización optimista
    set({
      organizations: optimisticOrganizations,
      selectedOrganization: optimisticSelectedOrg,
      loading: false
    });

    try {
      // Llamada real al API
      const updatedOrganization = await changeOrganizationStatus(request);
      
      // Actualizar con datos reales del servidor
      const organizations = get().organizations.map(org =>
        org.id === request.organizationId ? updatedOrganization : org
      );
      
      const selectedOrganization = get().selectedOrganization?.id === request.organizationId
        ? updatedOrganization
        : get().selectedOrganization;

      set({
        organizations,
        selectedOrganization,
        error: null
      });

      // Actualizar estadísticas de forma optimista
      get().updateStatsOptimistically(request.newStatus);
      
    } catch (error: any) {
      // Revertir actualización optimista en caso de error
      set({
        organizations: currentState.organizations,
        selectedOrganization: currentState.selectedOrganization,
        error: error.message || 'Error al cambiar el estado de la organización'
      });
    }
  },

  // Estadísticas
  fetchStats: async () => {
    try {
      const response = await getOrganizationsStats();
      set({ stats: response.data });
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
    }
  },

  // Actualización optimista de estadísticas
  updateStatsOptimistically: (newStatus: OrganizationStatus) => {
    const currentStats = get().stats;
    const updatedStats = { ...currentStats };
    
    // Incrementar el contador del nuevo estado
    switch (newStatus) {
      case OrganizationStatus.PENDING:
        updatedStats.pending += 1;
        break;
      case OrganizationStatus.ACTIVE:
        updatedStats.approved += 1;
        break;
      case OrganizationStatus.REJECTED:
        updatedStats.rejected += 1;
        break;
      case OrganizationStatus.SUSPENDED:
        updatedStats.suspended += 1;
        break;
    }
    
    set({ stats: updatedStats });
  },

  // Utilidades
  refreshCurrentPage: async () => {
    await get().fetchOrganizations();
  },

  resetStore: () => {
    set({
      organizations: [],
      loading: false,
      error: null,
      filters: {},
      pagination: { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
      totalPages: 0,
      totalOrganizations: 0,
      selectedOrganization: null,
      stats: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0,
      },
    });
  },
}));