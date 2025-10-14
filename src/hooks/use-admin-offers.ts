/**
 * Hook para gestión administrativa de ofertas
 * Maneja el estado y las operaciones de aprobación/rechazo de ofertas
 */

import { useState, useCallback, useEffect } from 'react';
import { adminOfferService } from '@/services/adminOfferService';
import { useToast } from '@/hooks/use-toast';
import {
  PendingOffer,
  PendingOffersFilters,
  OfferDetails,
  ApprovalDecision
} from '@/types/admin-offers';

/**
 * Estado del hook de administración de ofertas
 */
interface AdminOffersState {
  // Ofertas pendientes
  pendingOffers: PendingOffer[];
  totalOffers: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  
  // Estados de carga
  loading: boolean;
  loadingApproval: boolean;
  loadingDetails: boolean;
  
  // Errores
  error: string | null;
  
  // Filtros actuales
  filters: PendingOffersFilters;
  
  // Detalles de oferta seleccionada
  selectedOffer: OfferDetails | null;
  
  // IDs de ofertas en proceso de actualización
  updatingOffers: Set<number>;
}

/**
 * Acciones del hook de administración de ofertas
 */
interface AdminOffersActions {
  // Cargar ofertas
  fetchPendingOffers: (filters?: PendingOffersFilters) => Promise<void>;
  refreshOffers: () => Promise<void>;
  
  // Paginación
  goToPage: (page: number) => void;
  changePageSize: (limit: number) => void;
  
  // Filtros y búsqueda
  setFilters: (filters: PendingOffersFilters) => void;
  searchOffers: (searchTerm: string) => void;
  clearFilters: () => void;
  
  // Aprobación/Rechazo
  approveOffer: (id: number) => Promise<void>;
  rejectOffer: (id: number, reason: string) => Promise<void>;
  
  // Detalles de oferta
  loadOfferDetails: (id: number) => Promise<void>;
  clearSelectedOffer: () => void;
  
  // Utilidades
  clearError: () => void;
  isOfferUpdating: (id: number) => boolean;
}

/**
 * Tipo de retorno del hook
 */
export type UseAdminOffersReturn = AdminOffersState & AdminOffersActions;

/**
 * Hook principal para administración de ofertas
 */
