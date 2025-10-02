import { create } from 'zustand';
import { 
  Organization, 
  OrganizationFilters, 
  PaginationParams, 
  PaginatedResponse,
  OrganizationStatus,
  StatusChangeRequest,
  OrganizationObservation
} from '../types/user';
import { 
  getOrganizations, 
  changeOrganizationStatus, 
  getOrganizationObservations,
  addOrganizationObservation,
  getOrganizationDetails,
  getOrganizationsStats
} from '../services/api';

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
  observations: OrganizationObservation[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };

  // Acciones para gestión de lista
  setFilters: (filters: OrganizationFilters) => void;
  setPagination: (pagination: Partial<PaginationParams>) => void;
  fetchOrganizations: () => Promise<void>;
  clearError: () => void;

  // Acciones para gestión de organización individual
  selectOrganization: (organization: Organization) => void;
  clearSelection: () => void;
  updateOrganizationStatus: (request: StatusChangeRequest) => Promise<void>;
  
  // Acciones para observaciones
  fetchObservations: (organizationId: string) => Promise<void>;
  addObservation: (organizationId: string, observation: string, adminId: string) => Promise<void>;
  
  // Acciones para estadísticas
  fetchStats: () => Promise<void>;
  
  // Utilidades
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
  observations: [],
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
      const { filters, pagination } = get();
      const response: PaginatedResponse<Organization> = await getOrganizations(filters, pagination);
      
      set({
        organizations: response.data,
        totalPages: response.totalPages,
        totalOrganizations: response.total,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar las organizaciones',
        loading: false,
      });
    }
  },

  // Gestión de organización seleccionada
  selectOrganization: (organization: Organization) => {
    set({ selectedOrganization: organization });
    get().fetchObservations(organization.id);
  },

  clearSelection: () => {
    set({ selectedOrganization: null, observations: [] });
  },

  // Cambiar estado de organización
  updateOrganizationStatus: async (request: StatusChangeRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedOrganization = await changeOrganizationStatus(request);
      
      // Actualizar la organización en la lista
      const organizations = get().organizations.map(org =>
        org.id === request.organizationId ? updatedOrganization : org
      );
      
      // Actualizar organización seleccionada si es la misma
      const selectedOrganization = get().selectedOrganization?.id === request.organizationId
        ? updatedOrganization
        : get().selectedOrganization;

      set({
        organizations,
        selectedOrganization,
        loading: false,
      });

      // Refrescar observaciones si hay una organización seleccionada
      if (selectedOrganization) {
        get().fetchObservations(selectedOrganization.id);
      }

      // Refrescar estadísticas
      get().fetchStats();
    } catch (error: any) {
      set({
        error: error.message || 'Error al cambiar el estado de la organización',
        loading: false,
      });
    }
  },

  // Gestión de observaciones
  fetchObservations: async (organizationId: string) => {
    try {
      const observations = await getOrganizationObservations(organizationId);
      set({ observations });
    } catch (error: any) {
      console.error('Error al cargar observaciones:', error);
    }
  },

  addObservation: async (organizationId: string, observation: string, adminId: string) => {
    try {
      const newObservation = await addOrganizationObservation(organizationId, observation, adminId);
      const observations = [newObservation, ...get().observations];
      set({ observations });
    } catch (error: any) {
      set({ error: error.message || 'Error al agregar observación' });
    }
  },

  // Estadísticas
  fetchStats: async () => {
    try {
      const stats = await getOrganizationsStats();
      set({ stats });
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
    }
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
      observations: [],
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