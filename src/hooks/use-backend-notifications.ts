/**
 * Hook para gestión de notificaciones del backend
 * Reemplaza el sistema local de notificaciones con integración al API
 */

import { useState, useCallback, useEffect } from 'react';
import { notificationService } from '@/services/backendNotificationService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  BackendNotification,
  NotificationFilters,
  UseBackendNotificationsReturn
} from '@/types/backend-notifications';

/**
 * Hook principal para notificaciones del backend
 */
export const useBackendNotifications = (): UseBackendNotificationsReturn => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estado principal
  const [state, setState] = useState({
    notifications: [] as BackendNotification[],
    unreadCount: 0,
    loading: false,
    error: null as string | null,
    hasMore: true,
    page: 1,
    limit: 20,
  });

  /**
   * Actualiza el estado de forma inmutable
   */
  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Obtiene las notificaciones con filtros
   */
  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    if (!user) {
      updateState({ error: 'Usuario no autenticado' });
      return;
    }

    const finalFilters = { 
      page: 1, 
      limit: state.limit,
      ...filters 
    };

    updateState({ loading: true, error: null });

    try {
      const data = await notificationService.getNotifications(finalFilters);
      
      updateState({
        notifications: data?.notifications || [],
        unreadCount: data?.unread_count || 0,
        page: data?.page || 1,
        hasMore: (data?.notifications?.length || 0) >= finalFilters.limit,
        loading: false
      });
      
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cargar notificaciones';
      updateState({ 
        error: errorMessage, 
        loading: false 
      });
      
      // Solo mostrar toast para errores críticos
      if (!error.message?.includes('no autenticado')) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  }, [user, state.limit, updateState, toast]);

  /**
   * Marca una notificación como leída
   */
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      
      // Actualizar estado local
      updateState({
        notifications: state.notifications.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      });
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al marcar notificación como leída',
        variant: 'destructive',
      });
    }
  }, [state.notifications, state.unreadCount, updateState, toast]);

  /**
   * Marca todas las notificaciones como leídas
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Actualizar estado local
      updateState({
        notifications: state.notifications.map(notif => ({ ...notif, is_read: true })),
        unreadCount: 0
      });
      
      toast({
        title: 'Éxito',
        description: 'Todas las notificaciones han sido marcadas como leídas',
        variant: 'default',
      });
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al marcar todas las notificaciones como leídas',
        variant: 'destructive',
      });
    }
  }, [state.notifications, updateState, toast]);

  /**
   * Carga más notificaciones (paginación)
   */
  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    updateState({ loading: true, error: null });

    try {
      const data = await notificationService.getNotifications({
        page: state.page + 1,
        limit: state.limit
      });
      
      const newNotifications = data?.notifications || [];
      
      updateState({
        notifications: [...state.notifications, ...newNotifications],
        page: state.page + 1,
        hasMore: newNotifications.length >= state.limit,
        loading: false
      });
      
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cargar más notificaciones';
      updateState({ 
        error: errorMessage, 
        loading: false 
      });
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [state.loading, state.hasMore, state.notifications, state.page, state.limit, updateState, toast]);

  /**
   * Refresca las notificaciones (vuelve a la página 1)
   */
  const refresh = useCallback(async () => {
    updateState({ page: 1, hasMore: true });
    await fetchNotifications({ page: 1, limit: state.limit });
  }, [fetchNotifications, state.limit, updateState]);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  /**
   * Obtiene solo el conteo de notificaciones no leídas
   */
  const refreshUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const count = await notificationService.getUnreadCount();
      updateState({ unreadCount: count });
    } catch (error) {
      // Silently fail - no necesitamos mostrar error para esto
      console.warn('Error al obtener conteo de notificaciones:', error);
    }
  }, [user, updateState]);

  /**
   * Obtiene notificaciones por tipo específico
   */
  const getNotificationsByType = useCallback(async (type: string) => {
    return notificationService.getNotificationsByType(type);
  }, []);

  /**
   * Filtra notificaciones por tipo en el estado local
   */
  const filterByType = useCallback((type: string) => {
    return state.notifications.filter(notif => notif.type === type);
  }, [state.notifications]);

  /**
   * Obtiene estadísticas de notificaciones
   */
  const getStats = useCallback(() => {
    const total = state.notifications.length;
    const unread = state.notifications.filter(n => !n.is_read).length;
    const byType = state.notifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unread,
      read: total - unread,
      byType
    };
  }, [state.notifications]);

  // Carga inicial cuando hay usuario
  useEffect(() => {
    if (user && state.notifications.length === 0 && !state.loading) {
      fetchNotifications();
    }
  }, [user]); // Solo cuando cambia el usuario

  // Polling para actualizaciones periódicas (cada 5 minutos)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user, refreshUnreadCount]);

  return {
    // Estado
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    page: state.page,
    limit: state.limit,
    
    // Acciones
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh,
    clearError,
    
    // Utilidades adicionales
    getNotificationsByType,
    filterByType,
    getStats,
  };
};

/**
 * Hook simplificado solo para el conteo de notificaciones no leídas
 * Útil para badges en la UI
 */
export const useUnreadNotificationsCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const updateUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.warn('Error al obtener conteo de notificaciones:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    updateUnreadCount();
    
    // Actualizar cada 2 minutos
    const interval = setInterval(updateUnreadCount, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateUnreadCount]);

  return { unreadCount, loading, refresh: updateUnreadCount };
};