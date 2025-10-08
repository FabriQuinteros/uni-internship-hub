import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Calendar,
  FileText,
  User,
  ExternalLink,
  Loader2
} from "lucide-react";
import { 
  OrganizationDetails,
  OrganizationStatus,
} from '../../types/user';
import { getOrganizationDetails } from '../../services/organizationService';
import { useToast } from "@/hooks/use-toast";

interface OrganizationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string | null;
}

const OrganizationDetailsModal: React.FC<OrganizationDetailsModalProps> = ({
  isOpen,
  onClose,
  organizationId
}) => {
  const { toast } = useToast();
  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && organizationId) {
      fetchOrganizationDetails();
    } else if (!isOpen) {
      // Limpiar datos cuando se cierra el modal
      setOrganization(null);
      setError(null);
    }
  }, [isOpen, organizationId]);

  const fetchOrganizationDetails = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getOrganizationDetails(organizationId);
      setOrganization(response.data);
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cargar los detalles de la organización';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: OrganizationStatus) => {
    const statusConfig = {
      [OrganizationStatus.PENDING]: { label: 'Pendiente', variant: 'secondary' as const },
      [OrganizationStatus.ACTIVE]: { label: 'Activa', variant: 'default' as const },
      [OrganizationStatus.REJECTED]: { label: 'Rechazada', variant: 'destructive' as const },
      [OrganizationStatus.SUSPENDED]: { label: 'Suspendida', variant: 'outline' as const }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      
      <Skeleton className="h-24 w-full" />
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Detalles de la Organización
          </DialogTitle>
          <DialogDescription>
            Información completa de la organización registrada
          </DialogDescription>
        </DialogHeader>

        {loading && <LoadingSkeleton />}
        
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Error al cargar los detalles</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchOrganizationDetails}
                  className="mt-3"
                >
                  Intentar nuevamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {organization && !loading && (
          <div className="space-y-6">
            {/* Header con nombre y estado */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{organization.name}</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Registrada el {formatDate(organization.createdAt)}
                </p>
              </div>
              <div className="text-right space-y-2">
                {getStatusBadge(organization.status)}
                {organization.profileComplete ? (
                  <Badge variant="outline" className="block">Perfil Completo</Badge>
                ) : (
                  <Badge variant="secondary" className="block">Perfil Incompleto</Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Información de contacto */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-4 w-4" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{organization.email}</span>
                  </div>
                  
                  {organization.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{organization.phone}</span>
                    </div>
                  )}
                  
                  {organization.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {organization.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  
                  {organization.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{organization.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Información administrativa */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-4 w-4" />
                    Información Administrativa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Estado:</span>
                      <span className="font-medium">{getStatusBadge(organization.status)}</span>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground block">Perfil:</span>
                      <span className="font-medium">
                        {organization.profileComplete ? 'Completo' : 'Incompleto'}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground block">Registrada:</span>
                      <span className="font-medium">
                        {new Date(organization.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground block">Última actualización:</span>
                      <span className="font-medium">
                        {new Date(organization.updatedAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>
                  
                  {organization.lastStatusChange && (
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground text-sm block">Último cambio de estado:</span>
                      <span className="font-medium text-sm">
                        {formatDate(organization.lastStatusChange)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Descripción */}
            {organization.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-4 w-4" />
                    Descripción
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {organization.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Acciones rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                <CardDescription>
                  Acciones disponibles para esta organización
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {organization.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={organization.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        Visitar sitio web
                      </a>
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`mailto:${organization.email}`}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Enviar email
                    </a>
                  </Button>
                  
                  {organization.phone && (
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={`tel:${organization.phone}`}
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Llamar
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationDetailsModal;