/**
 * Página de Gestión Completa de Ofertas para Administradores
 * Vista unificada de TODAS las ofertas con filtros avanzados
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
  X,
  TrendingUp,
  TrendingDown,
  MapPin,
  Briefcase,
  DollarSign,
  Users as UsersIcon,
  Calendar,
  Code,
  Building2
} from 'lucide-react';
import { useAdminAllOffers } from '@/hooks/use-admin-all-offers';
import { useDebounce } from '@/hooks/use-debounce';
import { withAdminPermission } from '@/hooks/use-admin-permissions';
import AdminOfferCard from '@/components/admin/AdminOfferCard';
import AllOffersFilterPanel from '@/components/admin/AllOffersFilterPanel';
import { OFFER_STATUS_CONFIG } from '@/types/admin-offers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

/**
 * Componente principal de la página
 */
const AdminOffersManagementPage: React.FC = () => {
  const {
    offers,
    totalOffers,
    currentPage,
    totalPages,
    limit,
    loading,
    error,
    filters,
    statistics,
    selectedOffer,
    loadingDetails,
    refreshOffers,
    goToPage,
    setFilters,
    searchOffers,
    clearFilters,
    loadOfferDetails,
    clearSelectedOffer,
    clearError,
    isOfferUpdating,
    approveOffer,
    rejectOffer
  } = useAdminAllOffers();

  // Estados locales para UI
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [approveModal, setApproveModal] = useState<{
    isOpen: boolean;
    offerId: number | null;
    offerTitle: string;
  }>({
    isOpen: false,
    offerId: null,
    offerTitle: ''
  });
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    offerId: number | null;
    offerTitle: string;
  }>({
    isOpen: false,
    offerId: null,
    offerTitle: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Debounce para búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Efecto para búsqueda automática
  React.useEffect(() => {
    if (debouncedSearchTerm !== (filters.search || '')) {
      searchOffers(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, filters.search, searchOffers]);

  /**
   * Abre el modal de aprobación
   */
  const openApproveModal = (offerId: number, offerTitle: string) => {
    setApproveModal({
      isOpen: true,
      offerId,
      offerTitle
    });
  };

  /**
   * Cierra el modal de aprobación
   */
  const closeApproveModal = () => {
    setApproveModal({
      isOpen: false,
      offerId: null,
      offerTitle: ''
    });
  };

  /**
   * Confirma la aprobación de una oferta
   */
  const handleApprove = async () => {
    if (!approveModal.offerId) return;
    
    setIsProcessing(true);
    try {
      await approveOffer(approveModal.offerId);
      closeApproveModal();
    } catch (error) {
      // El error ya se muestra en el toast desde el hook
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Abre el modal de rechazo
   */
  const openRejectModal = (offerId: number, offerTitle: string) => {
    setRejectModal({
      isOpen: true,
      offerId,
      offerTitle
    });
    setRejectionReason('');
  };

  /**
   * Cierra el modal de rechazo
   */
  const closeRejectModal = () => {
    setRejectModal({
      isOpen: false,
      offerId: null,
      offerTitle: ''
    });
    setRejectionReason('');
  };

  /**
   * Confirma el rechazo de una oferta
   */
  const handleReject = async () => {
    if (!rejectModal.offerId || !rejectionReason.trim()) return;
    
    setIsProcessing(true);
    try {
      await rejectOffer(rejectModal.offerId, rejectionReason);
      closeRejectModal();
    } catch (error) {
      // El error ya se muestra en el toast desde el hook
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Abre el modal de detalles
   */
  const openDetailsModal = async (offerId: number) => {
    setDetailsModalOpen(true);
    await loadOfferDetails(offerId);
  };

  /**
   * Cierra el modal de detalles
   */
  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    clearSelectedOffer();
  };

  // Loading state inicial
  if (loading && offers.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Gestión de Ofertas
          </h1>
          <p className="text-muted-foreground">
            Panel completo de supervisión y gestión de todas las ofertas del sistema
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshOffers}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={clearError}
              className="text-destructive-foreground hover:text-destructive-foreground/80 ml-2 underline"
            >
              Cerrar
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="shadow-card hover:shadow-floating transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{statistics.total}</div>
              <p className="text-xs text-muted-foreground">
                Todas las ofertas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-floating transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{statistics.by_status.pending}</div>
              <p className="text-xs text-muted-foreground">
                Esperan revisión
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-floating transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.by_status.approved}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {statistics.recent_approvals > 0 && (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    +{statistics.recent_approvals} hoy
                  </>
                )}
                {statistics.recent_approvals === 0 && 'Publicadas'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-floating transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{statistics.by_status.rejected}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {statistics.recent_rejections > 0 && (
                  <>
                    <TrendingDown className="h-3 w-3 text-destructive" />
                    +{statistics.recent_rejections} hoy
                  </>
                )}
                {statistics.recent_rejections === 0 && 'Requieren corrección'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-floating transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cerradas</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{statistics.by_status.closed}</div>
              <p className="text-xs text-muted-foreground">
                Finalizadas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Listado de Ofertas
          </CardTitle>
          <CardDescription>
            Busca, filtra y gestiona todas las ofertas del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Panel de filtros avanzados */}
          <AllOffersFilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
          />

          <Separator />

          {/* Lista de ofertas */}
          {loading && offers.length === 0 ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron ofertas</h3>
              <p className="text-muted-foreground mb-4">
                No hay ofertas que coincidan con los filtros aplicados.
              </p>
              {(filters.search || filters.status || filters.modality || filters.location) && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <AdminOfferCard
                  key={offer.id}
                  offer={offer}
                  isUpdating={isOfferUpdating(offer.id)}
                  onApprove={offer.status === 'pending' ? () => openApproveModal(offer.id, offer.title) : undefined}
                  onReject={offer.status === 'pending' ? () => openRejectModal(offer.id, offer.title) : undefined}
                  onViewDetails={() => openDetailsModal(offer.id)}
                />
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando {((currentPage - 1) * limit) + 1} a {Math.min(currentPage * limit, totalOffers)} de {totalOffers} ofertas
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const page = i + Math.max(1, currentPage - 2);
                      if (page > totalPages) return null;
                      
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                          disabled={loading}
                          className="w-8 h-8"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Aprobación */}
      <Dialog open={approveModal.isOpen} onOpenChange={(open) => !open && closeApproveModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Oferta</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas aprobar esta oferta?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              <span className="font-semibold">Oferta:</span> {approveModal.offerTitle}
            </p>
            <p className="text-sm text-muted-foreground">
              Una vez aprobada, la oferta será visible para todos los estudiantes.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeApproveModal}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Aprobando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Aprobar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rechazo */}
      <Dialog open={rejectModal.isOpen} onOpenChange={(open) => !open && closeRejectModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Oferta</DialogTitle>
            <DialogDescription>
              Proporciona un motivo detallado del rechazo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Oferta:</span> {rejectModal.offerTitle}
            </p>
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Motivo del rechazo <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explica por qué esta oferta no cumple con los requisitos..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Este motivo será enviado a la organización.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeRejectModal}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Rechazando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles */}
      <Dialog open={detailsModalOpen} onOpenChange={(open) => !open && closeDetailsModal()}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Detalles de la Oferta
            </DialogTitle>
            <DialogDescription>
              Información completa de la oferta
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : selectedOffer ? (
            <div className="space-y-6 py-4">
              {/* Título y Estado */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold">{selectedOffer.title}</h3>
                  <Badge variant={OFFER_STATUS_CONFIG[selectedOffer.status].variant}>
                    {OFFER_STATUS_CONFIG[selectedOffer.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {selectedOffer.organization_name}
                </p>
              </div>

              <Separator />

              {/* Información Principal */}
              <div className="grid gap-4 md:grid-cols-2">
                {selectedOffer.modality && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Modalidad</p>
                      <p className="text-sm text-muted-foreground">{selectedOffer.modality}</p>
                    </div>
                  </div>
                )}

                {selectedOffer.location_text && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Ubicación</p>
                      <p className="text-sm text-muted-foreground">{selectedOffer.location_text}</p>
                    </div>
                  </div>
                )}

                {selectedOffer.duration_text && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Duración</p>
                      <p className="text-sm text-muted-foreground">{selectedOffer.duration_text}</p>
                    </div>
                  </div>
                )}

                {selectedOffer.salary && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Salario</p>
                      <p className="text-sm text-muted-foreground">
                        ${selectedOffer.salary.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <UsersIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Cupos</p>
                    <p className="text-sm text-muted-foreground">{selectedOffer.quota}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Fecha límite</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedOffer.application_deadline).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </div>

                {selectedOffer.weekly_hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Horas semanales</p>
                      <p className="text-sm text-muted-foreground">{selectedOffer.weekly_hours}h</p>
                    </div>
                  </div>
                )}

                {selectedOffer.shift && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Turno</p>
                      <p className="text-sm text-muted-foreground">{selectedOffer.shift}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Descripción */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descripción
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedOffer.description}
                </p>
              </div>

              {/* Requisitos */}
              {selectedOffer.requirements && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Requisitos
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedOffer.requirements}
                    </p>
                  </div>
                </>
              )}

              {/* Tecnologías */}
              {selectedOffer.technologies && selectedOffer.technologies.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Tecnologías
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOffer.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          #{tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Motivo de rechazo si aplica */}
              {selectedOffer.status === 'rejected' && selectedOffer.rejection_reason && (
                <>
                  <Separator />
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-1">Motivo del rechazo:</p>
                      <p className="text-sm">{selectedOffer.rejection_reason}</p>
                    </AlertDescription>
                  </Alert>
                </>
              )}

              {/* Fechas */}
              <Separator />
              <div className="grid gap-2 text-xs text-muted-foreground">
                <p>Creada: {new Date(selectedOffer.created_at).toLocaleString('es-AR')}</p>
                {selectedOffer.submitted_at && (
                  <p>Enviada: {new Date(selectedOffer.submitted_at).toLocaleString('es-AR')}</p>
                )}
                {selectedOffer.updated_at && (
                  <p>Actualizada: {new Date(selectedOffer.updated_at).toLocaleString('es-AR')}</p>
                )}
              </div>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No se pudieron cargar los detalles de la oferta.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDetailsModal}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Proteger la página con permisos de administrador
// Usa el permiso canApproveOffers ya que gestionar ofertas incluye aprobarlas
export default withAdminPermission(AdminOffersManagementPage, 'canApproveOffers');
