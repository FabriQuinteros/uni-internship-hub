/**
 * Tarjeta individual para mostrar una oferta pendiente
 * Incluye información básica y botones de acción
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  CheckCircle, 
  XCircle,
  Eye,
  AlertCircle
} from 'lucide-react';
import { PendingOffer } from '@/types/admin-offers';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface PendingOfferCardProps {
  offer: PendingOffer;
  isUpdating: boolean;
  onApprove: () => void;
  onReject: () => void;
  onViewDetails: () => void;
}

/**
 * Componente de tarjeta para oferta pendiente
 */
const PendingOfferCard: React.FC<PendingOfferCardProps> = ({
  offer,
  isUpdating,
  onApprove,
  onReject,
  onViewDetails
}) => {
  // Formatear fechas
  const submittedAgo = formatDistanceToNow(new Date(offer.submitted_at), {
    addSuffix: true,
    locale: es
  });

  const deadlineDate = new Date(offer.application_deadline);
  const isDeadlineSoon = deadlineDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 días

  /**
   * Configuración del badge de estado
   */
  const getStatusBadge = (status: 'pending' | 'rejected') => {
    const config = {
      pending: { 
        label: 'Pendiente', 
        variant: 'warning' as const,
        icon: Clock
      },
      rejected: { 
        label: 'Rechazada', 
        variant: 'destructive' as const,
        icon: AlertCircle
      }
    };
    
    const { label, variant, icon: Icon } = config[status];
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  return (
    <Card className={`shadow-md hover:shadow-lg transition-all duration-300 ${
      isUpdating ? 'opacity-50 pointer-events-none' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 mb-2">
              {offer.title}
            </CardTitle>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span className="font-medium">{offer.organization_name}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Enviada {submittedAgo}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(offer.status)}
            <Badge variant="outline" className="text-xs">
              ID: {offer.id}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Descripción */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {offer.description}
          </p>
        </div>

        <Separator className="my-4" />

        {/* Información adicional */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {offer.salary && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium">${offer.salary.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Incentivo económico</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-medium">{offer.quota}</p>
              <p className="text-xs text-muted-foreground">Cupos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className={`h-4 w-4 ${isDeadlineSoon ? 'text-red-600' : 'text-purple-600'}`} />
            <div>
              <p className="font-medium">
                {deadlineDate.toLocaleDateString('es-ES', { 
                  day: '2-digit', 
                  month: '2-digit' 
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {isDeadlineSoon ? 'Vence pronto' : 'Fecha límite'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-gray-600" />
            <div>
              <p className="font-medium">Org #{offer.organization_id}</p>
              <p className="text-xs text-muted-foreground">ID Organización</p>
            </div>
          </div>
        </div>

        {/* Alerta para deadlines próximos */}
        {isDeadlineSoon && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">
              La fecha límite de postulación está próxima. Considera revisar esta oferta pronto.
            </p>
          </div>
        )}

        <Separator className="my-4" />

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Ver Detalles
          </Button>
          
          <div className="flex items-center gap-2">
            {offer.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReject}
                  disabled={isUpdating}
                  className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </Button>
                
                <Button
                  size="sm"
                  onClick={onApprove}
                  disabled={isUpdating}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Aprobar
                </Button>
              </>
            )}
            
            {offer.status === 'rejected' && (
              <Button
                size="sm"
                onClick={onApprove}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Revisar y Aprobar
              </Button>
            )}
          </div>
        </div>

        {/* Indicador de carga */}
        {isUpdating && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              Procesando...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingOfferCard;