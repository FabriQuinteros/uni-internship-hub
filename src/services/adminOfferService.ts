/**
 * Servicio para gestión administrativa de ofertas
 * Maneja las operaciones de aprobación, rechazo y listado de ofertas pendientes
 */

import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';
import { ApiHandlerResult } from '@/types/api';
import {
  PendingOffer,
  PendingOffersResponse,
  PendingOffersFilters,
  ApproveRejectRequest,
  ApproveRejectResponse,
  OfferDetails
} from '@/types/admin-offers';

/**
 * Servicio interno con manejo de errores via ApiHandlerResult
 */
const adminOfferServiceInternal = {
  /**
   * Lista las ofertas pendientes de aprobación
   * @param filters - Filtros de búsqueda y paginación
   * @returns Lista paginada de ofertas pendientes
   */
  async listPendingOffers(filters?: PendingOffersFilters): Promise<ApiHandlerResult<PendingOffersResponse['data']>> {
    try {
      const url = new URL(API_CONFIG.ENDPOINTS.ADMIN.OFFERS.PENDING, API_CONFIG.BASE_URL);
      
      // Agregar parámetros de query
      if (filters?.page) url.searchParams.append('page', String(filters.page));
      if (filters?.limit) url.searchParams.append('limit', String(filters.limit));
      if (filters?.search) url.searchParams.append('search', filters.search);
      if (filters?.status) url.searchParams.append('status', filters.status);

      const response = await httpClient.get(url.toString());
      
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al obtener ofertas pendientes`,
          type: 'server_error' as const,
          data: undefined
        };
      }
      
      const result = await response.json() as PendingOffersResponse;
      
      return {
        success: true,
        message: 'Ofertas pendientes obtenidas exitosamente',
        data: result.data,
        type: 'unknown' as const
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener ofertas pendientes',
        error: error instanceof Error ? error.message : 'Error desconocido',
        type: 'server_error' as const,
        data: undefined
      };
    }
  },

  /**
   * Aprueba o rechaza una oferta
   * @param id - ID de la oferta
   * @param request - Decisión y motivo si aplica
   * @returns Resultado de la decisión
   */
  async approveRejectOffer(id: number, request: ApproveRejectRequest): Promise<ApiHandlerResult<ApproveRejectResponse['data']>> {
    try {
      const response = await httpClient.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN.OFFERS.DECISION(id)}`,
        request
      );
      
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al procesar decisión de la oferta`,
          type: 'server_error' as const,
          data: undefined
        };
      }
      
      const result = await response.json() as ApproveRejectResponse;
      
      return {
        success: true,
        message: 'Decisión procesada exitosamente',
        data: result.data,
        type: 'unknown' as const
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al procesar decisión de la oferta',
        error: error instanceof Error ? error.message : 'Error desconocido',
        type: 'server_error' as const,
        data: undefined
      };
    }
  },

  /**
   * Obtiene los detalles completos de una oferta para revisión
   * @param id - ID de la oferta
   * @returns Detalles completos de la oferta
   */
  async getOfferDetails(id: number): Promise<ApiHandlerResult<OfferDetails>> {
    try {
      const response = await httpClient.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN.OFFERS.DETAILS(id)}`);
      
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al obtener detalles de la oferta`,
          type: 'server_error' as const,
          data: undefined
        };
      }
      
      const result = await response.json() as OfferDetails;
      
      return {
        success: true,
        message: 'Detalles de oferta obtenidos exitosamente',
        data: result,
        type: 'unknown' as const
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener detalles de la oferta',
        error: error instanceof Error ? error.message : 'Error desconocido',
        type: 'server_error' as const,
        data: undefined
      };
    }
  },
};

/**
 * Servicio público con manejo de errores via throw
 * Usado por los hooks y componentes
 */
export const adminOfferService = {
  /**
   * Lista ofertas pendientes (lanza excepción en error)
   */
  async listPendingOffers(filters?: PendingOffersFilters) {
    const result = await adminOfferServiceInternal.listPendingOffers(filters);
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener ofertas pendientes');
    }
    return result.data;
  },

  /**
   * Aprueba una oferta (lanza excepción en error)
   */
  async approveOffer(id: number) {
    const request: ApproveRejectRequest = { decision: 'approve' };
    const result = await adminOfferServiceInternal.approveRejectOffer(id, request);
    if (!result.success) {
      throw new Error(result.message || 'Error al aprobar la oferta');
    }
    return result.data;
  },

  /**
   * Rechaza una oferta con motivo (lanza excepción en error)
   */
  async rejectOffer(id: number, rejectionReason: string) {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      throw new Error('El motivo de rechazo debe tener al menos 10 caracteres');
    }

    const request: ApproveRejectRequest = { 
      decision: 'reject', 
      rejection_reason: rejectionReason.trim() 
    };
    
    const result = await adminOfferServiceInternal.approveRejectOffer(id, request);
    if (!result.success) {
      throw new Error(result.message || 'Error al rechazar la oferta');
    }
    return result.data;
  },

  /**
   * Obtiene detalles de oferta (lanza excepción en error)
   */
  async getOfferDetails(id: number) {
    const result = await adminOfferServiceInternal.getOfferDetails(id);
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener detalles de la oferta');
    }
    if (!result.data) {
      throw new Error('Oferta no encontrada');
    }
    return result.data;
  },

  /**
   * Función de utilidad para obtener el conteo de ofertas pendientes
   */
  async getPendingOffersCount(): Promise<number> {
    try {
      const data = await this.listPendingOffers({ page: 1, limit: 1 });
      return data?.total || 0;
    } catch (error) {
      console.warn('Error obteniendo conteo de ofertas pendientes:', error);
      return 0;
    }
  },

  /**
   * Buscar ofertas pendientes por término
   */
  async searchPendingOffers(searchTerm: string, page = 1, limit = 10) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
    }

    return this.listPendingOffers({
      search: searchTerm.trim(),
      page,
      limit
    });
  }
};

// Type para el servicio interno
export type AdminOfferServiceInternal = typeof adminOfferServiceInternal;