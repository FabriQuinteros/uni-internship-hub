import { create } from 'zustand';
import { toast } from '@/hooks/use-toast';

/**
 * Tipos de notificaciones disponibles en el sistema
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Prioridad de las notificaciones
 */
export type NotificationPriority = 'high' | 'medium' | 'low';

/**
 * Interfaz para una notificación individual
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  userId?: string;
  actionUrl?: string;
}

/**
 * Estado global para el sistema de notificaciones
 */
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
}

/**
 * Acciones disponibles para el sistema de notificaciones
 */
interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  togglePanel: () => void;
  showToast: (notification: Pick<Notification, 'title' | 'message' | 'type'>) => void;
}

/**
 * Hook personalizado para gestionar notificaciones
 * Proporciona funcionalidades para crear, leer, actualizar y eliminar notificaciones
 */
export const useNotifications = create<NotificationState & NotificationActions>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,

  /**
   * Agrega una nueva notificación al sistema
   * @param notification - Datos de la notificación sin ID, timestamp y estado read
   */
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    // Mostrar toast automáticamente para notificaciones de alta prioridad
    if (notification.priority === 'high') {
      get().showToast(notification);
    }
  },

  /**
   * Marca una notificación específica como leída
   * @param id - ID de la notificación a marcar como leída
   */
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
      unreadCount: 0,
    }));
  },

  /**
   * Elimina una notificación específica del sistema
   * @param id - ID de la notificación a eliminar
   */
  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      const wasUnread = notification && !notification.read;
      
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  /**
   * Elimina todas las notificaciones del sistema
   */
  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },

  /**
   * Alterna el estado del panel de notificaciones
   */
  togglePanel: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  /**
   * Muestra un toast notification
   * @param notification - Datos básicos de la notificación para el toast
   */
  showToast: ({ title, message, type }) => {
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  },
}));

/**
 * Hook simplificado para acciones comunes de notificaciones
 * Proporciona funciones de conveniencia para casos de uso frecuentes
 */
export const useNotificationActions = () => {
  const { addNotification, showToast } = useNotifications();

  /**
   * Notifica sobre una postulación exitosa
   * @param companyName - Nombre de la empresa
   * @param positionTitle - Título de la posición
   */
  const notifyApplicationSuccess = (companyName: string, positionTitle: string) => {
    addNotification({
      title: 'Postulación Enviada',
      message: `Tu postulación para ${positionTitle} en ${companyName} ha sido enviada exitosamente.`,
      type: 'success',
      priority: 'high',
    });
  };

  /**
   * Notifica sobre una nueva oferta disponible
   * @param positionTitle - Título de la posición
   * @param companyName - Nombre de la empresa
   */
  const notifyNewOffer = (positionTitle: string, companyName: string) => {
    addNotification({
      title: 'Nueva Oferta Disponible',
      message: `Se ha publicado una nueva oferta: ${positionTitle} en ${companyName}`,
      type: 'info',
      priority: 'medium',
    });
  };

  /**
   * Notifica sobre un cambio de estado en una postulación
   * @param status - Nuevo estado de la postulación
   * @param positionTitle - Título de la posición
   * @param companyName - Nombre de la empresa
   */
  const notifyApplicationStatusChange = (
    status: 'accepted' | 'rejected' | 'pending',
    positionTitle: string,
    companyName: string
  ) => {
    const statusMessages = {
      accepted: { message: 'ha sido aceptada', type: 'success' as const },
      rejected: { message: 'ha sido rechazada', type: 'error' as const },
      pending: { message: 'está en revisión', type: 'info' as const },
    };

    const { message, type } = statusMessages[status];

    addNotification({
      title: 'Estado de Postulación',
      message: `Tu postulación para ${positionTitle} en ${companyName} ${message}.`,
      type,
      priority: 'high',
    });
  };

  /**
   * Notifica sobre errores del sistema
   * @param message - Mensaje de error
   */
  const notifyError = (message: string) => {
    showToast({
      title: 'Error',
      message,
      type: 'error',
    });
  };

  /**
   * Notifica sobre acciones exitosas
   * @param message - Mensaje de éxito
   */
  const notifySuccess = (message: string) => {
    showToast({
      title: 'Éxito',
      message,
      type: 'success',
    });
  };

  return {
    notifyApplicationSuccess,
    notifyNewOffer,
    notifyApplicationStatusChange,
    notifyError,
    notifySuccess,
  };
};