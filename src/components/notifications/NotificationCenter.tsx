import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  X
} from 'lucide-react';
import { useNotifications, type Notification, type NotificationType } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Mapeo de iconos según el tipo de notificación
 */
const getNotificationIcon = (type: NotificationType) => {
  const iconMap = {
    success: <Check className="h-4 w-4 text-success" />,
    error: <AlertCircle className="h-4 w-4 text-destructive" />,
    warning: <AlertTriangle className="h-4 w-4 text-warning" />,
    info: <Info className="h-4 w-4 text-primary" />,
  };
  return iconMap[type];
};

/**
 * Mapeo de colores de borde según la prioridad
 */
const getPriorityBorderColor = (priority: string) => {
  const colorMap = {
    high: 'border-l-destructive',
    medium: 'border-l-warning',
    low: 'border-l-muted-foreground',
  };
  return colorMap[priority as keyof typeof colorMap] || 'border-l-muted-foreground';
};

/**
 * Componente individual para mostrar una notificación
 * @param notification - Datos de la notificación
 * @param onMarkAsRead - Función para marcar como leída
 * @param onRemove - Función para eliminar la notificación
 */
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onRemove,
}) => {
  const timeAgo = formatDistanceToNow(notification.timestamp, {
    addSuffix: true,
    locale: es,
  });

  return (
    <div
      className={`
        p-3 border-l-4 ${getPriorityBorderColor(notification.priority)}
        ${!notification.read ? 'bg-muted/30' : 'bg-background'}
        hover:bg-muted/50 transition-colors
      `}
    >
      <div className="flex items-start justify-between space-x-2">
        <div className="flex items-start space-x-2 flex-1">
          {getNotificationIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-foreground truncate">
                {notification.title}
              </h4>
              {!notification.read && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {timeAgo}
            </p>
          </div>
        </div>

        {/* Acciones de la notificación */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onMarkAsRead(notification.id)}
              title="Marcar como leída"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(notification.id)}
            title="Eliminar notificación"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente principal del centro de notificaciones
 * Maneja la visualización y gestión de todas las notificaciones del usuario
 */
export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isOpen,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    togglePanel,
  } = useNotifications();

  /**
   * Filtra las notificaciones más recientes (últimas 50)
   * para evitar problemas de rendimiento
   */
  const recentNotifications = notifications.slice(0, 50);

  return (
    <DropdownMenu open={isOpen} onOpenChange={togglePanel}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 rounded-full"
          aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} sin leer)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        {/* Header del panel */}
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-semibold text-foreground">Notificaciones</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} sin leer
            </Badge>
          )}
        </div>

        {/* Acciones globales */}
        {notifications.length > 0 && (
          <div className="flex items-center space-x-2 px-4 pb-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas como leídas
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-muted-foreground hover:text-destructive"
              onClick={clearAll}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Limpiar todo
            </Button>
          </div>
        )}

        <Separator />

        {/* Lista de notificaciones */}
        <ScrollArea className="h-96">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No tienes notificaciones
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Te avisaremos cuando algo importante suceda
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onRemove={removeNotification}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer con enlace a ver todas */}
        {notifications.length > 50 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;