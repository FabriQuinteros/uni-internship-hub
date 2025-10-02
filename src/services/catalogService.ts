import { apiClient } from '@/lib/api/apiClient';
import { API_CONFIG } from '@/config/api.config';
import { handleApiResponse } from '@/lib/api/apiResponseHandler';
import { ApiHandlerResult } from '@/types/api';
import { 
  CatalogType, 
  CatalogItem, 
  Technology,
  CreateCatalogRequest,
  UpdateCatalogRequest
} from '@/types/catalog';

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

const getResponseKey = (type: CatalogType): string => {
  return type;
};

export const catalogService = {
  async list<T extends CatalogItem>(type: CatalogType): Promise<T[]> {
    const result = await catalogServiceInternal.list<T>(type);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result.data || [];
  },

  async create<T extends CatalogItem>(
    type: CatalogType, 
    data: CreateCatalogRequest
  ): Promise<T> {
    const result = await catalogServiceInternal.create<T>(type, data);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    if (!result.data) {
      throw new Error('No data returned from create operation');
    }
    
    return result.data;
  },

  async update<T extends CatalogItem>(
    type: CatalogType,
    id: number,
    data: UpdateCatalogRequest
  ): Promise<T> {
    const result = await catalogServiceInternal.update<T>(type, id, data);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    if (!result.data) {
      throw new Error('No data returned from update operation');
    }
    
    return result.data;
  },

  async delete(type: CatalogType, id: number): Promise<void> {
    const result = await catalogServiceInternal.delete(type, id);
    
    if (!result.success) {
      throw new Error(result.message);
    }
  },

  async toggleStatus<T extends CatalogItem>(
    type: CatalogType,
    id: number,
    isActive: boolean
  ): Promise<T> {
    return catalogService.update<T>(type, id, { is_active: isActive } as UpdateCatalogRequest);
  }
};

const catalogServiceInternal = {
  async list<T extends CatalogItem>(type: CatalogType): Promise<ApiHandlerResult<T[]>> {
    const endpoints = getEndpoints(type);
    const responsePromise = apiClient.get(endpoints.LIST);
    
    const result = await handleApiResponse<T[]>(responsePromise);
    
    if (result.success && result.data) {
      let items: T[] = [];
      
      if (Array.isArray(result.data)) {
        items = result.data;
      } else if (result.data && typeof result.data === 'object') {
        const responseKey = getResponseKey(type);
        const nestedData = (result.data as any)[responseKey];
        if (Array.isArray(nestedData)) {
          items = nestedData;
        }
      }
      
      return {
        ...result,
        data: items
      };
    }
    
    return result;
  },

  async create<T extends CatalogItem>(
    type: CatalogType, 
    data: CreateCatalogRequest
  ): Promise<ApiHandlerResult<T>> {
    const endpoints = getEndpoints(type);
    const responsePromise = apiClient.post(endpoints.CREATE, data);
    
    return handleApiResponse<T>(responsePromise);
  },

  async update<T extends CatalogItem>(
    type: CatalogType,
    id: number,
    data: UpdateCatalogRequest
  ): Promise<ApiHandlerResult<T>> {
    const endpoints = getEndpoints(type);
    const responsePromise = apiClient.put(endpoints.UPDATE(id), data);
    
    return handleApiResponse<T>(responsePromise);
  },

  async delete(type: CatalogType, id: number): Promise<ApiHandlerResult<void>> {
    const endpoints = getEndpoints(type);
    const responsePromise = apiClient.delete(endpoints.DELETE(id));
    
    return handleApiResponse<void>(responsePromise);
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