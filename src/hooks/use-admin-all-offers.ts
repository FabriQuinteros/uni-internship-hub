/**
 * Versión simplificada del hook para debuggear
 */

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { adminOfferService } from '@/services/adminOfferService';
import {
  AdminOffer,
  AllOffersFilters,
  OfferStatistics,
  OfferDetails
} from '@/types/admin-offers';

interface AdminAllOffersState {
  offers: AdminOffer[];
  totalOffers: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  statistics: OfferStatistics | null;
  loading: boolean;
  loadingDetails: boolean;
  error: string | null;
  filters: AllOffersFilters;
  selectedOffer: OfferDetails | null;
  updatingOffers: Set<number>;
}

interface AdminAllOffersActions {
  refreshOffers: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  setFilters: (filters: AllOffersFilters) => Promise<void>;
  searchOffers: (searchTerm: string) => Promise<void>;
  clearFilters: () => Promise<void>;
  approveOffer: (id: number) => Promise<void>;
  rejectOffer: (id: number, reason: string) => Promise<void>;
  loadOfferDetails: (id: number) => Promise<void>;
  clearSelectedOffer: () => void;
  clearError: () => void;
  isOfferUpdating: (id: number) => boolean;
}

export type UseAdminAllOffersReturn = AdminAllOffersState & AdminAllOffersActions;

