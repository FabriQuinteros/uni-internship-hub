import { apiClient } from '@/lib/api/apiClient';
import { API_CONFIG } from '@/config/api.config';
import { processError } from '@/utils/errorTranslator';
import { 
  CatalogType, 
  CatalogItem, 
  Technology,
  Position,
  Duration,
  Location,
  Modality,
  ApiListResponse,
  ApiSingleResponse,
  CreateCatalogRequest,
  UpdateCatalogRequest,
  ApiErrorResponse
} from '@/types/catalog';

// Endpoint mapping
const getEndpoints = (type: CatalogType) => {
  const endpoints = {
    technologies: API_CONFIG.ENDPOINTS.CATALOG.TECHNOLOGIES,
    positions: API_CONFIG.ENDPOINTS.CATALOG.POSITIONS,
    durations: API_CONFIG.ENDPOINTS.CATALOG.DURATIONS,
    locations: API_CONFIG.ENDPOINTS.CATALOG.LOCATIONS,
    modalities: API_CONFIG.ENDPOINTS.CATALOG.MODALITIES,
  };
  return endpoints[type];
};

// Get the response key for each catalog type
const getResponseKey = (type: CatalogType): string => {
  return type; // The API returns data under the same key as the catalog type
};

/**
 * Unified catalog service for all catalog types
 */
export const catalogService = {
  /**
   * List all items for a specific catalog type
   */
  async list<T extends CatalogItem>(type: CatalogType): Promise<T[]> {
    try {
      const endpoints = getEndpoints(type);
      const response = await apiClient.get<any>(endpoints.LIST);
      
      // Manejar diferentes estructuras de respuesta
      let items: T[] = [];
      
      if (response.data?.data) {
        // Estructura: { data: { [type]: [...] } } o { data: [...] }
        const responseKey = getResponseKey(type);
        if (Array.isArray(response.data.data[responseKey])) {
          items = response.data.data[responseKey];
        } else if (Array.isArray(response.data.data)) {
          items = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Respuesta directa como array
        items = response.data;
      }
      
      return items;
    } catch (error) {
      console.error(`Error cargando ${type}:`, error);
      throw new Error(processError(error, type));
    }
  },

  /**
   * Create a new catalog item
   */
  async create<T extends CatalogItem>(
    type: CatalogType, 
    data: CreateCatalogRequest
  ): Promise<T> {
    try {
      const endpoints = getEndpoints(type);
      const response = await apiClient.post<any>(
        endpoints.CREATE,
        data
      );
      
      // Extraer el item creado de la respuesta
      let newItem: T;
      if (response.data?.data) {
        newItem = response.data.data;
      } else {
        newItem = response.data;
      }
      
      return newItem;
    } catch (error: any) {
      console.error(`Error creando ${type}:`, error);
      throw new Error(processError(error, type));
    }
  },

  /**
   * Update an existing catalog item (supports partial updates)
   */
  async update<T extends CatalogItem>(
    type: CatalogType,
    id: number,
    data: UpdateCatalogRequest
  ): Promise<T> {
    try {
      const endpoints = getEndpoints(type);
      const response = await apiClient.put<any>(
        endpoints.UPDATE(id),
        data
      );
      
      // Extraer el item actualizado de la respuesta
      let updatedItem: T;
      if (response.data?.data) {
        updatedItem = response.data.data;
      } else {
        updatedItem = response.data;
      }
      
      return updatedItem;
    } catch (error: any) {
      console.error(`Error actualizando ${type}:`, error);
      throw new Error(processError(error, type));
    }
  },

  /**
   * Delete a catalog item (soft delete)
   */
  async delete(type: CatalogType, id: number): Promise<void> {
    try {
      const endpoints = getEndpoints(type);
      await apiClient.delete(endpoints.DELETE(id));
    } catch (error: any) {
      console.error(`Error eliminando ${type}:`, error);
      throw new Error(processError(error, type));
    }
  },

  /**
   * Toggle active status of a catalog item
   */
  async toggleStatus<T extends CatalogItem>(
    type: CatalogType,
    id: number,
    isActive: boolean
  ): Promise<T> {
    return catalogService.update<T>(type, id, { is_active: isActive } as UpdateCatalogRequest);
  }
};

// Backward compatibility - export the old technologyService for existing code
export const technologyService = {
  async list(): Promise<Technology[]> {
    return catalogService.list<Technology>('technologies');
  },
  
  async create(data: CreateCatalogRequest): Promise<Technology> {
    return catalogService.create<Technology>('technologies', data);
  },
  
  async update(id: number, data: UpdateCatalogRequest): Promise<Technology> {
    return catalogService.update<Technology>('technologies', id, data);
  },
  
  async delete({ id }: { id: number }): Promise<void> {
    return catalogService.delete('technologies', id);
  }
};