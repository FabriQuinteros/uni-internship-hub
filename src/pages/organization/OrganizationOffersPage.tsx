import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  FileText,
  Edit,
  Send,
  Eye,
  Calendar,
  DollarSign,
  Users,
  RefreshCw,
  UserCheck,
  XCircle
} from 'lucide-react';
import { offerService, OrganizationOffersFilters } from '@/services/offerService';
import OrganizationOfferForm from './OrganizationOfferForm';
import { Offer, OfferStatus } from '@/types/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import OfferStatusBadge, { useOfferStatusActions } from '@/components/ui/OfferStatusBadge';
import RejectionReasonAlert from '@/components/ui/RejectionReasonAlert';
import { OffersFilterPanel } from '@/components/organization/OffersFilterPanel';
import { CloseOfferDialog } from '@/components/organization/CloseOfferDialog';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente de tarjeta individual para cada oferta
 */
interface OfferCardProps {
  offer: Offer;
  onEdit: () => void;
  onSubmitForApproval: () => void;
  onClose: () => void;
  onView: () => void;
  onViewApplications: () => void;
  isSubmitting: boolean;
}

const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onEdit,
  onSubmitForApproval,
  onClose,
  onView,
  onViewApplications,
  isSubmitting
}) => {
  const actions = useOfferStatusActions(offer.status as OfferStatus);
  
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

  return (
    <Card className={`shadow-md hover:shadow-lg transition-all duration-300 ${
      actions.needsAttention ? 'border-red-200 bg-red-50/30' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 mb-2">
              {offer.title || 'Sin título'}
            </CardTitle>
            
            <div className="flex items-center gap-3 mb-2">
              <OfferStatusBadge status={offer.status as OfferStatus} />
              {offer.id && (
                <Badge variant="outline" className="text-xs">
                  ID: {offer.id}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Descripción */}
        {offer.description && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {offer.description}
            </p>
          </div>
        )}

        {/* Información clave */}
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
          
          {offer.quota && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="font-medium">{offer.quota}</p>
                <p className="text-xs text-muted-foreground">Cupos</p>
              </div>
            </div>
          )}
          
          {offer.application_deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="font-medium">{formatDate(offer.application_deadline)}</p>
                <p className="text-xs text-muted-foreground">Fecha límite</p>
              </div>
            </div>
          )}
          
          {offer.created_at && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-gray-600" />
              <div>
                <p className="font-medium">{getTimeAgo(offer.created_at) || 'Recientemente'}</p>
                <p className="text-xs text-muted-foreground">Creada</p>
              </div>
            </div>
          )}
        </div>

        {/* Mostrar info de postulaciones para ofertas aprobadas */}
        {offer.status === 'approved' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-900">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Oferta activa</span>
              <span className="text-blue-600">• Recibiendo postulaciones</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Haz clic en "Ver Postulaciones" para gestionar los candidatos pre-aprobados por la administración
            </p>
          </div>
        )}

        {/* Alerta de rechazo */}
        {offer.status === 'rejected' && offer.rejection_reason && (
          <div className="mb-4">
            <RejectionReasonAlert
              reason={offer.rejection_reason}
              rejectedAt={offer.updated_at}
              variant="alert"
              collapsible
            />
          </div>
        )}

        <Separator className="my-4" />

        {/* Botones de acción */}
        <div className="flex flex-col gap-2">
          {/* Botones principales: Ver Detalles y Ver Postulaciones lado a lado */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Ver Detalles
            </Button>
            
            {offer.status === 'approved' && (
              <Button
                variant="default"
                size="sm"
                onClick={onViewApplications}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
              >
                <UserCheck className="h-4 w-4" />
                Ver Postulaciones
              </Button>
            )}
          </div>
          
          {/* Botones de gestión */}
          <div className="flex items-center gap-2">
            {actions.canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            )}
            
            {actions.canSubmit && (
              <Button
                size="sm"
                onClick={onSubmitForApproval}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {offer.status === 'rejected' ? 'Reenviar' : 'Enviar para Aprobación'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Página principal de ofertas de la organización
 */
export default function OrganizationOffersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingOffers, setSubmittingOffers] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<OrganizationOffersFilters>({});
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [offerToClose, setOfferToClose] = useState<Offer | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const { user } = useAuth();
  const orgID = Number(user?.id) || 1;

  /**
   * Carga las ofertas de la organización con filtros
   */
  const loadOffers = async () => {
    setLoading(true);
    try {
      const data = await offerService.list(orgID, filters);
      setOffers(data || []);
    } catch (err: any) {
      console.error('Error loading offers', err);
      toast({
        title: 'Error',
        description: err.message || 'Error al cargar las ofertas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Envía una oferta para aprobación
   */
  const handleSubmitForApproval = async (offerId: number) => {
    setSubmittingOffers(prev => new Set([...prev, offerId]));
    
    try {
      await offerService.sendToApproval(offerId, orgID);
      
      toast({
        title: 'Éxito',
        description: 'Oferta enviada para aprobación exitosamente',
        variant: 'default',
      });
      
      // Recargar ofertas
      await loadOffers();
      
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Error al enviar la oferta para aprobación',
        variant: 'destructive',
      });
    } finally {
      setSubmittingOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(offerId);
        return newSet;
      });
    }
  };

  /**
   * Abre el diálogo para cerrar una oferta
   */
  const handleOpenCloseDialog = (offer: Offer) => {
    setOfferToClose(offer);
    setCloseDialogOpen(true);
  };

  /**
   * Cierra una oferta con motivo opcional
   */
  const handleConfirmClose = async (reason?: string) => {
    if (!offerToClose?.id) return;
    
    setIsClosing(true);
    
    try {
      await offerService.close(offerToClose.id, orgID, reason);
      
      toast({
        title: 'Éxito',
        description: 'Oferta cerrada exitosamente',
        variant: 'default',
      });
      
      // Cerrar el diálogo
      setCloseDialogOpen(false);
      setOfferToClose(null);
      
      // Recargar ofertas
      await loadOffers();
      
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Error al cerrar la oferta',
        variant: 'destructive',
      });
    } finally {
      setIsClosing(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    loadOffers();
  }, [filters]); // Recargar cuando cambien los filtros

  /**
   * Manejo de cambio de filtros
   */
  const handleFiltersChange = (newFilters: OrganizationOffersFilters) => {
    setFilters(newFilters);
  };

  /**
   * Limpiar todos los filtros
   */
  const handleClearFilters = () => {
    setFilters({});
  };

  // Estadísticas rápidas
  const stats = {
    total: offers.length,
    draft: offers.filter(o => o.status === 'draft').length,
    pending: offers.filter(o => o.status === 'pending').length,
    approved: offers.filter(o => o.status === 'approved').length,
    rejected: offers.filter(o => o.status === 'rejected').length,
  };

  // Details modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsOfferId, setDetailsOfferId] = useState<number | null>(null);

  const openDetails = (offerId: number) => {
    setDetailsOfferId(offerId);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setDetailsOfferId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Ofertas</h1>
          <p className="text-muted-foreground">
            Gestiona tus ofertas de trabajo y pasantías
          </p>
        </div>
        
        <Button onClick={() => navigate('/organization/offers/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Oferta
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Borradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.draft}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aprobadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rechazadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de Filtros */}
      <OffersFilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Lista de ofertas */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes ofertas aún</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera oferta de trabajo o pasantía para comenzar
            </p>
            <Button onClick={() => navigate('/organization/offers/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Oferta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onEdit={() => navigate(`/organization/offers/${offer.id}/edit`)}
              onSubmitForApproval={() => offer.id && handleSubmitForApproval(offer.id)}
              onClose={() => handleOpenCloseDialog(offer)}
              onView={() => openDetails(offer.id)}
              onViewApplications={() => navigate(`/organization/offers/${offer.id}/applications`)}
              isSubmitting={offer.id ? submittingOffers.has(offer.id) : false}
            />
          ))}
        </div>
      )}
      {/* Details dialog */}
      <Dialog open={detailsOpen} onOpenChange={(open) => { if (!open) closeDetails(); setDetailsOpen(open); }}>
        <DialogContent className="w-full sm:max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la oferta</DialogTitle>
          </DialogHeader>
          {detailsOfferId && (
            <OrganizationOfferForm
              offerId={detailsOfferId}
              readOnly
              onClose={() => {
                closeDetails();
              }}
              onDeleted={async () => {
                // after delete, refresh list
                await loadOffers();
                closeDetails();
              }}
              onOfferClosed={async () => {
                // after closing offer, refresh list
                await loadOffers();
                closeDetails();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Close offer dialog */}
      <CloseOfferDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        onConfirm={handleConfirmClose}
        isLoading={isClosing}
        offerTitle={offerToClose?.title || ''}
      />
    </div>
  );
}

