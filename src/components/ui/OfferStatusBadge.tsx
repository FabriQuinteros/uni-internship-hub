/**
 * Componente para mostrar el estado visual de las ofertas
 * Incluye diferentes colores y estilos según el estado
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Archive,
  AlertCircle
} from 'lucide-react';
import { OfferStatus, OFFER_STATUS_CONFIG } from '@/types/api';

interface OfferStatusBadgeProps {
  status: OfferStatus;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Mapeo de iconos por estado
 */
const getStatusIcon = (status: OfferStatus) => {
  const iconMap = {
    draft: FileText,
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    closed: Archive,
  };
  
  return iconMap[status] || AlertCircle;
};

/**
 * Componente de badge para estado de oferta
 */
const OfferStatusBadge: React.FC<OfferStatusBadgeProps> = ({
  status,
  showDescription = false,
  size = 'md',
  className = ''
}) => {
  const config = OFFER_STATUS_CONFIG[status];
  const Icon = getStatusIcon(status);
  
  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        <AlertCircle className="h-3 w-3 mr-1" />
        Estado Desconocido
      </Badge>
    );
  }

  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      badge: 'text-xs px-2 py-0.5',
      icon: 'h-3 w-3',
      gap: 'gap-1'
    },
    md: {
      badge: 'text-sm px-2.5 py-1',
      icon: 'h-3.5 w-3.5',
      gap: 'gap-1.5'
    },
    lg: {
      badge: 'text-base px-3 py-1.5',
      icon: 'h-4 w-4',
      gap: 'gap-2'
    }
  };

  const sizeClasses = sizeConfig[size];

  return (
    <div className={`flex flex-col ${className}`}>
      <Badge 
        variant={config.variant} 
        className={`
          flex items-center ${sizeClasses.gap} ${sizeClasses.badge}
          transition-all duration-200 hover:scale-105
        `}
      >
        <Icon className={sizeClasses.icon} />
        {config.label}
      </Badge>
      
      {showDescription && (
        <p className="text-xs text-muted-foreground mt-1">
          {config.description}
        </p>
      )}
    </div>
  );
};

/**
 * Componente extendido con información adicional
 */
interface OfferStatusCardProps extends OfferStatusBadgeProps {
  title?: string;
  showVisibilityInfo?: boolean;
  showActionHints?: boolean;
}

export const OfferStatusCard: React.FC<OfferStatusCardProps> = ({
  status,
  title,
  showVisibilityInfo = false,
  showActionHints = false,
  ...badgeProps
}) => {
  const config = OFFER_STATUS_CONFIG[status];
  
  if (!config) return <OfferStatusBadge status={status} {...badgeProps} />;

  return (
    <div className="p-3 rounded-lg border bg-card">
      {title && (
        <h4 className="font-medium text-sm mb-2">{title}</h4>
      )}
      
      <OfferStatusBadge 
        status={status} 
        showDescription 
        {...badgeProps} 
      />
      
      {showVisibilityInfo && (
        <div className="mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {config.visibleToStudents ? (
              <>
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Visible para estudiantes</span>
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 text-red-600" />
                <span>No visible para estudiantes</span>
              </>
            )}
          </div>
        </div>
      )}
      
      {showActionHints && (
        <div className="mt-2 text-xs text-muted-foreground">
          {config.canModify && (
            <div className="flex items-center gap-1 mb-1">
              <FileText className="h-3 w-3" />
              <span>Puedes editar esta oferta</span>
            </div>
          )}
          {config.canSubmit && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Puedes enviar para aprobación</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Hook para obtener acciones disponibles según el estado
 */
export const useOfferStatusActions = (status: OfferStatus) => {
  const config = OFFER_STATUS_CONFIG[status];
  
  return {
    canEdit: config?.canModify || false,
    canSubmit: config?.canSubmit || false,
    canDelete: status === 'draft' || status === 'rejected',
    canClose: status === 'approved',
    isVisible: config?.visibleToStudents || false,
    needsAttention: status === 'rejected',
    isPending: status === 'pending',
    isPublished: status === 'approved',
  };
};

/**
 * Función utilitaria para obtener el próximo estado posible
 */
export const getNextPossibleStates = (currentStatus: OfferStatus): OfferStatus[] => {
  const transitions: Record<OfferStatus, OfferStatus[]> = {
    draft: ['pending'],
    pending: [], // Solo admin puede cambiar
    approved: ['closed'],
    rejected: ['pending'], // Después de editar
    closed: [], // Estado final
  };
  
  return transitions[currentStatus] || [];
};

/**
 * Función para determinar si una transición es válida
 */
export const isValidTransition = (from: OfferStatus, to: OfferStatus): boolean => {
  const allowedTransitions = getNextPossibleStates(from);
  return allowedTransitions.includes(to);
};

export default OfferStatusBadge;