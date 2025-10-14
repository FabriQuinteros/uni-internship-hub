import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';
import { ApiHandlerResult } from '@/types/api';
import { Offer } from '@/types/api';

const offerServiceInternal = {
  async create(offer: Partial<Offer>, orgID: number): Promise<ApiHandlerResult<Offer>> {
    try {
      // orgID is expected as query param per backend handlers
      const response = await httpClient.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.CREATE}?orgID=${orgID}`,
        offer
      );
      
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al crear oferta`,
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
      return {
        success: false,
        message: 'Error al crear oferta',
        error: error instanceof Error ? error.message : 'Error desconocido',
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
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al actualizar oferta`,
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
      return {
        success: false,
        message: 'Error al actualizar oferta',
        error: error instanceof Error ? error.message : 'Error desconocido',
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
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al enviar oferta a aprobación`,
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
      return {
        success: false,
        message: 'Error al enviar oferta a aprobación',
        error: error instanceof Error ? error.message : 'Error desconocido',
        type: 'server_error' as const,
        data: undefined
      };
    }
  },

  async get(id: number): Promise<ApiHandlerResult<Offer>> {
    try {
      const response = await httpClient.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.GET(id)}`);
      
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al obtener oferta`,
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
      return {
        success: false,
        message: 'Error al obtener oferta',
        error: error instanceof Error ? error.message : 'Error desconocido',
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
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al eliminar oferta`,
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
      return {
        success: false,
        message: 'Error al eliminar oferta',
        error: error instanceof Error ? error.message : 'Error desconocido',
        type: 'server_error' as const,
        data: undefined
      };
    }
  },

  async list(orgID: number, status?: string): Promise<ApiHandlerResult<Offer[]>> {
    try {
      const url = new URL(API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.LIST, API_CONFIG.BASE_URL);
      url.searchParams.append('orgID', String(orgID));
      if (status) url.searchParams.append('status', status);
      
      const response = await httpClient.get(url.toString());
      
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al listar ofertas`,
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
      return {
        success: false,
        message: 'Error al listar ofertas',
        error: error instanceof Error ? error.message : 'Error desconocido',
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

  async list(orgID: number, status?: string) {
    const result = await offerServiceInternal.list(orgID, status);
    if (!result.success) throw new Error(result.message);
    return result.data || [];
  }
};
