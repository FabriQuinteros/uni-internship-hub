/**
 * Servicio para gestión de postulaciones de estudiantes
 * Maneja la aplicación a ofertas y operaciones relacionadas
 */

import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';
import { ApiHandlerResult } from '@/types/api';

/**
 * Request para postularse a una oferta
 */
export interface ApplyToOfferRequest {
  message?: string; // Mensaje opcional del estudiante
}

/**
 * Respuesta al postularse a una oferta
 */
export interface ApplyToOfferResponse {
  message: string;
  data: {
    application_id: number;
    offer_id: number;
    offer_title: string;
    status: string;
    applied_at: string;
    message: string;
  };
}

/**
 * Servicio interno con manejo de errores via ApiHandlerResult
 */
const applicationServiceInternal = {
  /**
   * Postularse a una oferta
   * @param offerId - ID de la oferta
   * @param data - Datos de la postulación (mensaje opcional)
   * @returns Resultado de la operación
   */
  async applyToOffer(
    offerId: number,
    data?: ApplyToOfferRequest
  ): Promise<ApiHandlerResult<ApplyToOfferResponse['data']>> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.OFFERS.APPLY(offerId)}`;
      
      const response = await httpClient.post(url, data || {});
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || errorData.message || '';
        
        // Manejar errores específicos del backend
        if (response.status === 409) {
          if (errorMsg.includes('already applied')) {
            return {
              success: false,
              message: 'Ya te postulaste a esta oferta anteriormente',
              error: errorMsg,
              type: 'conflict' as const,
              data: undefined
            };
          }
          
          if (errorMsg.includes('quota is full')) {
            return {
              success: false,
              message: 'Lo sentimos, no hay cupos disponibles para esta oferta',
              error: errorMsg,
              type: 'conflict' as const,
              data: undefined
            };
          }
          
          if (errorMsg.includes('deadline has passed')) {
            return {
              success: false,
              message: 'La fecha límite de postulación ha vencido',
              error: errorMsg,
              type: 'conflict' as const,
              data: undefined
            };
          }
          
          if (errorMsg.includes('not available')) {
            return {
              success: false,
              message: 'Esta oferta no está disponible para postulaciones en este momento',
              error: errorMsg,
              type: 'conflict' as const,
              data: undefined
            };
          }
          
          return {
            success: false,
            message: 'No se pudo procesar tu postulación. Verifica los requisitos.',
            error: errorMsg,
            type: 'conflict' as const,
            data: undefined
          };
        }
        
        if (response.status === 404) {
          return {
            success: false,
            message: 'La oferta que buscas no existe o fue eliminada',
            error: errorData.error || 'Oferta no encontrada',
            type: 'not_found' as const,
            data: undefined
          };
        }
        
        if (response.status === 400) {
          // Errores de validación o problemas con los datos
          if (errorMsg.includes('existing application')) {
            return {
              success: false,
              message: 'Ya tienes una postulación registrada para esta oferta',
              error: errorMsg,
              type: 'validation_error' as const,
              data: undefined
            };
          }
          
          if (errorMsg.includes('profile')) {
            return {
              success: false,
              message: 'Debes completar tu perfil antes de postularte',
              error: errorMsg,
              type: 'validation_error' as const,
              data: undefined
            };
          }
          
          return {
            success: false,
            message: 'Hubo un problema al procesar tu postulación. Por favor, verifica tu información.',
            error: errorMsg,
            type: 'validation_error' as const,
            data: undefined
          };
        }
        
        if (response.status === 403) {
          return {
            success: false,
            message: 'No tienes permisos para postularte a esta oferta',
            error: errorMsg,
            type: 'forbidden' as const,
            data: undefined
          };
        }
        
        if (response.status >= 500) {
          return {
            success: false,
            message: 'Error en el servidor. Por favor, intenta nuevamente más tarde.',
            error: errorMsg,
            type: 'server_error' as const,
            data: undefined
          };
        }
        
        return {
          success: false,
          message: 'No se pudo completar tu postulación. Por favor, intenta nuevamente.',
          error: errorMsg,
          type: 'server_error' as const,
          data: undefined
        };
      }
      
      const result = await response.json() as ApplyToOfferResponse;
      
      return {
        success: true,
        message: result.message || 'Postulación enviada exitosamente',
        data: result.data,
        type: 'unknown' as const
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al postularse a la oferta',
        error: error instanceof Error ? error.message : 'Error desconocido',
        type: 'server_error' as const,
        data: undefined
      };
    }
  }
};

/**
 * Servicio público con manejo de errores via throw
 * Usado por los hooks y componentes
 */
export const applicationService = {
  /**
   * Postularse a una oferta (lanza excepción en error)
   */
  async applyToOffer(offerId: number, data?: ApplyToOfferRequest) {
    const result = await applicationServiceInternal.applyToOffer(offerId, data);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result.data;
  }
};

// Type para el servicio interno
export type ApplicationServiceInternal = typeof applicationServiceInternal;

// Export por defecto del servicio público
export default applicationService;
