import { create } from 'zustand';
import { technologyService, TechnologyResponse } from '../services/catalogService';
import { CatalogItem, ApiCatalogType, CatalogType, Technology, Skill } from '../types/catalog';

// Estado de loading
interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Store unificado para catálogo de tecnologías y habilidades
interface CatalogStore {
  // Estado
  items: CatalogItem[];
  selectedCatalogType: ApiCatalogType;
  loadingState: LoadingState;
  
  // Acciones
  setSelectedCatalogType: (type: ApiCatalogType) => void;
  
  // Operaciones CRUD con API
  loadItems: () => Promise<void>;
  createItem: (name: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  
  // Helpers
  getFilteredItems: () => CatalogItem[];
  getItems: (type: CatalogType) => CatalogItem[];
  updateItem: (id: string, data: { name: string }) => Promise<void>;
  updateItemStatus: (item: CatalogItem, newStatus: 'active' | 'inactive') => Promise<void>;

  clearError: () => void;
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  // Estado inicial
  items: [],
  selectedCatalogType: 'technology',
  loadingState: {
    isLoading: false,
    error: null,
  },

  // Cambiar tipo de catálogo activo
  setSelectedCatalogType: (type: ApiCatalogType) => {
    set({ selectedCatalogType: type });
  },

  // Cargar elementos desde la API
  loadItems: async () => {
    set(state => ({
      loadingState: { ...state.loadingState, isLoading: true, error: null }
    }));

    try {
      const apiResponse = await technologyService.list();
      console.log("Respuesta de la API recibida en el store:", apiResponse);
      
      // Mapeamos la respuesta simple de la API a nuestros tipos de UI ricos.
      const items: CatalogItem[] = apiResponse.map(apiItem => {
        const itemType = apiItem.category; 

        const baseItem = {
          id: apiItem.id.toString(), // El ID viene de la API.
          name: apiItem.name,
          status: apiItem.is_active ? 'active' : 'inactive', 
          createdAt: new Date(), // Asumimos que la API no devuelve esto.
          updatedAt: new Date(),
        };
  
        if (itemType === 'technology') {
          const tech: Technology = {
            ...baseItem,
            type: 'technology',
          };
          return tech;
        } else { // (itemType === 'skill')
          const skill: Skill = {
            ...baseItem,
            type: 'skill',
          };
          return skill;
        }
      });

      set({
        items,
        loadingState: { isLoading: false, error: null }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar elementos';
      set(state => ({
        loadingState: { ...state.loadingState, isLoading: false, error: errorMessage }
      }));
    }
  },

  // Crear nuevo elemento
  createItem: async (name: string) => {
    const { selectedCatalogType } = get();
    
    set(state => ({
      loadingState: { ...state.loadingState, isLoading: true, error: null }
    }));

    try {
      const response = await technologyService.create({
        name: name.trim(),
        category: selectedCatalogType,
      });

      let newItem: CatalogItem;

      if (response.category === 'technology') {
        newItem = {
          type: 'technology', // ¡Añadimos el discriminador!
          id: response.id.toString(),
          name: response.name,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          // No añadimos 'description' porque es opcional en el tipo Technology
        };
      } else { // (response.category === 'skill')
        newItem = {
          type: 'skill', // ¡Añadimos el discriminador!
          id: response.id.toString(),
          name: response.name,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          // No añadimos 'description' porque es opcional en el tipo Skill
        };
      }

      set(state => ({
        items: [...state.items, newItem],
        loadingState: { isLoading: false, error: null }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear elemento';
      set(state => ({
        loadingState: { ...state.loadingState, isLoading: false, error: errorMessage }
      }));
      throw error; // Re-throw para que el componente pueda manejarlo
    }
  },

  // Actualizar elemento existente (solo para API)
  updateItem: async (id: string, data: { name: string }) => {
    set(state => ({
      loadingState: { ...state.loadingState, isLoading: true, error: null }
  }));

  try {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) throw new Error("ID inválido");

      // Llamamos al servicio con el payload correcto
      // `data` es el objeto que viene del formulario, ej: { name: 'Nuevo Nombre' }
      const updatedItemFromApi = await technologyService.update(numericId, data);

      // Actualizamos el estado local de forma segura
      set(state => ({
          items: state.items.map(item => {
              // Buscamos el item por su ID
              if (item.id === id) {
                  // Fusionamos el item existente con los datos recibidos del formulario
                  // para asegurarnos de no perder ninguna propiedad.
                  return {
                      ...item, // Mantiene `id`, `type`, `status`, `createdAt`, etc.
                      ...data, // Sobreescribe las propiedades editadas, como `name`.
                      updatedAt: new Date()
                  };
              }
              return item;
          }),
          loadingState: { isLoading: false, error: null }
      }));
  } catch (error) {
      console.error("Error al actualizar el item:", error);
      set(state => ({
          loadingState: { ...state.loadingState, isLoading: false, error: 'Error al actualizar' }
      }));
      throw error;
  }
},
  // Eliminar elemento
  deleteItem: async (id: string) => {
    const { items } = get();
    
    set(state => ({
      loadingState: { ...state.loadingState, isLoading: true, error: null }
    }));

    try {
      await technologyService.delete({
        id: parseInt(id),
      });

      // Remover del estado local
      const filteredItems = items.filter(item => item.id !== id);

      set({
        items: filteredItems,
        loadingState: { isLoading: false, error: null }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar elemento';
      set(state => ({
        loadingState: { ...state.loadingState, isLoading: false, error: errorMessage }
      }));
      throw error;
    }
  },

  // Obtener elementos filtrados por categoría activa
  getFilteredItems: () => {
    const { items, selectedCatalogType } = get();
    return items.filter(item => item.type === selectedCatalogType);
  },

  // Para compatibilidad con componentes existentes
  getItems: (type: CatalogType) => {
    const { items } = get();
    return items.filter(item => item.type === type);
  },

  updateItemStatus: async (itemToUpdate: CatalogItem, newStatus: 'active' | 'inactive') => {
    // La consola de depuración sigue siendo útil aquí
    console.log(`[store.updateItemStatus] Acción invocada para ID: ${itemToUpdate.id}, nuevo estado: ${newStatus}`);

    try {
      const numericId = parseInt(itemToUpdate.id, 10);
      if (isNaN(numericId)) {
          throw new Error(`ID inválido: "${itemToUpdate.id}" no es un número.`);
      }
        const payload = {
            is_active: newStatus === 'active',
        };
        
        // Llamamos a la API. No necesitamos guardar la respuesta si solo actualizamos el estado.
        // `technologyService.update` se encarga de llamar al endpoint PUT correcto.
        await technologyService.update(numericId, payload);

        // --- ¡AQUÍ ESTÁ EL ARREGLO! ---
        // Actualizamos el estado local de una forma mucho más segura.
        set(state => ({
          items: state.items.map(item =>
              item.id === itemToUpdate.id
                  ? { ...item, status: newStatus, updatedAt: new Date() }
                  : item
          )
      }));
    } catch (error) {
        console.error("[store.updateItemStatus] Error:", error);
        throw error;
    }
},

  // Limpiar errores
  clearError: () => {
    set(state => ({
      loadingState: { ...state.loadingState, error: null }
    }));
  },
}));
