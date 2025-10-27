/**
 * Hook para gestión de ofertas para estudiantes
 * Maneja el estado, filtros y operaciones de visualización de ofertas aprobadas
 * FILTRADO DEL LADO DEL CLIENTE: Carga todas las ofertas una vez y filtra localmente
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
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
 * Implementa filtrado y paginación del lado del cliente
 */
export const useStudentOffers = (): UseStudentOffersReturn => {
  const { toast } = useToast();
  
  // Estado para todas las ofertas (sin filtrar)
  const [allOffers, setAllOffers] = useState<StudentOffer[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  
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
   * Filtra las ofertas según los criterios del lado del cliente
   */
  const applyClientFilters = useMemo(() => {
    let filtered = [...allOffers];
    const { search, modality_id, location_id, position_id } = state.filters;

    // Filtro por búsqueda de texto (título o descripción)
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(offer => 
        offer.title.toLowerCase().includes(searchLower) ||
        offer.description.toLowerCase().includes(searchLower) ||
        offer.organization_name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por modalidad
    if (modality_id) {
      filtered = filtered.filter(offer => offer.modality_id === modality_id);
    }

    // Filtro por ubicación
    if (location_id) {
      filtered = filtered.filter(offer => offer.location_id === location_id);
    }

    // Filtro por posición
    if (position_id) {
      filtered = filtered.filter(offer => offer.position_id === position_id);
    }

    return filtered;
  }, [allOffers, state.filters]);

  /**
   * Aplica paginación del lado del cliente
   */
  const applyPagination = useMemo(() => {
    const { page, limit } = state.filters;
    const startIndex = ((page || 1) - 1) * (limit || 12);
    const endIndex = startIndex + (limit || 12);
    
    const totalFiltered = applyClientFilters.length;
    const totalPages = Math.ceil(totalFiltered / (limit || 12));
    
    return {
      paginatedOffers: applyClientFilters.slice(startIndex, endIndex),
      totalOffers: totalFiltered,
      totalPages: totalPages > 0 ? totalPages : 1
    };
  }, [applyClientFilters, state.filters]);

  /**
   * Actualiza el estado con los datos filtrados y paginados
   */
  useEffect(() => {
    const { paginatedOffers, totalOffers, totalPages } = applyPagination;
    setState(prev => ({
      ...prev,
      offers: paginatedOffers,
      totalOffers,
      totalPages,
      currentPage: prev.filters.page || 1
    }));
  }, [applyPagination]);

  /**
   * Carga TODAS las ofertas una sola vez (sin filtros del backend)
   */
  const fetchAllOffers = useCallback(async () => {
    setLoadingAll(true);
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Solicitar todas las ofertas sin límite (o con límite muy alto)
      const data = await studentOfferService.listOffers({ page: 1, limit: 1000 });
      
      setAllOffers(data?.offers || []);
      setState(prev => ({ ...prev, loading: false }));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar ofertas';
      setState(prev => ({ 
        ...prev,
        error: errorMessage, 
        loading: false
      }));
      setAllOffers([]);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoadingAll(false);
    }
  }, [toast]);

  /**
   * Refresca las ofertas (recarga desde el backend)
   */
  const refreshOffers = useCallback(async () => {
    await fetchAllOffers();
    await refetchApplications();
  }, [fetchAllOffers, refetchApplications]);

  /**
   * DEPRECADO: mantenido por compatibilidad
   */
  const fetchOffers = useCallback(async (filters?: StudentOffersFilters) => {
    // No hace nada, los filtros se aplican del lado del cliente
    console.warn('fetchOffers is deprecated, filters are applied client-side');
  }, []);

  /**
   * Navega a una página específica (paginación del lado del cliente)
   */
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, page }
      }));
    }
  }, [state.totalPages, state.currentPage]);

  /**
   * Cambia el tamaño de página (paginación del lado del cliente)
   */
  const changePageSize = useCallback((limit: number) => {
    if (limit !== state.limit) {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, page: 1, limit }
      }));
    }
  }, [state.limit]);

  /**
   * Establece nuevos filtros (filtra del lado del cliente)
   */
  const setFilters = useCallback((filters: StudentOffersFilters) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters, page: 1 }
    }));
  }, []);

  /**
   * Busca ofertas por término (filtra del lado del cliente)
   */
  const searchOffers = useCallback((searchTerm: string) => {
    const search = searchTerm.trim();
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, search: search || undefined, page: 1 }
    }));
  }, []);

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: { page: 1, limit: prev.limit }
    }));
  }, []);

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
    fetchAllOffers();
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
