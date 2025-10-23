/**
 * Servicio para gestión de ofertas visibles para estudiantes
 * Maneja el listado de ofertas aprobadas y detalles
 */

import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';
import { ApiHandlerResult } from '@/types/api';
import {
  StudentOffer,
  StudentOfferDetail,
  StudentOffersResponse,
  StudentOfferDetailResponse,
  StudentOffersFilters
} from '@/types/student-offers';

/**
 * Servicio interno con manejo de errores via ApiHandlerResult
 */
const studentOfferServiceInternal = {
  /**
   * Lista las ofertas aprobadas disponibles para postulación
   * @param filters - Filtros de búsqueda y paginación
   * @returns Lista paginada de ofertas aprobadas
   */
  async listOffers(filters?: StudentOffersFilters): Promise<ApiHandlerResult<StudentOffersResponse['data']>> {
    try {
      const url = new URL(API_CONFIG.ENDPOINTS.STUDENTS.OFFERS.LIST, API_CONFIG.BASE_URL);
      
      // Agregar parámetros de query
      if (filters?.page) url.searchParams.append('page', String(filters.page));
      if (filters?.limit) url.searchParams.append('limit', String(filters.limit));
      if (filters?.search) url.searchParams.append('search', filters.search);
      if (filters?.technology_id) url.searchParams.append('technology_id', String(filters.technology_id));
      if (filters?.modality_id) url.searchParams.append('modality_id', String(filters.modality_id));
      if (filters?.location_id) url.searchParams.append('location_id', String(filters.location_id));
      if (filters?.position_id) url.searchParams.append('position_id', String(filters.position_id));

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
      
      const result = await response.json() as StudentOffersResponse;
      
      // El backend devuelve: { message, data: { offers, page, limit, total_count, total_pages } }
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
   * Obtiene los detalles completos de una oferta aprobada
   * @param id - ID de la oferta
   * @returns Detalles completos de la oferta
   */
  async getOfferDetail(id: number): Promise<ApiHandlerResult<StudentOfferDetail>> {
    try {
      const response = await httpClient.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.OFFERS.DETAILS(id)}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            message: 'Oferta no encontrada',
            error: 'La oferta no existe o no está disponible para postulación',
            type: 'not_found' as const,
            data: undefined
          };
        }
        
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al obtener detalles de la oferta`,
          type: 'server_error' as const,
          data: undefined
        };
      }
      
      const result = await response.json() as StudentOfferDetailResponse;
      
      // El backend devuelve: { message, data: { offer } }
      return {
        success: true,
        message: result.message || 'Detalles obtenidos exitosamente',
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
};

/**
 * Servicio público con manejo de errores via throw
 * Usado por los hooks y componentes
 */
export const studentOfferService = {
  /**
   * Lista ofertas aprobadas (lanza excepción en error)
   */
  async listOffers(filters?: StudentOffersFilters) {
    const result = await studentOfferServiceInternal.listOffers(filters);
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener ofertas');
    }
    if (!result.data) {
      throw new Error('No se recibieron datos del servidor');
    }
    return result.data;
  },

  /**
   * Obtiene detalles de una oferta (lanza excepción en error)
   */
  async getOfferDetail(id: number) {
    const result = await studentOfferServiceInternal.getOfferDetail(id);
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener detalles de la oferta');
    }
    if (!result.data) {
      throw new Error('Oferta no encontrada');
    }
    return result.data;
  },

  /**
   * Buscar ofertas por término
   */
  async searchOffers(searchTerm: string, page = 1, limit = 10) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
    }

    return this.listOffers({
      search: searchTerm.trim(),
      page,
      limit
    });
  },
};

// Type para el servicio interno
export type StudentOfferServiceInternal = typeof studentOfferServiceInternal;