export const useAdminOffers = (): UseAdminOffersReturn => {
  const { toast } = useToast();
  
  // Estado inicial
  const [state, setState] = useState<AdminOffersState>({
    pendingOffers: [],
    totalOffers: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    loading: false,
    loadingApproval: false,
    loadingDetails: false,
    error: null,
    filters: { page: 1, limit: 10 },
    selectedOffer: null,
    updatingOffers: new Set<number>(),
  });

  /**
   * Actualiza el estado de forma inmutable
   */
  const updateState = useCallback((updates: Partial<AdminOffersState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Carga las ofertas pendientes con filtros
   */
  const fetchPendingOffers = useCallback(async (filters?: PendingOffersFilters) => {
    const finalFilters = { ...state.filters, ...filters };
    
    updateState({ 
      loading: true, 
      error: null,
      filters: finalFilters
    });

    try {
      const data = await adminOfferService.listPendingOffers(finalFilters);
      
      updateState({
        pendingOffers: data?.offers || [],
        totalOffers: data?.total || 0,
        currentPage: data?.page || 1,
        totalPages: data?.total_pages || 1,
        limit: finalFilters.limit || 10,
        loading: false
      });
      
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cargar ofertas pendientes';
      updateState({ 
        error: errorMessage, 
        loading: false 
      });
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [state.filters, updateState, toast]);

  /**
   * Refresca las ofertas con los filtros actuales
   */
  const refreshOffers = useCallback(async () => {
    await fetchPendingOffers(state.filters);
  }, [fetchPendingOffers, state.filters]);

  /**
   * Navega a una página específica
   */
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
      fetchPendingOffers({ ...state.filters, page });
    }
  }, [fetchPendingOffers, state.filters, state.totalPages, state.currentPage]);

  /**
   * Cambia el tamaño de página
   */
  const changePageSize = useCallback((limit: number) => {
    if (limit !== state.limit) {
      fetchPendingOffers({ ...state.filters, page: 1, limit });
    }
  }, [fetchPendingOffers, state.filters, state.limit]);

  /**
   * Establece nuevos filtros
   */
  const setFilters = useCallback((filters: PendingOffersFilters) => {
    fetchPendingOffers({ ...state.filters, ...filters, page: 1 });
  }, [fetchPendingOffers, state.filters]);

  /**
   * Busca ofertas por término
   */
  const searchOffers = useCallback((searchTerm: string) => {
    const search = searchTerm.trim();
    fetchPendingOffers({ 
      ...state.filters, 
      search: search || undefined, 
      page: 1 
    });
  }, [fetchPendingOffers, state.filters]);

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
    fetchPendingOffers({ page: 1, limit: state.limit });
  }, [fetchPendingOffers, state.limit]);

  /**
   * Aprueba una oferta
   */
  const approveOffer = useCallback(async (id: number) => {
    updateState({ 
      loadingApproval: true,
      updatingOffers: new Set([...state.updatingOffers, id])
    });

    try {
      const result = await adminOfferService.approveOffer(id);
      
      toast({
        title: 'Oferta Aprobada',
        description: `La oferta "${result.title}" ha sido aprobada exitosamente.`,
        variant: 'default',
      });

      // Refrescar la lista después de aprobar
      await refreshOffers();
      
    } catch (error: any) {
      const errorMessage = error.message || 'Error al aprobar la oferta';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      updateState({ 
        loadingApproval: false,
        updatingOffers: new Set([...state.updatingOffers].filter(offerId => offerId !== id))
      });
    }
  }, [updateState, state.updatingOffers, toast, refreshOffers]);

  /**
   * Rechaza una oferta con motivo
   */
  const rejectOffer = useCallback(async (id: number, reason: string) => {
    if (!reason || reason.trim().length < 10) {
      toast({
        title: 'Error de Validación',
        description: 'El motivo de rechazo debe tener al menos 10 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    updateState({ 
      loadingApproval: true,
      updatingOffers: new Set([...state.updatingOffers, id])
    });

    try {
      const result = await adminOfferService.rejectOffer(id, reason);
      
      toast({
        title: 'Oferta Rechazada',
        description: `La oferta "${result.title}" ha sido rechazada.`,
        variant: 'default',
      });

      // Refrescar la lista después de rechazar
      await refreshOffers();
      
    } catch (error: any) {
      const errorMessage = error.message || 'Error al rechazar la oferta';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      updateState({ 
        loadingApproval: false,
        updatingOffers: new Set([...state.updatingOffers].filter(offerId => offerId !== id))
      });
    }
  }, [updateState, state.updatingOffers, toast, refreshOffers]);

  /**
   * Carga los detalles completos de una oferta
   */
  const loadOfferDetails = useCallback(async (id: number) => {
    updateState({ loadingDetails: true, error: null });

    try {
      const details = await adminOfferService.getOfferDetails(id);
      updateState({ 
        selectedOffer: details, 
        loadingDetails: false 
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cargar detalles de la oferta';
      updateState({ 
        error: errorMessage, 
        loadingDetails: false 
      });
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [updateState, toast]);

  /**
   * Limpia la oferta seleccionada
   */
  const clearSelectedOffer = useCallback(() => {
    updateState({ selectedOffer: null });
  }, [updateState]);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  /**
   * Verifica si una oferta está en proceso de actualización
   */
  const isOfferUpdating = useCallback((id: number) => {
    return state.updatingOffers.has(id);
  }, [state.updatingOffers]);

  // Carga inicial de ofertas
  useEffect(() => {
    fetchPendingOffers();
  }, []); // Solo en mount inicial

  return {
    // Estado
    ...state,
    
    // Acciones
    fetchPendingOffers,
    refreshOffers,
    goToPage,
    changePageSize,
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