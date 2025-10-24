/**
 * Página principal de exploración de ofertas para estudiantes
 * Incluye grid de ofertas, filtros y paginación
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { useStudentOffers } from '@/hooks/use-student-offers';
import { OffersFilterPanel } from '@/components/student/OffersFilterPanel';
import { OfferCard } from '@/components/student/OfferCard';
import { OfferDetailModal } from '@/components/student/OfferDetailModal';
import { ApplyConfirmationModal } from '@/components/student/ApplyConfirmationModal';
import { useToast } from '@/hooks/use-toast';
import { useCatalogStore } from '@/store/unifiedCatalogStore';
import { useApplyOffer } from '@/hooks/use-apply-offer';

const StudentOffersPage = () => {
  const { toast } = useToast();
  const {
    offers,
    totalOffers,
    currentPage,
    totalPages,
    loading,
    loadingDetail,
    error,
    filters,
    selectedOffer,
    setFilters,
    searchOffers,
    clearFilters,
    goToPage,
    loadOfferDetail,
    clearSelectedOffer,
    refreshOffers,
  } = useStudentOffers();

  const { applying, error: applyError, applyToOffer, reset: resetApply } = useApplyOffer();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);

  // Cargar catálogos al montar el componente
  const loadAllCatalogs = useCatalogStore(state => state.loadAllCatalogs);

  useEffect(() => {
    // Cargar catálogos solo una vez al montar el componente
    loadAllCatalogs().catch(console.error);
  }, []); // Array de dependencias vacío = solo se ejecuta al montar

  const handleViewDetails = async (offerId: number) => {
    await loadOfferDetail(offerId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    clearSelectedOffer();
  };

  const handleApply = (offerId: number) => {
    setSelectedOfferId(offerId);
    setIsApplyModalOpen(true);
  };

  const handleConfirmApply = async (message?: string) => {
    if (!selectedOfferId) return;

    const success = await applyToOffer(selectedOfferId, message ? { message } : undefined);
    
    if (success) {
      toast({
        title: '¡Postulación Enviada!',
        description: 'Tu postulación ha sido registrada exitosamente. Recibirás notificaciones sobre su estado.',
        variant: 'default',
      });
      setIsApplyModalOpen(false);
      setSelectedOfferId(null);
      handleCloseModal();
      resetApply();
      
      // Refrescar la lista de ofertas para actualizar el estado "has_applied"
      await refreshOffers();
    }
  };

  const handleCloseApplyModal = () => {
    if (!applying) {
      setIsApplyModalOpen(false);
      setSelectedOfferId(null);
      resetApply();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-hero rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Explorar Ofertas</h1>
            <p className="text-white/80">
              {totalOffers > 0 
                ? `Encontramos ${totalOffers} ${totalOffers === 1 ? 'oferta disponible' : 'ofertas disponibles'} para ti`
                : 'Busca y postúlate a las mejores oportunidades'
              }
            </p>
          </div>
          <div className="hidden md:block">
            <Search className="h-16 w-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <OffersFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={searchOffers}
        onClear={clearFilters}
        loading={loading}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Grid de Ofertas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-[400px]">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <Inbox className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">No se encontraron ofertas</h3>
              <p className="text-muted-foreground max-w-md">
                {filters.search || filters.technology_id || filters.modality_id || filters.location_id || filters.position_id
                  ? 'Intenta ajustar los filtros para ver más resultados'
                  : 'No hay ofertas disponibles en este momento. Vuelve pronto para ver nuevas oportunidades.'
                }
              </p>
              {(filters.search || filters.technology_id || filters.modality_id || filters.location_id || filters.position_id) && (
                <Button onClick={clearFilters} variant="outline" className="mt-4">
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Grid de Ofertas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>

                    {/* Números de página */}
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            disabled={loading}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {totalOffers} {totalOffers === 1 ? 'oferta' : 'ofertas'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal de Detalle */}
      <OfferDetailModal
        offer={selectedOffer}
        open={isModalOpen}
        onClose={handleCloseModal}
        loading={loadingDetail}
        onApply={handleApply}
      />

      {/* Modal de Confirmación de Postulación */}
      <ApplyConfirmationModal
        open={isApplyModalOpen}
        onClose={handleCloseApplyModal}
        onConfirm={handleConfirmApply}
        offerTitle={selectedOffer?.title}
        loading={applying}
        error={applyError}
      />
    </div>
  );
};

export default StudentOffersPage;
