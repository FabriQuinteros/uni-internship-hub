/**
 * Centro de notificaciones integrado con el backend
 * Reemplaza el sistema local con llamadas a la API
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  RefreshCw,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useBackendNotifications } from '@/hooks/use-backend-notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import BackendNotificationItem from './BackendNotificationItem';
import { NOTIFICATION_TYPE_CONFIG } from '@/types/backend-notifications';

/**
 * Centro de notificaciones principal integrado con backend
 */
export const BackendNotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh,
    clearError
  } = useBackendNotifications();

  const [isOpen, setIsOpen] = useState(false);

  /**
   * Maneja la carga de más notificaciones
   */
  const handleLoadMore = async () => {
    if (!loading && hasMore) {
      await loadMore();
    }
  };

  /**
   * Componente de skeleton para carga
   */
  const LoadingSkeleton = () => (
    <div className="space-y-3 p-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start space-x-3">
          <Skeleton className="h-4 w-4 rounded-full mt-1" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * Estado vacío
   */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-medium text-foreground mb-2">Sin notificaciones</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Te avisaremos cuando tengas algo nuevo
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={refresh}
        disabled={loading}
        className="text-primary hover:text-primary/80"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Actualizar
      </Button>
    </div>
  );

  /**
   * Estado de error
   */
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="font-medium text-foreground mb-2">Error al cargar</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {error || 'No se pudieron cargar las notificaciones'}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={clearError}
        >
          Cerrar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Reintentar
        </Button>
      </div>
    </div>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 md:h-9 md:w-9 rounded-full"
          aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} sin leer)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[10px] md:text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[calc(100vw-2rem)] max-w-sm md:w-96 p-0"
        sideOffset={8}
      >
        {/* Header del panel */}
        <div className="flex items-center justify-between p-3 md:p-4 pb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm md:text-base text-foreground">Notificaciones</h3>
            {loading && (
              <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-[10px] md:text-xs">
              {unreadCount} sin leer
            </Badge>
          )}
        </div>

        {/* Acciones globales */}
        {!error && notifications.length > 0 && (
          <div className="flex items-center gap-2 px-3 md:px-4 pb-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] md:text-xs h-7"
                onClick={markAllAsRead}
                disabled={loading}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Marcar todas como leídas</span>
                <span className="sm:hidden">Marcar todas</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] md:text-xs h-7"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        )}

        <Separator />

        {/* Contenido principal */}
        <ScrollArea className="h-96">
          {error ? (
            <ErrorState />
          ) : loading && notifications.length === 0 ? (
            <LoadingSkeleton />
          ) : notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Lista de notificaciones */}
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <BackendNotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsRead(notification.id)}
                  />
                ))}
              </div>

              {/* Botón cargar más */}
              {hasMore && (
                <>
                  <Separator className="my-2" />
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Cargando...
                        </div>
                      ) : (
                        'Cargar más notificaciones'
                      )}
                    </Button>
                  </div>
                </>
              )}

              {/* Indicador fin de lista */}
              {!hasMore && notifications.length > 10 && (
                <div className="text-center p-4">
                  <p className="text-xs text-muted-foreground">
                    Has visto todas las notificaciones recientes
                  </p>
                </div>
              )}
            </>
          )}
        </ScrollArea>

        {/* Footer con estadísticas */}  
        {!error && notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3 bg-muted/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {notifications.length} de {notifications.length + (hasMore ? '+' : '')} total
                </span>
                <span>
                  Actualizado {formatDistanceToNow(new Date(), { addSuffix: true, locale: es })}
                </span>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BackendNotificationCenter;