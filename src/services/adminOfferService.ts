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
  OfferDetails,
  AllOffersFilters,
  AllOffersResponse,
  AdminOffer,
  OfferStatistics
} from '@/types/admin-offers';

/**
 * Servicio interno con manejo de errores via ApiHandlerResult
 */
const adminOfferServiceInternal = {
  /**
   * Lista las ofertas con filtros opcionales (incluyendo por estado)
   * @param filters - Filtros de búsqueda y paginación
   * @returns Lista paginada de ofertas
   */
  async listPendingOffers(filters?: PendingOffersFilters): Promise<ApiHandlerResult<PendingOffersResponse['data']>> {
    try {
      const url = new URL(API_CONFIG.ENDPOINTS.ADMIN.OFFERS.LIST, API_CONFIG.BASE_URL);
      
      // Agregar parámetros de query
      if (filters?.page) url.searchParams.append('page', String(filters.page));
      if (filters?.limit) url.searchParams.append('limit', String(filters.limit));
      if (filters?.search) url.searchParams.append('search', filters.search);
      
      // Solo filtrar por estado "pending" si se especifica en filters.status
      // Si no se especifica, mostrar todas las ofertas
      if (filters?.status) {
        url.searchParams.append('status', filters.status);
      }

      const response = await httpClient.get(url.toString());
      
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al obtener ofertas`,
          type: 'server_error' as const,
          data: undefined
        };
      }
      
      const result = await response.json() as PendingOffersResponse;
      
      // El backend devuelve: { message, data: { offers, page, limit, total, total_pages } }
      return {
        success: true,
        message: result.message || 'Ofertas obtenidas exitosamente',
        data: result.data,
        type: 'unknown' as const
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener ofertas',
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
      
      const result = await response.json() as { message: string; data: { offer: OfferDetails } };
      
      // El backend devuelve: { message, data: { offer } }
      return {
        success: true,
        message: result.message || 'Detalles de oferta obtenidos exitosamente',
        data: result.data.offer,
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

  /**
   * Lista TODAS las ofertas con filtros avanzados
   * @param filters - Filtros avanzados de búsqueda y paginación
   * @returns Lista paginada de todas las ofertas
   */
  async listAllOffers(filters?: AllOffersFilters): Promise<ApiHandlerResult<AllOffersResponse['data']>> {
    try {
      const url = new URL(API_CONFIG.ENDPOINTS.ADMIN.OFFERS.LIST, API_CONFIG.BASE_URL);
      
      // Agregar parámetros de query
      if (filters?.page) url.searchParams.append('page', String(filters.page));
      if (filters?.limit) url.searchParams.append('limit', String(filters.limit));
      if (filters?.search) url.searchParams.append('search', filters.search);
      if (filters?.status) url.searchParams.append('status', filters.status);
      if (filters?.date_from) url.searchParams.append('date_from', filters.date_from);
      if (filters?.date_to) url.searchParams.append('date_to', filters.date_to);

      const response = await httpClient.get(url.toString());
      
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al obtener ofertas`,
          type: 'server_error' as const,
          data: undefined
        };
      }
      
      const result = await response.json() as AllOffersResponse;
      
      // El backend devuelve: { message, data: { offers, page, limit, total, total_pages } }
      return {
        success: true,
        message: result.message || 'Ofertas obtenidas exitosamente',
        data: result.data,
        type: 'unknown' as const
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener ofertas',
        error: error instanceof Error ? error.message : 'Error desconocido',
        type: 'server_error' as const,
        data: undefined
      };
    }
  },

  /**
   * Obtiene estadísticas de ofertas
   * @returns Estadísticas generales de ofertas
   */
  async getOfferStatistics(): Promise<ApiHandlerResult<OfferStatistics>> {
    try {
      // Por ahora calculamos estadísticas básicas desde el listado
      // En el futuro el backend debería tener un endpoint específico
      const allOffers = await this.listAllOffers({ limit: 1000 });
      
      if (!allOffers.success || !allOffers.data) {
        return {
          success: false,
          message: 'Error al obtener estadísticas',
          error: 'No se pudieron obtener las ofertas',
          type: 'server_error' as const,
          data: undefined
        };
      }

      const offers = allOffers.data.offers;
      const stats: OfferStatistics = {
        total: allOffers.data.total,
        by_status: {
          draft: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          closed: 0
        },
        recent_approvals: 0,
        recent_rejections: 0,
        pending_review: 0
      };

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      offers.forEach(offer => {
        // Contar por estado
        stats.by_status[offer.status]++;
        
        // Contar pendientes de revisión
        if (offer.status === 'pending') {
          stats.pending_review++;
        }
        
        // Contar aprobaciones/rechazos recientes (últimas 24h)
        if (offer.updated_at) {
          const updatedAt = new Date(offer.updated_at);
          if (updatedAt >= yesterday) {
            if (offer.status === 'approved') stats.recent_approvals++;
            if (offer.status === 'rejected') stats.recent_rejections++;
          }
        }
      });

      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats,
        type: 'unknown' as const
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener estadísticas',
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
   * Lista ofertas con filtros opcionales (lanza excepción en error)
   * Si no se especifica status en filters, muestra todas las ofertas
   */
  async listPendingOffers(filters?: PendingOffersFilters) {
    const result = await adminOfferServiceInternal.listPendingOffers(filters);
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener ofertas');
    }
    return result.data;
  },

  /**
   * Aprueba una oferta (lanza excepción en error)
   */
  async approveOffer(id: number) {
    const request: ApproveRejectRequest = { decision: 'approved' as any };
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
      decision: 'rejected' as any, 
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
  },

  /**
   * Lista todas las ofertas con filtros avanzados (lanza excepción en error)
   */
  async listAllOffers(filters?: AllOffersFilters) {
    const result = await adminOfferServiceInternal.listAllOffers(filters);
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener ofertas');
    }
    return result.data;
  },

  /**
   * Obtiene estadísticas de ofertas (lanza excepción en error)
   */
  async getOfferStatistics() {
    const result = await adminOfferServiceInternal.getOfferStatistics();
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener estadísticas');
    }
    return result.data;
  },

  /**
   * Buscar todas las ofertas por término
   */
  async searchAllOffers(searchTerm: string, page = 1, limit = 10) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
    }

    return this.listAllOffers({
      search: searchTerm.trim(),
      page,
      limit
    });
  }
};

// Type para el servicio interno
export type AdminOfferServiceInternal = typeof adminOfferServiceInternal;