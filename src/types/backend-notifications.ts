/**
 * Tipos de datos para el sistema de notificaciones del backend
 * Estos tipos son diferentes a los del sistema local de notificaciones
 */

// Tipos de notificación del backend
export type BackendNotificationType = 
  | 'offer_status_change'
  | 'new_application' 
  | 'application_decision'
  | 'account_created';

/**
 * Interface para una notificación del backend
 */
export interface BackendNotification {
  id: number;
  user_id: number;
  type: BackendNotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string; // ISO 8601
}

/**
 * Interface para la respuesta de lista de notificaciones
 */
export interface NotificationListResponse {
  message: string;
  data: {
    notifications: BackendNotification[];
    unread_count: number;
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Interface para filtros de notificaciones
 */
export interface NotificationFilters {
  page?: number; // min: 1, default: 1
  limit?: number; // min: 5, max: 50, default: 20
  is_read?: boolean; // filtrar por leídas/no leídas
  type?: BackendNotificationType; // filtrar por tipo
}

/**
 * Interface para marcar notificación como leída
 */
export interface MarkReadResponse {
  message: string;
  data: {
    id: number;
    is_read: boolean;
    updated_at: string;
  };
}

/**
 * Interface para marcar todas como leídas
 */
export interface MarkAllReadResponse {
  message: string;
  data: {
    updated_count: number;
    updated_at: string;
  };
}

/**
 * Configuración de tipos de notificación para UI
 */
export const NOTIFICATION_TYPE_CONFIG = {
  offer_status_change: {
    label: 'Estado de Oferta',
    icon: 'FileCheck',
    color: 'text-blue-600',
    priority: 'high' as const,
  },
  new_application: {
    label: 'Nueva Postulación',
    icon: 'UserPlus',
    color: 'text-green-600',
    priority: 'high' as const,
  },
  application_decision: {
    label: 'Decisión de Postulación',
    icon: 'CheckCircle',
    color: 'text-purple-600',
    priority: 'high' as const,
  },
  account_created: {
    label: 'Cuenta Creada',
    icon: 'UserCheck',
    color: 'text-gray-600',
    priority: 'medium' as const,
  },
} as const;

/**
 * Interface para el estado del hook de notificaciones
 */
export interface BackendNotificationState {
  notifications: BackendNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  limit: number;
}

/**
 * Interface para acciones del hook de notificaciones
 */
export interface BackendNotificationActions {
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  getNotificationsByType: (type: string) => Promise<BackendNotification[]>;
  filterByType: (type: string) => BackendNotification[];
  getStats: () => { total: number; unread: number; byType: Record<string, number> };
}

/**
 * Union type para el hook completo
 */
export type UseBackendNotificationsReturn = BackendNotificationState & BackendNotificationActions;