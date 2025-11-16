/**
 * Componente para mostrar motivos de rechazo de ofertas
 * Incluye alertas visuales y acciones para corregir
 */

import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Edit,
  Send,
  Calendar,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RejectionReasonAlertProps {
  reason: string;
  rejectedAt?: string;
  adminName?: string;
  onEdit?: () => void;
  onResubmit?: () => void;
  className?: string;
  variant?: 'alert' | 'card';
  collapsible?: boolean;
}

/**
 * Componente principal para mostrar motivos de rechazo
 */
const RejectionReasonAlert: React.FC<RejectionReasonAlertProps> = ({
  reason,
  rejectedAt,
  adminName,
  onEdit,
  onResubmit,
  className = '',
  variant = 'alert',
  collapsible = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  /**
   * Formatea la fecha de rechazo
   */
  const formatRejectionDate = () => {
    if (!rejectedAt) return null;
    
    try {
      const date = new Date(rejectedAt);
      const timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: es });
      const formattedDate = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return { timeAgo, formattedDate };
    } catch {
      return null;
    }
  };

  const dateInfo = formatRejectionDate();

  /**
   * Renderiza la versión de alerta
   */
  const renderAlert = () => (
    <Alert variant="destructive" className={`border-red-200 bg-red-50 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 flex-1">
          <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
          <div className="flex-1 min-w-0">
            <AlertTitle className="text-red-800 text-sm font-semibold mb-2">
              Oferta Rechazada
            </AlertTitle>
            
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mb-2 text-red-700 hover:text-red-800 hover:bg-red-100 h-auto p-1"
              >
                <span className="text-xs mr-1">
                  {isExpanded ? 'Ocultar detalles' : 'Ver motivo del rechazo'}
                </span>
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            )}
            
            {isExpanded && (
              <AlertDescription className="text-red-800 space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Motivo del rechazo:</h4>
                  <div className="bg-red-100 p-3 rounded-md border border-red-200">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {reason}
                    </p>
                  </div>
                </div>
                
                {/* Información adicional */}
                {(dateInfo || adminName) && (
                  <div className="flex flex-wrap gap-3 text-xs text-red-700">
                    {dateInfo && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Rechazada {dateInfo.timeAgo}</span>
                      </div>
                    )}
                    {adminName && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Por: {adminName}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Instrucción sobre acciones disponibles */}
                <div className="bg-red-100 border-l-4 border-red-600 p-3 rounded">
                  <p className="text-xs text-red-700 font-medium">
                    💡 Puedes editar tu oferta y reenviarla usando los botones debajo de esta notificación.
                  </p>
                </div>
              </AlertDescription>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );

  /**
   * Renderiza la versión de tarjeta
   */
  const renderCard = () => (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-red-800 text-sm font-semibold flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          Oferta Rechazada
          <Badge variant="destructive" className="ml-auto text-xs">
            Requiere Atención
          </Badge>
        </CardTitle>
        
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-fit text-red-700 hover:text-red-800 hover:bg-red-100 h-auto p-1"
          >
            <span className="text-xs mr-1">
              {isExpanded ? 'Ocultar detalles' : 'Ver motivo del rechazo'}
            </span>
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <div>
            <h4 className="font-medium text-red-800 mb-2">Motivo del rechazo:</h4>
            <div className="bg-red-100 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-900 whitespace-pre-wrap leading-relaxed">
                {reason}
              </p>
            </div>
          </div>
          
          {/* Información adicional */}
          {(dateInfo || adminName) && (
            <div className="flex flex-wrap gap-4 text-sm text-red-700 bg-red-100 p-3 rounded-lg">
              {dateInfo && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <span className="font-medium">Rechazada:</span>
                    <span className="ml-1">{dateInfo.timeAgo}</span>
                    <span className="block text-xs text-red-600 mt-0.5">
                      {dateInfo.formattedDate}
                    </span>
                  </div>
                </div>
              )}
              {adminName && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <div>
                    <span className="font-medium">Revisado por:</span>
                    <span className="ml-1">{adminName}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Instrucción sobre acciones disponibles */}
          <div className="bg-red-100 border-l-4 border-red-600 p-3 rounded">
            <p className="text-xs text-red-700 font-medium">
              💡 Puedes editar tu oferta y reenviarla usando los botones debajo de esta notificación.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return variant === 'card' ? renderCard() : renderAlert();
};

/**
 * Componente simplificado para mostrar solo el motivo
 */
interface SimpleRejectionReasonProps {
  reason: string;
  className?: string;
}

export const SimpleRejectionReason: React.FC<SimpleRejectionReasonProps> = ({
  reason,
  className = ''
}) => (
  <div className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}>
    <div className="flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="text-sm font-medium text-red-800 mb-1">
          Motivo del rechazo:
        </h4>
        <p className="text-sm text-red-700 whitespace-pre-wrap leading-relaxed">
          {reason}
        </p>
      </div>
    </div>
  </div>
);

/**
 * Hook para manejar el estado de rechazo
 */
export const useRejectionHandling = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  const handleEdit = async (editCallback?: () => Promise<void>) => {
    setIsEditing(true);
    try {
      if (editCallback) {
        await editCallback();
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleResubmit = async (resubmitCallback?: () => Promise<void>) => {
    setIsResubmitting(true);
    try {
      if (resubmitCallback) {
        await resubmitCallback();
      }
    } finally {
      setIsResubmitting(false);
    }
  };

  return {
    isEditing,
    isResubmitting,
    handleEdit,
    handleResubmit,
  };
};

export default RejectionReasonAlert;