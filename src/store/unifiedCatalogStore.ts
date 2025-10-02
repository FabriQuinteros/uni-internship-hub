import { create } from 'zustand';
import { catalogService } from '@/services/catalogService';
import { processError } from '@/utils/errorTranslator';
import { 
  CatalogType, 
  CatalogItem, 
  CreateCatalogRequest, 
  UpdateCatalogRequest 
} from '@/types/catalog';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  loadingType?: CatalogType;
}

interface CatalogStoreState {
  // Data storage - organized by catalog type
  catalogs: Record<CatalogType, CatalogItem[]>;
  
  // UI state
  selectedCatalogType: CatalogType;
  loadingState: LoadingState;
  
  // Actions
  setSelectedCatalogType: (type: CatalogType) => void;
  
  // CRUD operations
  loadCatalog: (type: CatalogType) => Promise<void>;
  loadAllCatalogs: () => Promise<void>;
  createItem: (type: CatalogType, data: CreateCatalogRequest) => Promise<void>;
  updateItem: (type: CatalogType, id: number, data: UpdateCatalogRequest) => Promise<void>;
  deleteItem: (type: CatalogType, id: number) => Promise<void>;
  toggleItemStatus: (type: CatalogType, id: number, isActive: boolean) => Promise<void>;
  
  // Getters
  getItems: (type: CatalogType) => CatalogItem[];
  getActiveItems: (type: CatalogType) => CatalogItem[];
  getItemById: (type: CatalogType, id: number) => CatalogItem | undefined;
  
  // Utility
  clearError: () => void;
  resetCatalog: (type: CatalogType) => void;
}

const initialCatalogs: Record<CatalogType, CatalogItem[]> = {
  technologies: [],
  positions: [],
  durations: [],
  locations: [],
  modalities: [],
};

export const useCatalogStore = create<CatalogStoreState>((set, get) => ({
  // Initial state
  catalogs: initialCatalogs,
  selectedCatalogType: 'technologies',
  loadingState: {
    isLoading: false,
    error: null,
  },

  // Set selected catalog type
  setSelectedCatalogType: (type: CatalogType) => {
    set({ selectedCatalogType: type });
    
    // Auto-load if catalog is empty
    const items = get().catalogs[type];
    if (items.length === 0) {
      get().loadCatalog(type).catch(console.error);
    }
  },

  // Load specific catalog
  loadCatalog: async (type: CatalogType) => {
    set(state => ({
      loadingState: { 
        isLoading: true, 
        error: null, 
        loadingType: type 
      }
    }));

    try {
      const items = await catalogService.list<CatalogItem>(type);
      
      set(state => ({
        catalogs: {
          ...state.catalogs,
          [type]: Array.isArray(items) ? items : [],
        },
        loadingState: { isLoading: false, error: null }
      }));
    } catch (error) {
      const errorMessage = processError(error, type);
      set(state => ({
        loadingState: { 
          ...state.loadingState, 
          isLoading: false, 
          error: errorMessage 
        }
      }));
      throw new Error(errorMessage);
    }
  },

  // Load all catalogs
  loadAllCatalogs: async () => {
    set(state => ({
      loadingState: { isLoading: true, error: null }
    }));

    try {
      const catalogTypes: CatalogType[] = ['technologies', 'positions', 'durations', 'locations', 'modalities'];
      const promises = catalogTypes.map(type => catalogService.list<CatalogItem>(type));
      const results = await Promise.all(promises);
      
      const newCatalogs = catalogTypes.reduce((acc, type, index) => ({
        ...acc,
        [type]: Array.isArray(results[index]) ? results[index] : [],
      }), {} as Record<CatalogType, CatalogItem[]>);

      set({
        catalogs: newCatalogs,
        loadingState: { isLoading: false, error: null }
      });
    } catch (error) {
      const errorMessage = processError(error);
      set(state => ({
        loadingState: { 
          ...state.loadingState, 
          isLoading: false, 
          error: errorMessage 
        }
      }));
      throw new Error(errorMessage);
    }
  },

  // Create new item
  createItem: async (type: CatalogType, data: CreateCatalogRequest) => {
    set(state => ({
      loadingState: { isLoading: true, error: null, loadingType: type }
    }));

    try {
      const newItem = await catalogService.create<CatalogItem>(type, data);
      
      // Refrescar la lista completa después de crear para asegurar consistencia
      await get().loadCatalog(type);
      
    } catch (error) {
      const errorMessage = processError(error, type);
      set(state => ({
        loadingState: { 
          ...state.loadingState, 
          isLoading: false, 
          error: errorMessage 
        }
      }));
      throw new Error(errorMessage);
    }
  },

  // Update existing item
  updateItem: async (type: CatalogType, id: number, data: UpdateCatalogRequest) => {
    set(state => ({
      loadingState: { isLoading: true, error: null, loadingType: type }
    }));

    try {
      await catalogService.update<CatalogItem>(type, id, data);
      
      // Refrescar la lista completa después de actualizar para asegurar consistencia
      await get().loadCatalog(type);
      
    } catch (error) {
      const errorMessage = processError(error, type);
      set(state => ({
        loadingState: { 
          ...state.loadingState, 
          isLoading: false, 
          error: errorMessage 
        }
      }));
      throw new Error(errorMessage);
    }
  },

  // Delete item (soft delete)
  deleteItem: async (type: CatalogType, id: number) => {
    set(state => ({
      loadingState: { isLoading: true, error: null, loadingType: type }
    }));

    try {
      await catalogService.delete(type, id);
      
      // Refrescar la lista completa después de eliminar para asegurar consistencia
      await get().loadCatalog(type);
      
    } catch (error) {
      const errorMessage = processError(error, type);
      set(state => ({
        loadingState: { 
          ...state.loadingState, 
          isLoading: false, 
          error: errorMessage 
        }
      }));
      throw new Error(errorMessage);
    }
  },

  // Toggle item active status
  toggleItemStatus: async (type: CatalogType, id: number, isActive: boolean) => {
    set(state => ({
      loadingState: { isLoading: true, error: null, loadingType: type }
    }));

    try {
      await catalogService.update<CatalogItem>(type, id, { is_active: isActive });
      
      // Refrescar la lista completa después de cambiar estado para asegurar consistencia
      await get().loadCatalog(type);
      
    } catch (error) {
      const errorMessage = processError(error, type);
      set(state => ({
        loadingState: { 
          ...state.loadingState, 
          isLoading: false, 
          error: errorMessage 
        }
      }));
      throw new Error(errorMessage);
    }
  },

  // Get items for a specific catalog type
  getItems: (type: CatalogType) => {
    const catalogs = get().catalogs;
    if (!catalogs || !catalogs[type]) {
      return [];
    }
    return Array.isArray(catalogs[type]) ? catalogs[type] : [];
  },

  // Get only active items for a specific catalog type
  getActiveItems: (type: CatalogType) => {
    const items = get().catalogs[type] || [];
    return items.filter(item => item.is_active);
  },

  // Get specific item by ID
  getItemById: (type: CatalogType, id: number) => {
    const items = get().catalogs[type] || [];
    return items.find(item => item.id === id);
  },

  // Clear error state
  clearError: () => {
    set(state => ({
      loadingState: { ...state.loadingState, error: null }
    }));
  },

  // Reset specific catalog
  resetCatalog: (type: CatalogType) => {
    set(state => ({
      catalogs: {
        ...state.catalogs,
        [type]: [],
      }
    }));
  },
}));