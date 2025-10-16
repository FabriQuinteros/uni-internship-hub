import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Organization, OrganizationStatus } from '../../types/user';
import { 
  canOrganizationOperate, 
  getAgreementStatusInfo, 
  getDaysUntilExpiry 
} from '../../utils/organizationValidation';

interface OrganizationStatusBadgeProps {
  organization: Organization;
  showOperationStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente reutilizable para mostrar el estado completo de una organización
 * Incluye estado de cuenta + estado de convenio según la nueva lógica
 */
const OrganizationStatusBadge: React.FC<OrganizationStatusBadgeProps> = ({
  organization,
  showOperationStatus = true,
  size = 'md'
}) => {
  const { status, agreementExpiry } = organization;
  const canOperate = canOrganizationOperate(organization);
  const agreementInfo = getAgreementStatusInfo(organization);
  const daysUntilExpiry = getDaysUntilExpiry(organization);

  // Configuración de tamaños
  const sizeConfig = {
    sm: { badge: 'text-xs', icon: 'h-3 w-3', container: 'gap-1' },
    md: { badge: 'text-sm', icon: 'h-4 w-4', container: 'gap-2' },
    lg: { badge: 'text-base', icon: 'h-5 w-5', container: 'gap-2' }
  };
  
  const config = sizeConfig[size];

  // Estado de la cuenta (principal)
  const getAccountStatusBadge = () => {
    const accountConfig = {
      [OrganizationStatus.PENDING]: { 
        label: 'Pendiente', 
        variant: 'secondary' as const, 
        icon: Clock 
      },
      [OrganizationStatus.ACTIVE]: { 
        label: 'Activa', 
        variant: 'default' as const, 
        icon: CheckCircle 
      },
      [OrganizationStatus.REJECTED]: { 
        label: 'Rechazada', 
        variant: 'destructive' as const, 
        icon: XCircle 
      },
      [OrganizationStatus.SUSPENDED]: { 
        label: 'Suspendida', 
        variant: 'outline' as const, 
        icon: AlertTriangle 
      }
    };

    const accountInfo = accountConfig[status];
    const Icon = accountInfo.icon;

    return (
      <Badge variant={accountInfo.variant} className={config.badge}>
        <Icon className={`${config.icon} mr-1`} />
        Cuenta: {accountInfo.label}
      </Badge>
    );
  };

  // Estado del convenio (solo si está activa)
  const getAgreementBadge = () => {
    if (status !== OrganizationStatus.ACTIVE) return null;

    let variant: "default" | "destructive" | "outline" | "secondary" = 'outline';
    let label = agreementInfo.label;
    let className = config.badge;

    if (agreementInfo.status === 'expired') {
      variant = 'destructive';
      label = 'Convenio Expirado';
    } else if (agreementInfo.status === 'valid') {
      if (daysUntilExpiry && daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        variant = 'outline';
        label = `Expira en ${daysUntilExpiry}d`;
        className = `${config.badge} text-orange-600 border-orange-600`;
      } else {
        variant = 'default';
        label = 'Convenio Vigente';
        className = `${config.badge} bg-green-600`;
      }
    } else {
      variant = 'outline';
      label = 'Sin vencimiento';
    }

    return (
      <Badge variant={variant} className={className}>
        {label}
      </Badge>
    );
  };

  return (
    <div className={`flex flex-col ${config.container}`}>
      {/* Estado de cuenta */}
      {getAccountStatusBadge()}
      
      {/* Estado del convenio */}
      {getAgreementBadge()}
      
      {/* Indicador de operación */}
      {showOperationStatus && (
        <div className={`text-center ${config.badge}`}>
          {canOperate ? (
            <span className="text-green-600 font-medium">✓ Puede operar</span>
          ) : (
            <span className="text-red-600 font-medium">✗ No puede operar</span>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationStatusBadge;