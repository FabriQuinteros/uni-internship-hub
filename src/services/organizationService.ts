import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';
import { ApiHandlerResult } from '@/types/api';
import { 
  OrganizationListItem,
  OrganizationDetails,
  OrganizationSummary,
  OrganizationStats,
  OrganizationFilters, 
  UpdateStatusRequest,
  UpdateStatusResponse,
  ListOrganizationsResponse,
  StatusChangeRequest,
  OrganizationProfile,
  UpdateOrganizationProfileRequest,
  OrganizationRegisterRequest,
  OrganizationRegisterResponse
} from '../types/user';

export interface UpdateOrganizationRequest {
  // This interface represents fields allowed by the organization profile update endpoint
  businessName?: string;
  industry?: string;
  address?: string;
  website?: string;
  description?: string;
  mainContact?: string;
  logoUrl?: string;
  agreementStatus?: 'active' | 'inactive';
  agreementExpiry?: string; // YYYY-MM-DD
}

/**
 * GET /admin/organizations - Listar organizaciones con filtros y paginación
 */
export const getOrganizations = async (
  filters: OrganizationFilters = {}
): Promise<ListOrganizationsResponse> => {
  const queryParams = new URLSearchParams();
  
  queryParams.set('page', (filters.page || 1).toString());
  queryParams.set('limit', (filters.limit || 25).toString());
  
  if (filters.search) {
    queryParams.set('search', filters.search);
  }
  
  if (filters.status) {
    queryParams.set('status', filters.status);
  }


  const response = await httpClient.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.ADMIN.LIST}?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  const result = await response.json();

  console.log('🔍 Raw backend data:', result); // Debug temporal

  // Vamos a manejar diferentes estructuras de respuesta del backend
  let transformedData: ListOrganizationsResponse;
  
  if (Array.isArray(result)) {
    // Caso 1: result es directamente un array de organizaciones ya transformadas
    console.log('📊 Case 1: Direct array detected');
    transformedData = {
      data: result,
      total: result.length,
      page: 1,
      totalPages: 1
    };
  } else if (result && typeof result === 'object') {
    // Caso 2: result es un objeto con la estructura {Data, Total, ...}
    console.log('📊 Case 2: Object structure detected');
    
    transformedData = {
      data: (result.Data || result.data || []).map((org: any) => ({
        id: (org.ID || org.id)?.toString() || '', 
        name: org.Name || org.name || '',
        email: org.Email || org.email || '',
        status: org.Status || org.status || 'pending',
        createdAt: org.CreatedAt || org.createdAt || ''
      })),
      total: result.Total || result.total || 0,
      page: result.Page || result.page || 1,
      totalPages: result.TotalPages || result.totalPages || 1
    };
  } else {
    // Caso 3: Fallback
    console.log('📊 Case 3: Fallback - no data');
    transformedData = {
      data: [],
      total: 0,
      page: 1,
      totalPages: 1
    };
  }
  
  console.log('🔍 Transformed data:', transformedData); // Debug temporal
  
  return transformedData;
};

/**
 * PUT /admin/organizations/:id/status - Actualizar estado de organización
 */
export const updateOrganizationStatus = async (
  organizationId: string,
  request: UpdateStatusRequest
): Promise<UpdateStatusResponse> => {
  const response = await httpClient.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.ADMIN.STATUS(organizationId)}`, request);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result;
};

/**
 * GET /admin/organizations/:id/details - Obtener detalles completos de organización
 */
export const getOrganizationDetails = async (
  organizationId: string
): Promise<{ message: string; data: OrganizationDetails }> => {
  const response = await httpClient.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.ADMIN.DETAILS(organizationId)}`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result;
};

/**
 * GET /admin/organizations/stats - Obtener estadísticas de organizaciones
 */
export const getOrganizationsStats = async (): Promise<{ message: string; data: OrganizationStats }> => {
  const response = await httpClient.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.ADMIN.STATS}`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result;
};

/**
 * POST /api/organizations/register - Registro de nueva organización
 */
export const registerOrganization = async (
  data: OrganizationRegisterRequest
): Promise<OrganizationRegisterResponse> => {
  const response = await httpClient.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.REGISTER}`, data);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result;
};

/**
 * GET /api/organizations/profile?userID=<uuid> - Obtener perfil de organización
 */
export const getOrganizationProfile = async (
  userID: string
): Promise<{ message: string; data: OrganizationProfile }> => {
  const response = await httpClient.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.PROFILE.GET}?userID=${userID}`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result;
};

/**
 * PUT /api/organizations/profile?userID=<uuid> - Actualizar perfil de organización
 */
export const updateOrganizationProfile = async (
  userID: string,
  data: UpdateOrganizationProfileRequest
): Promise<{ message: string; data: OrganizationProfile }> => {
  const response = await httpClient.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.PROFILE.UPDATE}?userID=${userID}`, data);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result;
};

/**
 * Función compatible con el store existente para cambiar estado
 */
export const changeOrganizationStatus = async (
  request: StatusChangeRequest
): Promise<OrganizationListItem> => {
  const response = await updateOrganizationStatus(request.organizationId, {
    newStatus: request.newStatus,
    adminId: request.adminId
  });
  
  return {
    id: response.data.id,
    name: response.data.name,
    email: response.data.email,
    status: response.data.status,
    createdAt: response.data.updatedAt
  };
};

// ===== EXPORTACIÓN PARA COMPATIBILIDAD CON API CLIENT EXISTENTE =====

const organizationServiceInternal = {
  async register(data: OrganizationRegisterRequest): Promise<ApiHandlerResult<OrganizationRegisterResponse>> {
    try {
      const result = await registerOrganization(data);
      return {
        success: true,
        data: result,
        message: result.message,
        type: 'unknown' as const
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        data: undefined,
        type: 'server_error' as const
      };
    }
  }
  ,
  async getProfile(userId?: number) : Promise<ApiHandlerResult<OrganizationProfile>> {
    try {
      // The backend accepts userID via query or context; we'll call with userID if provided
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.PROFILE.GET}`;
      const targetUrl = userId ? `${url}?userID=${userId}` : url;
      
      const response = await httpClient.get(targetUrl);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        data: result.data,
        message: result.message,
        type: 'unknown' as const
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        data: undefined,
        type: 'server_error' as const
      };
    }
  },
  async update(userId: number | undefined, data: UpdateOrganizationRequest): Promise<ApiHandlerResult<OrganizationProfile>> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.PROFILE.UPDATE}`;
      const targetUrl = userId ? `${url}?userID=${userId}` : url;
      
      const response = await httpClient.put(targetUrl, data);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        data: result.data,
        message: result.message,
        type: 'unknown' as const
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        data: undefined,
        type: 'server_error' as const
      };
    }
  }
};

export const organizationService = {
  async register(data: OrganizationRegisterRequest): Promise<OrganizationRegisterResponse> {
    const result = await organizationServiceInternal.register(data);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    if (!result.data) {
      throw new Error('No data returned from registration');
    }
    
    return result.data;
  }
  ,
  async getProfile(userId?: number): Promise<OrganizationProfile> {
    const result = await organizationServiceInternal.getProfile(userId);
    if (!result.success) throw new Error(result.message);
    if (!result.data) throw new Error('No data returned from getProfile');
    return result.data;
  },
  async update(userId: number | undefined, data: UpdateOrganizationRequest): Promise<OrganizationProfile> {
    const result = await organizationServiceInternal.update(userId, data);
    if (!result.success) throw new Error(result.message);
    if (!result.data) throw new Error('No data returned from update');
    return result.data;
  }
};