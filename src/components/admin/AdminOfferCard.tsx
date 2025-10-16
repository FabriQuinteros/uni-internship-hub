/**
 * Componente de tarjeta para mostrar ofertas en el panel de administración
 * Muestra información completa y acciones según el estado de la oferta
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Clock,
  Laptop,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { AdminOffer, OFFER_STATUS_CONFIG } from '@/types/admin-offers';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminOfferCardProps {
  offer: AdminOffer;
  isUpdating?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
}

export const AdminOfferCard: React.FC<AdminOfferCardProps> = ({
  offer,
  isUpdating = false,
  onApprove,
  onReject,
  onViewDetails
}) => {
  const statusConfig = OFFER_STATUS_CONFIG[offer.status];
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
    } catch {
      return null;
    }
  };

  const canApprove = offer.status === 'pending' && onApprove;
  const canReject = offer.status === 'pending' && onReject;
  const showActions = canApprove || canReject || onViewDetails;

  return (
    <Card className={`shadow-md hover:shadow-lg transition-all duration-300 ${
      offer.status === 'rejected' ? 'border-destructive/30 bg-destructive/5' : ''
    } ${
      offer.status === 'pending' ? 'border-warning/30 bg-warning/5' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 mb-2">
              {offer.title}
            </CardTitle>
            
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge 
                variant={statusConfig.variant}
                className="text-xs font-medium"
              >
                {statusConfig.label}
              </Badge>
              
              <Badge variant="outline" className="text-xs">
                ID: {offer.id}
              </Badge>
              
              {offer.applications_count !== undefined && offer.applications_count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {offer.applications_count} postulaciones
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{offer.organization_name}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Descripción */}
        {offer.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {offer.description}
          </p>
        )}

        <Separator />

        {/* Información clave en grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {offer.salary && (
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">${offer.salary.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Salario</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{offer.quota}</p>
              <p className="text-xs text-muted-foreground">Cupos</p>
            </div>
          </div>
          
          {offer.application_deadline && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{formatDate(offer.application_deadline)}</p>
                <p className="text-xs text-muted-foreground">Fecha límite</p>
              </div>
            </div>
          )}
          
          {offer.created_at && (
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{getTimeAgo(offer.created_at) || 'Recientemente'}</p>
                <p className="text-xs text-muted-foreground">Creada</p>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="flex flex-wrap gap-2 text-xs">
          {offer.modality && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Laptop className="h-3 w-3" />
              {offer.modality}
            </Badge>
          )}
          
          {offer.location && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {offer.location}
            </Badge>
          )}
          
          {offer.duration && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {offer.duration}
            </Badge>
          )}
        </div>

        {/* Alerta de rechazo */}
        {offer.status === 'rejected' && offer.rejection_reason && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-destructive mb-1">Motivo de rechazo:</p>
                <p className="text-xs text-muted-foreground">{offer.rejection_reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Información de fechas de estado */}
        {(offer.submitted_at || offer.published_start_date) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {offer.submitted_at && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>Enviada {getTimeAgo(offer.submitted_at)}</span>
              </div>
            )}
            {offer.published_start_date && offer.status === 'approved' && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Publicada el {formatDate(offer.published_start_date)}</span>
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        {showActions && (
          <>
            <Separator />
            <div className="flex items-center justify-end gap-2">
              {onViewDetails && (
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
              )}
              
              {canReject && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onReject}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </Button>
              )}
              
              {canApprove && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onApprove}
                  disabled={isUpdating}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Aprobar
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOfferCard;
