/**
 * Componente individual para notificaciones del backend
 * Maneja diferentes tipos de notificación con iconos y estilos específicos
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  FileCheck,
  UserPlus,
  CheckCircle,
  UserCheck,
  AlertCircle,
  Clock
} from 'lucide-react';
import { BackendNotification, NOTIFICATION_TYPE_CONFIG } from '@/types/backend-notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface BackendNotificationItemProps {
  notification: BackendNotification;
  onMarkAsRead: () => void;
}

/**
 * Mapeo de iconos por tipo de notificación
 */
const getNotificationIcon = (type: BackendNotification['type']) => {
  const iconMap = {
    offer_status_change: FileCheck,
    new_application: UserPlus,
    application_decision: CheckCircle,
    account_created: UserCheck,
  };
  
  return iconMap[type] || AlertCircle;
};

/**
 * Obtiene el color del icono por tipo
 */
const getIconColor = (type: BackendNotification['type']) => {
  const config = NOTIFICATION_TYPE_CONFIG[type] || NOTIFICATION_TYPE_CONFIG.account_created;
  return config.color;
};

/**
 * Obtiene el color de prioridad para el borde
 */
const getPriorityBorderColor = (type: BackendNotification['type']) => {
  const config = NOTIFICATION_TYPE_CONFIG[type] || NOTIFICATION_TYPE_CONFIG.account_created;
  
  const priorityColors = {
    high: 'border-l-red-400',
    medium: 'border-l-yellow-400',
    low: 'border-l-gray-400',
  };
  
  return priorityColors[config.priority];
};

/**
 * Obtiene mensaje contextual basado en el tipo
 */
const getContextMessage = (type: BackendNotification['type']) => {
  const messages = {
    offer_status_change: 'Estado de oferta actualizado',
    new_application: 'Nueva postulación recibida',
    application_decision: 'Decisión sobre postulación',
    account_created: 'Bienvenido al sistema',
  };
  
  return messages[type] || 'Notificación';
};

/**
 * Componente individual de notificación del backend
 */
const BackendNotificationItem: React.FC<BackendNotificationItemProps> = ({
  notification,
  onMarkAsRead
}) => {
  const Icon = getNotificationIcon(notification.type);
  const iconColor = getIconColor(notification.type);
  const borderColor = getPriorityBorderColor(notification.type);
  const contextMessage = getContextMessage(notification.type);
  
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: es
  });

  /**
   * Determina el estilo del fondo basado en si está leída
   */
  const getBackgroundStyle = () => {
    if (notification.is_read) {
      return 'bg-background hover:bg-muted/30';
    } else {
      return 'bg-blue-50/50 hover:bg-blue-50/80 border-l-4 ' + borderColor;
    }
  };

  return (
    <div className={`
      p-3 transition-colors cursor-pointer group
      ${getBackgroundStyle()}
    `}>
      <div className="flex items-start justify-between space-x-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Icono de tipo de notificación */}
          <div className={`
            flex-shrink-0 mt-0.5 p-1.5 rounded-full
            ${notification.is_read ? 'bg-muted' : 'bg-white shadow-sm'}
          `}>
            <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header con título y indicador de no leída */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-foreground line-clamp-1">
                {notification.title}
              </h4>
              {!notification.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>
            
            {/* Mensaje de la notificación */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {notification.message}
            </p>
            
            {/* Footer con metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className="text-xs px-1.5 py-0.5 h-auto"
                >
                  {contextMessage}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {timeAgo}
                </span>
              </div>
              
              {/* Indicador de tiempo para notificaciones recientes */}
              {Date.now() - new Date(notification.created_at).getTime() < 24 * 60 * 60 * 1000 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                  <Clock className="h-2.5 w-2.5 mr-1" />
                  Nuevo
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.is_read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead();
              }}
              title="Marcar como leída"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Contenido expandido para notificaciones específicas */}
      {notification.type === 'offer_status_change' && !notification.is_read && (
        <div className="mt-3 p-2 bg-blue-100 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-blue-600" />
            <p className="text-xs text-blue-800 font-medium">
              Revisa el estado actualizado de tu oferta
            </p>
          </div>
        </div>
      )}
      
      {notification.type === 'new_application' && !notification.is_read && (
        <div className="mt-3 p-2 bg-green-100 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-green-600" />
            <p className="text-xs text-green-800 font-medium">
              Un nuevo estudiante se ha postulado
            </p>
          </div>
        </div>
      )}
      
      {notification.type === 'application_decision' && !notification.is_read && (
        <div className="mt-3 p-2 bg-purple-100 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <p className="text-xs text-purple-800 font-medium">
              Se ha tomado una decisión sobre tu postulación
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendNotificationItem;