/**
 * Hook para gestión de ofertas para estudiantes
 * Maneja el estado, filtros y operaciones de visualización de ofertas aprobadas
 */

import { useState, useCallback, useEffect } from 'react';
import { studentOfferService } from '@/services/studentOfferService';
import { useToast } from '@/hooks/use-toast';
import {
  StudentOffer,
  StudentOfferDetail,
  StudentOffersFilters,
  StudentOffersState,
  StudentApplication,
  StudentOfferWithApplication
} from '@/types/student-offers';

/**
 * Acciones del hook de ofertas para estudiantes
 */
interface StudentOffersActions {
  // Cargar ofertas
  fetchOffers: (filters?: StudentOffersFilters) => Promise<void>;
  refreshOffers: () => Promise<void>;
  
  // Paginación
  goToPage: (page: number) => void;
  changePageSize: (limit: number) => void;
  
  // Filtros y búsqueda
  setFilters: (filters: StudentOffersFilters) => void;
  searchOffers: (searchTerm: string) => void;
  clearFilters: () => void;
  
  // Detalle de oferta
  loadOfferDetail: (id: number) => Promise<void>;
  clearSelectedOffer: () => void;
  
  // Postulaciones
  refetchApplications: () => Promise<void>;
  hasApplied: (offerId: number) => boolean;
  getApplication: (offerId: number) => StudentApplication | undefined;
  
  // Utilidades
  clearError: () => void;
}

/**
 * Tipo de retorno del hook
 */
export type UseStudentOffersReturn = StudentOffersState & 
  StudentOffersActions & {
    applications: StudentApplication[];
    offersWithApplicationStatus: StudentOfferWithApplication[];
  };

/**
 * Hook principal para ofertas de estudiantes
 */
export const useStudentOffers = (): UseStudentOffersReturn => {
  const { toast } = useToast();
  
  // Estado inicial
  const [state, setState] = useState<StudentOffersState>({
    offers: [],
    totalOffers: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 12,
    loading: false,
    loadingDetail: false,
    error: null,
    filters: { page: 1, limit: 12 },
    selectedOffer: null,
  });

  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  /**
   * Actualiza el estado de forma inmutable
   */
  const updateState = useCallback((updates: Partial<StudentOffersState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Carga las postulaciones del estudiante
   */
  const refetchApplications = useCallback(async () => {
    setLoadingApplications(true);
    try {
      // Cargar todas las postulaciones (sin límite para tener el set completo)
      const data = await studentOfferService.getMyApplications(1, 1000);
      setApplications(data?.applications || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  /**
   * Verifica si el estudiante ya se postuló a una oferta
   */
  const hasApplied = useCallback((offerId: number): boolean => {
    return applications.some((app) => app.offer_id === offerId);
  }, [applications]);

  /**
   * Obtiene la postulación si existe
   */
  const getApplication = useCallback((offerId: number): StudentApplication | undefined => {
    return applications.find((app) => app.offer_id === offerId);
  }, [applications]);

  /**
   * Combina ofertas con información de postulación
   */
  const offersWithApplicationStatus = useCallback((): StudentOfferWithApplication[] => {
    return state.offers.map((offer) => {
      const application = getApplication(offer.id);
      return {
        ...offer,
        has_applied: !!application,
        application_id: application?.id,
        application_status: application?.status,
      };
    });
  }, [state.offers, getApplication]);

  /**
   * Carga las ofertas con filtros
   */
  const fetchOffers = useCallback(async (filters?: StudentOffersFilters) => {
    const finalFilters = { ...state.filters, ...filters };
    
    updateState({ 
      loading: true, 
      error: null,
      filters: finalFilters
    });

    try {
      const data = await studentOfferService.listOffers(finalFilters);
      
      updateState({
        offers: data?.offers || [],
        totalOffers: data?.total_count || 0,
        currentPage: data?.page || 1,
        totalPages: data?.total_pages || 1,
        limit: finalFilters.limit || 12,
        loading: false
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar ofertas';
      updateState({ 
        error: errorMessage, 
        loading: false,
        offers: []
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
    await fetchOffers(state.filters);
    await refetchApplications();
  }, [fetchOffers, refetchApplications, state.filters]);

  /**
   * Navega a una página específica
   */
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
      fetchOffers({ ...state.filters, page });
    }
  }, [fetchOffers, state.filters, state.totalPages, state.currentPage]);

  /**
   * Cambia el tamaño de página
   */
  const changePageSize = useCallback((limit: number) => {
    if (limit !== state.limit) {
      fetchOffers({ ...state.filters, page: 1, limit });
    }
  }, [fetchOffers, state.filters, state.limit]);

  /**
   * Establece nuevos filtros
   */
  const setFilters = useCallback((filters: StudentOffersFilters) => {
    fetchOffers({ ...state.filters, ...filters, page: 1 });
  }, [fetchOffers, state.filters]);

  /**
   * Busca ofertas por término
   */
  const searchOffers = useCallback((searchTerm: string) => {
    const search = searchTerm.trim();
    fetchOffers({ 
      ...state.filters, 
      search: search || undefined, 
      page: 1 
    });
  }, [fetchOffers, state.filters]);

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
    fetchOffers({ page: 1, limit: state.limit });
  }, [fetchOffers, state.limit]);

  /**
   * Carga los detalles completos de una oferta
   */
  const loadOfferDetail = useCallback(async (id: number) => {
    updateState({ loadingDetail: true, error: null });

    try {
      const details = await studentOfferService.getOfferDetail(id);
      updateState({ 
        selectedOffer: details, 
        loadingDetail: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar detalles de la oferta';
      updateState({ 
        error: errorMessage, 
        loadingDetail: false 
      });
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [updateState, toast]);

  /**
   * Limpia la oferta seleccionada (cierra el modal)
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

  // Carga inicial de ofertas y postulaciones
  useEffect(() => {
    fetchOffers();
    refetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo en mount inicial

  return {
    // Estado
    ...state,
    applications,
    offersWithApplicationStatus: offersWithApplicationStatus(),
    loading: state.loading || loadingApplications,
    
    // Acciones
    fetchOffers,
    refreshOffers,
    goToPage,
    changePageSize,
    setFilters,
    searchOffers,
    clearFilters,
    loadOfferDetail,
    clearSelectedOffer,
    refetchApplications,
    hasApplied,
    getApplication,
    clearError,
  };
};