export const useAdminAllOffers = (): UseAdminAllOffersReturn => {
  const { toast } = useToast();
  
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [totalOffers, setTotalOffers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [statistics, setStatistics] = useState<OfferStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AllOffersFilters>({ page: 1, limit: 10 });
  const [selectedOffer, setSelectedOffer] = useState<OfferDetails | null>(null);
  const [updatingOffers, setUpdatingOffers] = useState<Set<number>>(new Set());

  const refreshOffers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [offersResult, statsResult] = await Promise.all([
        adminOfferService.listAllOffers({
          page: currentPage,
          limit,
          ...filters
        }),
        adminOfferService.getOfferStatistics()
      ]);

      setOffers(offersResult.offers);
      setTotalOffers(offersResult.total);
      setTotalPages(offersResult.total_pages);
      setStatistics(statsResult);
      setLoading(false);

      toast({
        title: 'Actualizado',
        description: 'Los datos se han actualizado correctamente.',
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cargar las ofertas';
      setLoading(false);
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [currentPage, limit, filters, toast]);

  const goToPage = useCallback(async (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setLoading(true);
      setError(null);
      
      try {
        const result = await adminOfferService.listAllOffers({
          page,
          limit,
          ...filters
        });

        setOffers(result.offers);
        setTotalOffers(result.total);
        setTotalPages(result.total_pages);
        setCurrentPage(page);
        setLoading(false);
      } catch (error: any) {
        const errorMessage = error.message || 'Error al cargar la página';
        setLoading(false);
        setError(errorMessage);
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  }, [totalPages, currentPage, limit, filters, toast]);

  const setFilters = useCallback(async (newFilters: AllOffersFilters) => {
    const finalFilters = { ...filters, ...newFilters, page: 1 };
    setFiltersState(finalFilters);
    setLoading(true);
    setError(null);
    
    try {
      const result = await adminOfferService.listAllOffers({
        ...finalFilters,
        limit
      });

      setOffers(result.offers);
      setTotalOffers(result.total);
      setTotalPages(result.total_pages);
      setCurrentPage(1);
      setLoading(false);

      toast({
        title: 'Filtros aplicados',
        description: 'Los filtros se han actualizado correctamente.',
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Error al aplicar filtros';
      setLoading(false);
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [filters, limit, toast]);

  const searchOffers = useCallback(async (searchTerm: string) => {
    const search = searchTerm.trim();
    const newFilters = { 
      ...filters, 
      search: search || undefined,
      page: 1
    };
    
    setFiltersState(newFilters);
    setLoading(true);
    setError(null);
    
    try {
      const result = await adminOfferService.listAllOffers({
        ...newFilters,
        limit
      });

      setOffers(result.offers);
      setTotalOffers(result.total);
      setTotalPages(result.total_pages);
      setCurrentPage(1);
      setLoading(false);
    } catch (error: any) {
      const errorMessage = error.message || 'Error al buscar ofertas';
      setLoading(false);
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [filters, limit, toast]);

  const clearFilters = useCallback(async () => {
    const newFilters = { page: 1, limit };
    setFiltersState(newFilters);
    setLoading(true);
    setError(null);
    
    try {
      const result = await adminOfferService.listAllOffers(newFilters);

      setOffers(result.offers);
      setTotalOffers(result.total);
      setTotalPages(result.total_pages);
      setCurrentPage(1);
      setLoading(false);

      toast({
        title: 'Filtros limpiados',
        description: 'Se han eliminado todos los filtros.',
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Error al limpiar filtros';
      setLoading(false);
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [limit, toast]);

  const approveOffer = useCallback(async (id: number) => {
    setUpdatingOffers(prev => new Set([...prev, id]));

    try {
      const result = await adminOfferService.approveOffer(id);
      
      toast({
        title: 'Oferta Aprobada',
        description: `La oferta "${result.title}" ha sido aprobada exitosamente.`,
        variant: 'default',
      });

      setOffers(prev => prev.map(offer => 
        offer.id === id 
          ? { ...offer, status: 'approved' as const, updated_at: new Date().toISOString() }
          : offer
      ));
      setUpdatingOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
    } catch (error: any) {
      const errorMessage = error.message || 'Error al aprobar la oferta';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setUpdatingOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [toast]);

  const rejectOffer = useCallback(async (id: number, reason: string) => {
    if (!reason || reason.trim().length < 10) {
      toast({
        title: 'Error de Validación',
        description: 'El motivo de rechazo debe tener al menos 10 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingOffers(prev => new Set([...prev, id]));

    try {
      const result = await adminOfferService.rejectOffer(id, reason);
      
      toast({
        title: 'Oferta Rechazada',
        description: `La oferta "${result.title}" ha sido rechazada.`,
        variant: 'default',
      });

      setOffers(prev => prev.map(offer => 
        offer.id === id 
          ? { 
              ...offer, 
              status: 'rejected' as const, 
              rejection_reason: reason,
              updated_at: new Date().toISOString() 
            }
          : offer
      ));
      setUpdatingOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
    } catch (error: any) {
      const errorMessage = error.message || 'Error al rechazar la oferta';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setUpdatingOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [toast]);

  const loadOfferDetails = useCallback(async (id: number) => {
    setLoadingDetails(true);
    setError(null);

    try {
      const details = await adminOfferService.getOfferDetails(id);
      setSelectedOffer(details);
      setLoadingDetails(false);
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cargar detalles de la oferta';
      setLoadingDetails(false);
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const clearSelectedOffer = useCallback(() => {
    setSelectedOffer(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isOfferUpdating = useCallback((id: number) => {
    return updatingOffers.has(id);
  }, [updatingOffers]);

  // Carga inicial
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [offersResult, statsResult] = await Promise.all([
          adminOfferService.listAllOffers({
            page: 1,
            limit: 10
          }),
          adminOfferService.getOfferStatistics()
        ]);

        setOffers(offersResult.offers);
        setTotalOffers(offersResult.total);
        setTotalPages(offersResult.total_pages);
        setCurrentPage(1);
        setStatistics(statsResult);
        setLoading(false);
      } catch (error: any) {
        const errorMessage = error.message || 'Error al cargar las ofertas';
        setLoading(false);
        setError(errorMessage);
      }
    };

    loadInitialData();
  }, []);

  return {
    offers,
    totalOffers,
    currentPage,
    totalPages,
    limit,
    statistics,
    loading,
    loadingDetails,
    error,
    filters,
    selectedOffer,
    updatingOffers,
    refreshOffers,
    goToPage,
    setFilters,
    searchOffers,
    clearFilters,
    approveOffer,
    rejectOffer,
    loadOfferDetails,
    clearSelectedOffer,
    clearError,
    isOfferUpdating,
  };
};