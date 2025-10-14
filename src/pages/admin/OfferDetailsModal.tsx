/**
 * Modal para mostrar los detalles completos de una oferta
 * Usado para revisión detallada antes de tomar decisiones
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  MapPin,
  Briefcase,
  FileText,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { OfferDetails } from '@/types/admin-offers';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface OfferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: OfferDetails | null;
  loading: boolean;
}

/**
 * Modal de detalles de oferta
 */
const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  isOpen,
  onClose,
  offer,
  loading
}) => {
  if (!isOpen) return null;

  /**
   * Componente de skeleton para carga
   */
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  );

  /**
   * Formatea una fecha para mostrar
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no válida';
    }
  };

  /**
   * Obtiene el badge de estado
   */
  const getStatusBadge = (status: 'pending' | 'rejected') => {
    const config = {
      pending: { 
        label: 'Pendiente de Aprobación', 
        variant: 'warning' as const,
        icon: Clock,
        description: 'Esperando decisión administrativa'
      },
      rejected: { 
        label: 'Rechazada', 
        variant: 'destructive' as const,
        icon: AlertCircle,
        description: 'Devuelta para correcciones'
      }
    };
    
    const { label, variant, icon: Icon, description } = config[status];
    
    return (
      <div className="flex items-center gap-2">
        <Badge variant={variant} className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {label}
        </Badge>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Detalles de la Oferta
          </DialogTitle>
          <DialogDescription>
            Información completa para revisión administrativa
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <LoadingSkeleton />
          ) : offer ? (
            <div className="space-y-6">
              {/* Header de la oferta */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-foreground line-clamp-2">
                    {offer.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    ID: {offer.id}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span className="font-medium">{offer.organization_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span>Org ID: {offer.organization_id}</span>
                  </div>
                </div>

                {getStatusBadge(offer.status)}
              </div>

              <Separator />

              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información laboral */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Información Laboral
                  </h4>
                  
                  <div className="space-y-3 text-sm">
                    {offer.salary && (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Salario</span>
                        </div>
                        <span className="font-semibold text-green-700">
                          ${offer.salary.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Cupos Disponibles</span>
                      </div>
                      <span className="font-semibold text-blue-700">{offer.quota}</span>
                    </div>

                    {offer.weekly_hours && (
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Horas Semanales</span>
                        </div>
                        <span className="font-semibold text-purple-700">{offer.weekly_hours}h</span>
                      </div>
                    )}

                    {offer.shift && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">Turno</span>
                        </div>
                        <span className="text-gray-700">{offer.shift}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información temporal y ubicación */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fechas y Ubicación
                  </h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">Fecha Límite</span>
                      </div>
                      <span className="text-orange-700 font-semibold">
                        {formatDate(offer.application_deadline)}
                      </span>
                    </div>

                    {offer.published_start_date && (
                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                          <span className="font-medium">Inicio Publicación</span>
                        </div>
                        <span className="text-indigo-700">
                          {formatDate(offer.published_start_date)}
                        </span>
                      </div>
                    )}

                    {offer.location_text && (
                      <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-teal-600" />
                          <span className="font-medium">Ubicación</span>
                        </div>
                        <span className="text-teal-700">{offer.location_text}</span>
                      </div>
                    )}

                    {offer.modality && (
                      <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="h-4 w-4 text-pink-600" />
                          <span className="font-medium">Modalidad</span>
                        </div>
                        <span className="text-pink-700">{offer.modality}</span>
                      </div>
                    )}

                    {offer.duration_text && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">Duración</span>
                        </div>
                        <span className="text-yellow-700">{offer.duration_text}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Descripción */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Descripción de la Oferta</h4>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {offer.description}
                  </p>
                </div>
              </div>

              {/* Requisitos */}
              {offer.requirements && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Requisitos</h4>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                      {offer.requirements}
                    </p>
                  </div>
                </div>
              )}

              {/* Motivo de rechazo (si aplica) */}
              {offer.status === 'rejected' && offer.rejection_reason && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-red-700 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Motivo del Rechazo Anterior
                  </h4>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-900 whitespace-pre-wrap leading-relaxed">
                      {offer.rejection_reason}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Información de auditoría */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wide text-muted-foreground">
                  Información de Auditoría
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Creada:</span>
                    <br />
                    {formatDate(offer.created_at)} 
                    <span className="ml-2">
                      ({formatDistanceToNow(new Date(offer.created_at), { addSuffix: true, locale: es })})
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Enviada para aprobación:</span>
                    <br />
                    {formatDate(offer.submitted_at)}
                    <span className="ml-2">
                      ({formatDistanceToNow(new Date(offer.submitted_at), { addSuffix: true, locale: es })})
                    </span>
                  </div>

                  {offer.updated_at && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Última actualización:</span>
                      <br />
                      {formatDate(offer.updated_at)}
                      <span className="ml-2">
                        ({formatDistanceToNow(new Date(offer.updated_at), { addSuffix: true, locale: es })})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se pudieron cargar los detalles de la oferta</p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OfferDetailsModal;