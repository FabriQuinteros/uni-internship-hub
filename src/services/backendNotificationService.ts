/**
 * Servicio para gestión de notificaciones del backend
 * Reemplaza el sistema local con integración al API del backend
 */

import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';
import { ApiHandlerResult } from '@/types/api';
import {
  BackendNotification,
  NotificationListResponse,
  NotificationFilters,
  MarkReadResponse,
  MarkAllReadResponse
} from '@/types/backend-notifications';

/**
 * Servicio interno con manejo de errores via ApiHandlerResult
 */
const notificationServiceInternal = {
  /**
   * Obtiene la lista de notificaciones del usuario actual
   * @param filters - Filtros de búsqueda y paginación
   * @returns Lista paginada de notificaciones
   */
  async getNotifications(filters?: NotificationFilters): Promise<ApiHandlerResult<NotificationListResponse['data']>> {
    try {
      const url = new URL(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST, API_CONFIG.BASE_URL);
      
      // Agregar parámetros de query
      if (filters?.page) url.searchParams.append('page', String(filters.page));
      if (filters?.limit) url.searchParams.append('limit', String(filters.limit));
      if (filters?.is_read !== undefined) url.searchParams.append('is_read', String(filters.is_read));
      if (filters?.type) url.searchParams.append('type', filters.type);

      const response = await httpClient.get(url.toString());
      
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al obtener notificaciones`,
          type: 'server_error' as const,
          data: undefined
        };
      }
      
      const result = await response.json() as NotificationListResponse;
      
      return {
        success: true,
        message: 'Notificaciones obtenidas exitosamente',
        data: result.data,
        type: 'unknown' as const
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener notificaciones',
        error: error instanceof Error ? error.message : 'Error desconocido',
        type: 'server_error' as const,
        data: undefined
      };
    }
  },

  /**
   * Marca una notificación específica como leída
   * @param id - ID de la notificación
   * @returns Resultado de la operación
   */
  async markAsRead(id: number): Promise<ApiHandlerResult<MarkReadResponse['data']>> {
    try {
      const response = await httpClient.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(id)}`);
      
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al marcar notificación como leída`,
          type: 'server_error' as const,
          data: undefined
        };
      }
      
      const result = await response.json() as MarkReadResponse;
      
      return {
        success: true,
        message: 'Notificación marcada como leída',
        data: result.data,
        type: 'unknown' as const
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al marcar notificación como leída',
        error: error instanceof Error ? error.message : 'Error desconocido',
        type: 'server_error' as const,
        data: undefined
      };
    }
  },

  /**
   * Marca todas las notificaciones como leídas
   * @returns Resultado de la operación con conteo de notificaciones actualizadas
   */
  async markAllAsRead(): Promise<ApiHandlerResult<MarkAllReadResponse['data']>> {
    try {
      const response = await httpClient.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ}`);
      
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          error: `Error al marcar todas las notificaciones como leídas`,
          type: 'server_error' as const,
          data: undefined
        };
      }
      
      const result = await response.json() as MarkAllReadResponse;
      
      return {
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
        data: result.data,
        type: 'unknown' as const
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al marcar todas las notificaciones como leídas',
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
export const notificationService = {
  /**
   * Obtiene notificaciones (lanza excepción en error)
   */
  async getNotifications(filters?: NotificationFilters) {
    const result = await notificationServiceInternal.getNotifications(filters);
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener notificaciones');
    }
    return result.data;
  },

  /**
   * Marca notificación como leída (lanza excepción en error)
   */
  async markAsRead(id: number) {
    if (!id || id <= 0) {
      throw new Error('ID de notificación inválido');
    }

    const result = await notificationServiceInternal.markAsRead(id);
    if (!result.success) {
      throw new Error(result.message || 'Error al marcar notificación como leída');
    }
    return result.data;
  },

  /**
   * Marca todas las notificaciones como leídas (lanza excepción en error)
   */
  async markAllAsRead() {
    const result = await notificationServiceInternal.markAllAsRead();
    if (!result.success) {
      throw new Error(result.message || 'Error al marcar todas las notificaciones como leídas');
    }
    return result.data;
  },

  /**
   * Obtiene solo el conteo de notificaciones no leídas
   */
  async getUnreadCount(): Promise<number> {
    try {
      const data = await this.getNotifications({ page: 1, limit: 1, is_read: false });
      return data?.unread_count || 0;
    } catch (error) {
      console.warn('Error obteniendo conteo de notificaciones no leídas:', error);
      return 0;
    }
  },

  /**
   * Obtiene solo las notificaciones no leídas
   */
  async getUnreadNotifications(page = 1, limit = 20) {
    return this.getNotifications({ 
      page, 
      limit, 
      is_read: false 
    });
  },

  /**
   * Obtiene notificaciones por tipo específico
   */
  async getNotificationsByType(type: string, page = 1, limit = 20) {
    return this.getNotifications({ 
      page, 
      limit, 
      type: type as any // Cast porque el tipo es más específico en el backend
    });
  },

  /**
   * Refresca las notificaciones más recientes
   */
  async getRecentNotifications(limit = 10) {
    return this.getNotifications({ 
      page: 1, 
      limit 
    });
  }
};

// Type para el servicio interno
export type NotificationServiceInternal = typeof notificationServiceInternal;