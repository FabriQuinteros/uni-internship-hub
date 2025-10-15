/**
 * Componente para mostrar la lista de ofertas pendientes
 * Incluye paginación, búsqueda, filtros y las tarjetas de ofertas
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import { useAdminOffers } from '@/hooks/use-admin-offers';
import { useDebounce } from '@/hooks/use-debounce';
import PendingOfferCard from './PendingOfferCard';
import ApprovalDecisionModal from './ApprovalDecisionModal';
import OfferDetailsModal from './OfferDetailsModal';

/**
 * Componente principal de la lista de ofertas pendientes
 */
const PendingOffersList: React.FC = () => {
  const {
    pendingOffers,
    totalOffers,
    currentPage,
    totalPages,
    limit,
    loading,
    filters,
    selectedOffer,
    loadingDetails,
    fetchPendingOffers,
    refreshOffers,
    goToPage,
    changePageSize,
    setFilters,
    searchOffers,
    clearFilters,
    loadOfferDetails,
    clearSelectedOffer,
    isOfferUpdating
  } = useAdminOffers();

  // Estados locales para UI
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [decisionModal, setDecisionModal] = useState<{
    isOpen: boolean;
    offerId: number | null;
    offerTitle: string;
  }>({
    isOpen: false,
    offerId: null,
    offerTitle: ''
  });

  // Debounce para búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Efecto para búsqueda automática
  React.useEffect(() => {
    if (debouncedSearchTerm !== (filters.search || '')) {
      searchOffers(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, filters.search, searchOffers]);

  /**
   * Maneja el cambio de filtro de estado
   */
  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters({ ...filters, status: undefined });
    } else {
      setFilters({ ...filters, status: status as 'pending' | 'rejected' });
    }
  };

  /**
   * Maneja el cambio de tamaño de página
   */
  const handlePageSizeChange = (newSize: string) => {
    changePageSize(parseInt(newSize));
  };

  /**
   * Abre el modal de decisión
   */
  const openDecisionModal = (offerId: number, offerTitle: string) => {
    setDecisionModal({
      isOpen: true,
      offerId,
      offerTitle
    });
  };

  /**
   * Cierra el modal de decisión
   */
  const closeDecisionModal = () => {
    setDecisionModal({
      isOpen: false,
      offerId: null,
      offerTitle: ''
    });
  };

  /**
   * Abre el modal de detalles
   */
  const openDetailsModal = async (offerId: number) => {
    setSelectedOfferId(offerId);
    await loadOfferDetails(offerId);
  };

  /**
   * Cierra el modal de detalles
   */
  const closeDetailsModal = () => {
    setSelectedOfferId(null);
    clearSelectedOffer();
  };

  return (
    <div className="space-y-4">
      {/* Controles de búsqueda y filtros */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex flex-col gap-4">
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
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {(filters.status || filters.search) && (
                <Badge variant="secondary" className="ml-1 h-4 text-xs">
                  {[filters.status, filters.search].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            
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

          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background rounded-lg border">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="rejected">Rechazadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Elementos por página</Label>
                <Select
                  value={String(limit)}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de ofertas */}
      <div className="p-4">
        {loading && pendingOffers.length === 0 ? (
          // Loading skeletons
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : pendingOffers.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No se encontraron ofertas con los filtros actuales.
            </p>
          </div>
        ) : (
          // Lista de ofertas
          <div className="space-y-4">
            {pendingOffers.map((offer) => (
              <PendingOfferCard
                key={offer.id}
                offer={offer}
                isUpdating={isOfferUpdating(offer.id)}
                onApprove={() => openDecisionModal(offer.id, offer.title)}
                onReject={() => openDecisionModal(offer.id, offer.title)}
                onViewDetails={() => openDetailsModal(offer.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t">
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
      )}

      {/* Modales */}
      <ApprovalDecisionModal
        isOpen={decisionModal.isOpen}
        onClose={closeDecisionModal}
        offerId={decisionModal.offerId}
        offerTitle={decisionModal.offerTitle}
      />

      <OfferDetailsModal
        isOpen={!!selectedOfferId}
        onClose={closeDetailsModal}
        offer={selectedOffer}
        loading={loadingDetails}
      />
    </div>
  );
};

export default PendingOffersList;