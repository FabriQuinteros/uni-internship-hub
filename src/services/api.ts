import axios from 'axios';
import { 
  Organization, 
  OrganizationFilters, 
  PaginationParams, 
  PaginatedResponse, 
  StatusChangeRequest, 
  OrganizationObservation 
} from '../types/user';

const api = axios.create({
  baseURL: 'https://api.example.com', // Cambia esto a la URL de tu API
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

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

// Función para obtener datos de la API
export const getData = async (endpoint: string) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Función para enviar datos a la API
export const postData = async (endpoint: string, data: any) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// ===== FUNCIONES ESPECÍFICAS PARA GESTIÓN DE ORGANIZACIONES =====

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

// Otras funciones para PUT, DELETE, etc. pueden ser añadidas aquí