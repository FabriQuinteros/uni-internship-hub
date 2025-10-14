/**
 * Catalog Service - Servicio para catálogos usando httpClient con JWT
 */

import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';
import { 
  CatalogType, 
  CatalogItem, 
  Technology,
  Availability,
  CreateCatalogRequest,
  UpdateCatalogRequest,
  CreateAvailabilityRequest,
  UpdateAvailabilityRequest
} from '@/types/catalog';

// Helper para obtener las URLs correctas
const getEndpoints = (type: CatalogType) => {
  const endpoints = {
    technologies: API_CONFIG.ENDPOINTS.CATALOG.TECHNOLOGIES,
    positions: API_CONFIG.ENDPOINTS.CATALOG.POSITIONS,
    durations: API_CONFIG.ENDPOINTS.CATALOG.DURATIONS,
    locations: API_CONFIG.ENDPOINTS.CATALOG.LOCATIONS,
    modalities: API_CONFIG.ENDPOINTS.CATALOG.MODALITIES,
    availability: API_CONFIG.ENDPOINTS.CATALOG.AVAILABILITY,
  };
  return endpoints[type];
};

// Helper para manejar respuestas
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`HTTP ${response.status}:`, errorText);
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('📦 Catalog response raw:', data);
  console.log('📦 Catalog response structure:', {
    isArray: Array.isArray(data),
    hasData: !!data?.data,
    dataKeys: data?.data ? Object.keys(data.data) : [],
    topLevelKeys: typeof data === 'object' ? Object.keys(data) : []
  });
  
  return data;
};

export const catalogService = {
  async list<T extends CatalogItem>(type: CatalogType): Promise<T[]> {
    console.log(`🔍 Fetching ${type} catalog...`);
    
    const endpoints = getEndpoints(type);
    const response = await httpClient.get(`${API_CONFIG.BASE_URL}${endpoints.LIST}`);
    const data = await handleResponse<any>(response);
    
    // Manejar diferentes estructuras de respuesta
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      // Caso específico: estructura con data.technologies
      if (data.data && data.data[type]) {
        return data.data[type] as T[];
      }
      // Si viene envuelto en un objeto, buscar el array
      const possibleArrays = Object.values(data).find(val => Array.isArray(val));
      if (possibleArrays) {
        return possibleArrays as T[];
      }
      // También buscar en data.data si existe
      if (data.data) {
        const possibleArraysInData = Object.values(data.data).find(val => Array.isArray(val));
        if (possibleArraysInData) {
          return possibleArraysInData as T[];
        }
      }
    }
    
    return [];
  },

  async create<T extends CatalogItem>(
    type: CatalogType, 
    data: CreateCatalogRequest
  ): Promise<T> {
    console.log(`➕ Creating ${type}:`, data);
    
    const endpoints = getEndpoints(type);
    const response = await httpClient.post(`${API_CONFIG.BASE_URL}${endpoints.CREATE}`, data);
    
    return handleResponse<T>(response);
  },

  async update<T extends CatalogItem>(
    type: CatalogType,
    id: number,
    data: UpdateCatalogRequest
  ): Promise<T> {
    console.log(`✏️ Updating ${type} ${id}:`, data);
    
    const endpoints = getEndpoints(type);
    const response = await httpClient.put(`${API_CONFIG.BASE_URL}${endpoints.UPDATE(id)}`, data);
    
    return handleResponse<T>(response);
  },

  async delete(type: CatalogType, id: number): Promise<void> {
    console.log(`🗑️ Deleting ${type} ${id}`);
    
    const endpoints = getEndpoints(type);
    const response = await httpClient.delete(`${API_CONFIG.BASE_URL}${endpoints.DELETE(id)}`);
    
    await handleResponse<void>(response);
  },

  async toggleStatus<T extends CatalogItem>(
    type: CatalogType,
    id: number,
    isActive: boolean
  ): Promise<T> {
    return catalogService.update<T>(type, id, { is_active: isActive } as UpdateCatalogRequest);
  }
};

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

export const availabilityService = {
  async list(): Promise<Availability[]> {
    return catalogService.list<Availability>('availability');
  },
  
  async create(data: CreateAvailabilityRequest): Promise<Availability> {
    return catalogService.create<Availability>('availability', data);
  },
  
  async update(id: number, data: UpdateAvailabilityRequest): Promise<Availability> {
    return catalogService.update<Availability>('availability', id, data);
  },
  
  async delete({ id }: { id: number }): Promise<void> {
    return catalogService.delete('availability', id);
  }
};