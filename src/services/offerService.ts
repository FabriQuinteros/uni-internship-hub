import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';
import { ApiHandlerResult } from '@/types/api';
import { Offer } from '@/types/api';
import { formatResponseError, formatExceptionError } from '@/lib/errorFormatter';

/**
 * Filtros disponibles para listar ofertas de la organización
 */
export interface OrganizationOffersFilters {
  status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'closed';
  technology?: number;
  shift?: 'morning' | 'afternoon' | 'night' | 'flexible';
  modality?: number;
  location?: number;
  duration?: number;
  date_from?: string; // YYYY-MM-DD
  date_to?: string;   // YYYY-MM-DD
}

const offerServiceInternal = {
  async create(offer: Partial<Offer>, orgID: number): Promise<ApiHandlerResult<Offer>> {
    try {
      // orgID is expected as query param per backend handlers
      const response = await httpClient.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.CREATE}?orgID=${orgID}`,
        offer
      );

      if (!response.ok) {
        const formatted = await formatResponseError(response, `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.CREATE}`);
        return {
          success: false,
          message: formatted.userMessage,
          error: formatted.developerMessage || String(formatted.original),
          type: 'server_error' as const,
          data: undefined
        };
      }

      const result = await response.json() as Offer;
      
      return {
        success: true,
        message: 'Oferta creada exitosamente',
        data: result,
        type: 'unknown' as const
      };
    } catch (error) {
      const formatted = formatExceptionError(error);
      return {
        success: false,
        message: formatted.userMessage,
        error: formatted.developerMessage || String(formatted.original),
        type: 'server_error' as const,
        data: undefined
      };
    }
  },

  async update(id: number, offer: Partial<Offer>, orgID: number): Promise<ApiHandlerResult<Offer>> {
    try {
      const response = await httpClient.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.UPDATE(id)}?orgID=${orgID}`,
        offer
      );

      if (!response.ok) {
        const formatted = await formatResponseError(response, `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.UPDATE(id)}`);
        return {
          success: false,
          message: formatted.userMessage,
          error: formatted.developerMessage || String(formatted.original),
          type: 'server_error' as const,
          data: undefined
        };
      }

      const result = await response.json() as Offer;
      
      return {
        success: true,
        message: 'Oferta actualizada exitosamente',
        data: result,
        type: 'unknown' as const
      };
    } catch (error) {
      const formatted = formatExceptionError(error);
      return {
        success: false,
        message: formatted.userMessage,
        error: formatted.developerMessage || String(formatted.original),
        type: 'server_error' as const,
        data: undefined
      };
    }
  },

  async sendToApproval(id: number, orgID: number): Promise<ApiHandlerResult<Offer>> {
    try {
      const response = await httpClient.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.SEND_TO_APPROVAL(id)}?orgID=${orgID}`,
        null
      );

      if (!response.ok) {
        const formatted = await formatResponseError(response, `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.SEND_TO_APPROVAL(id)}`);
        return {
          success: false,
          message: formatted.userMessage,
          error: formatted.developerMessage || String(formatted.original),
          type: 'server_error' as const,
          data: undefined
        };
      }

      const result = await response.json() as Offer;
      
      return {
        success: true,
        message: 'Oferta enviada a aprobación exitosamente',
        data: result,
        type: 'unknown' as const
      };
    } catch (error) {
      const formatted = formatExceptionError(error);
      return {
        success: false,
        message: formatted.userMessage,
        error: formatted.developerMessage || String(formatted.original),
        type: 'server_error' as const,
        data: undefined
      };
    }
  },

  async get(id: number): Promise<ApiHandlerResult<Offer>> {
    try {
      const response = await httpClient.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.GET(id)}`);

      if (!response.ok) {
        const formatted = await formatResponseError(response, `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.GET(id)}`);
        return {
          success: false,
          message: formatted.userMessage,
          error: formatted.developerMessage || String(formatted.original),
          type: 'server_error' as const,
          data: undefined
        };
      }

      const result = await response.json() as Offer;
      
      return {
        success: true,
        message: 'Oferta obtenida exitosamente',
        data: result,
        type: 'unknown' as const
      };
    } catch (error) {
      const formatted = formatExceptionError(error);
      return {
        success: false,
        message: formatted.userMessage,
        error: formatted.developerMessage || String(formatted.original),
        type: 'server_error' as const,
        data: undefined
      };
    }
  },

  async delete(id: number, orgID: number): Promise<ApiHandlerResult<null>> {
    try {
      const response = await httpClient.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.DELETE(id)}?orgID=${orgID}`
      );

      if (!response.ok) {
        const formatted = await formatResponseError(response, `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.DELETE(id)}`);
        return {
          success: false,
          message: formatted.userMessage,
          error: formatted.developerMessage || String(formatted.original),
          type: 'server_error' as const,
          data: undefined
        };
      }

      return {
        success: true,
        message: 'Oferta eliminada exitosamente',
        data: null,
        type: 'unknown' as const
      };
    } catch (error) {
      const formatted = formatExceptionError(error);
      return {
        success: false,
        message: formatted.userMessage,
        error: formatted.developerMessage || String(formatted.original),
        type: 'server_error' as const,
        data: undefined
      };
    }
  },

  async list(orgID: number, filters?: OrganizationOffersFilters): Promise<ApiHandlerResult<Offer[]>> {
    try {
      const url = new URL(API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.LIST, API_CONFIG.BASE_URL);
      url.searchParams.append('orgID', String(orgID));
      
      // Agregar filtros opcionales
      if (filters) {
        if (filters.status) url.searchParams.append('status', filters.status);
        if (filters.technology) url.searchParams.append('technology', String(filters.technology));
        if (filters.shift) url.searchParams.append('shift', filters.shift);
        if (filters.modality) url.searchParams.append('modality', String(filters.modality));
        if (filters.location) url.searchParams.append('location', String(filters.location));
        if (filters.duration) url.searchParams.append('duration', String(filters.duration));
        if (filters.date_from) url.searchParams.append('date_from', filters.date_from);
        if (filters.date_to) url.searchParams.append('date_to', filters.date_to);
      }
      
      const response = await httpClient.get(url.toString());
      
      if (!response.ok) {
        const formatted = await formatResponseError(response, url.toString());
        return {
          success: false,
          message: formatted.userMessage,
          error: formatted.developerMessage || String(formatted.original) || `Error al listar ofertas`,
          type: 'server_error' as const,
          data: undefined
        };
      }
      
      const result = await response.json() as Offer[];
      
      return {
        success: true,
        message: 'Ofertas listadas exitosamente',
        data: result,
        type: 'unknown' as const
      };
    } catch (error) {
      const formatted = formatExceptionError(error);
      return {
        success: false,
        message: formatted.userMessage,
        error: formatted.developerMessage || String(formatted.original),
        type: 'server_error' as const,
        data: undefined
      };
    }
  }
};

export const offerService = {
  async create(offer: Partial<Offer>, orgID: number) {
    const result = await offerServiceInternal.create(offer, orgID);
    if (!result.success) throw new Error(result.message);
    if (!result.data) throw new Error('No data from create offer');
    return result.data;
  },

  async update(id: number, offer: Partial<Offer>, orgID: number) {
    const result = await offerServiceInternal.update(id, offer, orgID);
    if (!result.success) throw new Error(result.message);
    if (!result.data) throw new Error('No data from update offer');
    return result.data;
  },

  async sendToApproval(id: number, orgID: number) {
    const result = await offerServiceInternal.sendToApproval(id, orgID);
    if (!result.success) throw new Error(result.message);
    if (!result.data) throw new Error('No data from send to approval');
    return result.data;
  },

  async get(id: number) {
    const result = await offerServiceInternal.get(id);
    if (!result.success) throw new Error(result.message);
    if (!result.data) throw new Error('Offer not found');
    return result.data;
  },

  async delete(id: number, orgID: number) {
    const result = await offerServiceInternal.delete(id, orgID);
    if (!result.success) throw new Error(result.message);
    return true;
  },

  async list(orgID: number, filters?: OrganizationOffersFilters) {
    const result = await offerServiceInternal.list(orgID, filters);
    if (!result.success) throw new Error(result.message);
    return result.data || [];
  }
};
