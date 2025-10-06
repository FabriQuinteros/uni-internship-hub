import { apiClient } from '@/lib/api/apiClient';
import { API_CONFIG } from '@/config/api.config';
import { handleApiResponse } from '@/lib/api/apiResponseHandler';
import { ApiHandlerResult } from '@/types/api';
import { 
  Organization, 
  OrganizationFilters, 
  PaginationParams, 
  PaginatedResponse, 
  StatusChangeRequest, 
  OrganizationObservation 
} from '../types/user';
import axios from 'axios';

// Legacy Organization interface for backward compatibility
export interface LegacyOrganization {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  is_active?: boolean;
}

// Create axios instance for admin operations (temporary until full migration to apiClient)
const api = axios.create({
  baseURL: 'https://api.example.com', // Cambia esto a la URL de tu API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para manejar errores de la API
const handleError = (error: any) => {
  if (error.response) {
    // La solicitud se realizó y el servidor respondió con un código de estado
    console.error('Error en la respuesta:', error.response.data);
  } else if (error.request) {
    // La solicitud se realizó pero no se recibió respuesta
    console.error('No se recibió respuesta:', error.request);
  } else {
    // Algo sucedió al configurar la solicitud
    console.error('Error al configurar la solicitud:', error.message);
  }
};

const organizationServiceInternal = {
  async register(data: CreateOrganizationRequest): Promise<ApiHandlerResult<LegacyOrganization>> {
    const responsePromise = apiClient.post(API_CONFIG.ENDPOINTS.ORGANIZATIONS.REGISTER, data);
    return handleApiResponse<LegacyOrganization>(responsePromise);
  }
};

// ===== FUNCIONES ESPECÍFICAS PARA GESTIÓN DE ORGANIZACIONES (ADMIN) =====

// Obtener lista paginada de organizaciones con filtros
export const getOrganizations = async (
  filters: OrganizationFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<Organization>> => {
  try {
    const queryParams = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      ...(pagination.sortBy && { sortBy: pagination.sortBy }),
      ...(pagination.sortOrder && { sortOrder: pagination.sortOrder }),
      ...(filters.searchTerm && { search: filters.searchTerm }),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
      ...(filters.profileComplete !== undefined && { profileComplete: filters.profileComplete.toString() }),
    });

    if (filters.status && filters.status.length > 0) {
      filters.status.forEach(status => queryParams.append('status', status));
    }

    const response = await api.get(`/admin/organizations?${queryParams}`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Cambiar estado de una organización
export const changeOrganizationStatus = async (
  request: StatusChangeRequest
): Promise<Organization> => {
  try {
    const response = await api.put(`/admin/organizations/${request.organizationId}/status`, {
      newStatus: request.newStatus,
      observation: request.observation,
      adminId: request.adminId
    });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Obtener historial de observaciones de una organización
export const getOrganizationObservations = async (
  organizationId: string
): Promise<OrganizationObservation[]> => {
  try {
    const response = await api.get(`/admin/organizations/${organizationId}/observations`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Agregar observación a una organización
export const addOrganizationObservation = async (
  organizationId: string,
  observation: string,
  adminId: string
): Promise<OrganizationObservation> => {
  try {
    const response = await api.post(`/admin/organizations/${organizationId}/observations`, {
      observation,
      adminId
    });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Obtener detalles específicos de una organización
export const getOrganizationDetails = async (
  organizationId: string
): Promise<Organization> => {
  try {
    const response = await api.get(`/admin/organizations/${organizationId}`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Obtener estadísticas de organizaciones para el dashboard
export const getOrganizationsStats = async () => {
  try {
    const response = await api.get('/admin/organizations/stats');
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Validar permisos de administrador
export const validateAdminPermissions = async (userId: string): Promise<boolean> => {
  try {
    const response = await api.get(`/admin/validate-permissions/${userId}`);
    return response.data.isAdmin;
  } catch (error) {
    handleError(error);
    return false;
  }
};

export const organizationService = {
  async register(data: CreateOrganizationRequest): Promise<LegacyOrganization> {
    const result = await organizationServiceInternal.register(data);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    if (!result.data) {
      throw new Error('No data returned from registration');
    }
    
    return result.data;
  }
};