/**
 * Hook para gestión completa de TODAS las ofertas del administrador
 * Incluye filtros avanzados y actualización en tiempo real
 */

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AdminOffer,
  AllOffersFilters,
  OfferStatistics,
  OfferDetails
} from '@/types/admin-offers';

/**
 * Estado del hook de gestión de todas las ofertas
 */
interface AdminAllOffersState {
  // Ofertas
  offers: AdminOffer[];
  totalOffers: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  
  // Estadísticas
  statistics: OfferStatistics | null;
  
  // Estados de carga
  loading: boolean;
  loadingDetails: boolean;
  
  // Errores
  error: string | null;
  
  // Filtros actuales
  filters: AllOffersFilters;
  
  // Detalles de oferta seleccionada
  selectedOffer: OfferDetails | null;
  
  // IDs de ofertas en proceso de actualización
  updatingOffers: Set<number>;
}

/**
 * Acciones del hook
 */
interface AdminAllOffersActions {
  // Cargar ofertas
  refreshOffers: () => Promise<void>;
  
  // Paginación
  goToPage: (page: number) => void;
  
  // Filtros y búsqueda
  setFilters: (filters: AllOffersFilters) => void;
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
export type UseAdminAllOffersReturn = AdminAllOffersState & AdminAllOffersActions;

/**
 * Hook principal para gestión de todas las ofertas
 */
export const useAdminAllOffers = (): UseAdminAllOffersReturn => {
  const { toast } = useToast();
  
  // Datos mock completos (simulación de base de datos)
  const allMockOffers: AdminOffer[] = [
    {
      id: 1,
      title: 'Desarrollador Full Stack - React + Node.js',
      organization_id: 1,
      organization_name: 'TechCorp S.A.',
      description: 'Buscamos desarrollador full stack para proyecto de e-commerce. Trabajarás con React, Node.js, PostgreSQL y AWS. Proyecto innovador con gran proyección.',
      status: 'pending',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      salary: 50000,
      quota: 2,
      application_deadline: '2025-12-31',
      modality: 'Remoto',
      location: 'Buenos Aires',
      duration: '6 meses',
      technologies: [1, 2, 3]
    },
    {
      id: 2,
      title: 'Analista de Datos - Power BI y Python',
      organization_id: 2,
      organization_name: 'DataCorp',
      description: 'Oportunidad para analista de datos junior. Trabajarás con Power BI, Python y SQL para análisis de datos empresariales y visualización.',
      status: 'pending',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      salary: 45000,
      quota: 1,
      application_deadline: '2025-11-30',
      modality: 'Híbrido',
      location: 'Córdoba',
      duration: '4 meses',
      technologies: [4, 5],
      applications_count: 3
    },
    {
      id: 3,
      title: 'Diseñador UX/UI - Figma',
      organization_id: 3,
      organization_name: 'DesignStudio',
      description: 'Buscamos diseñador UX/UI creativo para aplicación móvil. Experiencia en Figma, prototipado y design thinking.',
      status: 'approved',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      published_start_date: '2025-10-07',
      salary: 48000,
      quota: 1,
      application_deadline: '2025-12-15',
      modality: 'Híbrido',
      location: 'Buenos Aires',
      duration: '5 meses',
      technologies: [6, 7],
      applications_count: 8
    },
    {
      id: 4,
      title: 'DevOps Engineer - AWS y Docker',
      organization_id: 1,
      organization_name: 'TechCorp S.A.',
      description: 'Posición para DevOps en equipo de infraestructura. AWS, Docker, Kubernetes, CI/CD. Ambiente ágil y colaborativo.',
      status: 'pending',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      salary: 55000,
      quota: 1,
      application_deadline: '2025-12-20',
      modality: 'Remoto',
      location: 'Buenos Aires',
      duration: '6 meses',
      technologies: [8, 9, 10]
    },
    {
      id: 5,
      title: 'Mobile Developer - React Native',
      organization_id: 4,
      organization_name: 'MobileApps Inc',
      description: 'Desarrollador mobile para app fintech. React Native, TypeScript, integración con APIs REST.',
      status: 'approved',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
      published_start_date: '2025-10-02',
      salary: 52000,
      quota: 2,
      application_deadline: '2025-12-10',
      modality: 'Remoto',
      location: 'Córdoba',
      duration: '6 meses',
      technologies: [11, 12],
      applications_count: 12
    },
    {
      id: 6,
      title: 'QA Tester - Automation',
      organization_id: 5,
      organization_name: 'QualitySoft',
      description: 'Tester QA para automatización de pruebas. Selenium, Cypress, Jenkins. Trabajo en equipo ágil.',
      status: 'rejected',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      salary: 40000,
      quota: 2,
      application_deadline: '2025-11-15',
      modality: 'Presencial',
      location: 'Mendoza',
      duration: '4 meses',
      technologies: [13, 14],
      rejection_reason: 'La descripción de la oferta no cumple con los requisitos mínimos. Por favor, proporcione más detalles sobre las responsabilidades y requisitos específicos.'
    },
    {
      id: 7,
      title: 'Backend Developer - Java Spring',
      organization_id: 6,
      organization_name: 'Enterprise Solutions',
      description: 'Desarrollador backend para sistema empresarial. Java, Spring Boot, microservicios, PostgreSQL.',
      status: 'approved',
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      published_start_date: '2025-09-27',
      salary: 53000,
      quota: 1,
      application_deadline: '2025-11-30',
      modality: 'Híbrido',
      location: 'Buenos Aires',
      duration: '6 meses',
      technologies: [15, 16],
      applications_count: 6
    },
    {
      id: 8,
      title: 'Frontend Developer - Vue.js',
      organization_id: 7,
      organization_name: 'WebDev Studio',
      description: 'Desarrollador frontend para plataforma educativa. Vue.js 3, Vuex, TypeScript, diseño responsive.',
      status: 'pending',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      salary: 47000,
      quota: 2,
      application_deadline: '2025-12-05',
      modality: 'Remoto',
      location: 'Córdoba',
      duration: '5 meses',
      technologies: [17, 18]
    },
    {
      id: 9,
      title: 'Data Scientist - Machine Learning',
      organization_id: 2,
      organization_name: 'DataCorp',
      description: 'Científico de datos para proyectos de ML. Python, scikit-learn, TensorFlow, análisis estadístico.',
      status: 'rejected',
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      salary: 60000,
      quota: 1,
      application_deadline: '2025-12-01',
      modality: 'Híbrido',
      location: 'Buenos Aires',
      duration: '6 meses',
      technologies: [19, 20],
      rejection_reason: 'El salario propuesto está por encima del rango permitido para pasantías universitarias.'
    },
    {
      id: 10,
      title: 'Cybersecurity Analyst',
      organization_id: 8,
      organization_name: 'SecureNet',
      description: 'Analista de ciberseguridad para análisis de vulnerabilidades. Pentesting, análisis de logs, monitoreo.',
      status: 'approved',
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
      published_start_date: '2025-09-22',
      salary: 51000,
      quota: 1,
      application_deadline: '2025-11-20',
      modality: 'Presencial',
      location: 'Mendoza',
      duration: '6 meses',
      technologies: [21, 22],
      applications_count: 4
    },
    {
      id: 11,
      title: 'Business Intelligence Analyst',
      organization_id: 9,
      organization_name: 'Analytics Pro',
      description: 'Analista BI para reportes ejecutivos. SQL avanzado, Tableau, ETL, modelado de datos.',
      status: 'pending',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      salary: 46000,
      quota: 1,
      application_deadline: '2025-12-08',
      modality: 'Híbrido',
      location: 'Rosario',
      duration: '5 meses',
      technologies: [23, 24]
    },
    {
      id: 12,
      title: 'Cloud Architect - Azure',
      organization_id: 10,
      organization_name: 'CloudTech Solutions',
      description: 'Arquitecto cloud para migración a Azure. Azure services, arquitectura de soluciones, infraestructura como código.',
      status: 'closed',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_at: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      published_start_date: '2025-08-17',
      salary: 58000,
      quota: 2,
      application_deadline: '2025-11-25',
      modality: 'Presencial',
      location: 'Rosario',
      duration: '6 meses',
      technologies: [25, 26],
      applications_count: 15
    }
  ];
  
  // Estado inicial
  const [state, setState] = useState<AdminAllOffersState>({
    offers: [],
    totalOffers: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    statistics: null,
    loading: false,
    loadingDetails: false,
    error: null,
    filters: { page: 1, limit: 10 },
    selectedOffer: null,
    updatingOffers: new Set<number>(),
  });

  /**
   * Actualiza el estado de forma inmutable
   */
  const updateState = useCallback((updates: Partial<AdminAllOffersState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Refresca las ofertas recargando los datos mock
   */
  const refreshOffers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    loadMockDataWithPagination(state.currentPage, state.limit);
    
    toast({
      title: 'Actualizado',
      description: 'Los datos se han actualizado correctamente.',
    });
  }, [state.currentPage, state.limit, toast]);

  /**
   * Navega a una página específica
   */
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
      setState(prev => ({ ...prev, currentPage: page, loading: true }));
      
      // Recargar datos mock con la nueva página
      setTimeout(() => {
        loadMockDataWithPagination(page, state.limit);
      }, 300);
    }
  }, [state.totalPages, state.currentPage, state.limit]);

  /**
   * Establece nuevos filtros
   */
  const setFilters = useCallback((filters: AllOffersFilters) => {
    // TODO: Implementar filtrado real cuando el backend esté listo
    updateState({ filters: { ...state.filters, ...filters } });
    
    toast({
      title: 'Filtros aplicados',
      description: 'Los filtros se han actualizado (funcionalidad mock).',
    });
  }, [state.filters, updateState, toast]);

  /**
   * Busca ofertas por término
   */
  const searchOffers = useCallback((searchTerm: string) => {
    const search = searchTerm.trim();
    // TODO: Implementar búsqueda real cuando el backend esté listo
    updateState({ 
      filters: { 
        ...state.filters, 
        search: search || undefined
      } 
    });
  }, [state.filters, updateState]);

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
    updateState({ filters: { page: 1, limit: state.limit } });
    
    toast({
      title: 'Filtros limpiados',
      description: 'Se han eliminado todos los filtros.',
    });
  }, [state.limit, updateState, toast]);

  /**
   * Aprueba una oferta
   */
  const approveOffer = useCallback(async (id: number) => {
    updateState({ 
      updatingOffers: new Set([...state.updatingOffers, id])
    });

    try {
      // TODO: Descomentar cuando el backend esté listo
      // const result = await adminOfferService.approveOffer(id);
      
      // MOCK: Simular aprobación
      const offerToApprove = state.offers.find(o => o.id === id);
      
      toast({
        title: 'Oferta Aprobada',
        description: `La oferta "${offerToApprove?.title}" ha sido aprobada exitosamente.`,
        variant: 'default',
      });

      // Actualizar la oferta en la lista local
      setState(prev => ({
        ...prev,
        offers: prev.offers.map(offer => 
          offer.id === id 
            ? { ...offer, status: 'approved' as const, updated_at: new Date().toISOString() }
            : offer
        ),
        updatingOffers: new Set([...prev.updatingOffers].filter(offerId => offerId !== id))
      }));
      
    } catch (error: any) {
      const errorMessage = error.message || 'Error al aprobar la oferta';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      updateState({ 
        updatingOffers: new Set([...state.updatingOffers].filter(offerId => offerId !== id))
      });
    }
  }, [updateState, state.updatingOffers, state.offers, toast]);

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
      updatingOffers: new Set([...state.updatingOffers, id])
    });

    try {
      // TODO: Descomentar cuando el backend esté listo
      // const result = await adminOfferService.rejectOffer(id, reason);
      
      // MOCK: Simular rechazo
      const offerToReject = state.offers.find(o => o.id === id);
      
      toast({
        title: 'Oferta Rechazada',
        description: `La oferta "${offerToReject?.title}" ha sido rechazada.`,
        variant: 'default',
      });

      // Actualizar la oferta en la lista local
      setState(prev => ({
        ...prev,
        offers: prev.offers.map(offer => 
          offer.id === id 
            ? { 
                ...offer, 
                status: 'rejected' as const, 
                rejection_reason: reason,
                updated_at: new Date().toISOString() 
              }
            : offer
        ),
        updatingOffers: new Set([...prev.updatingOffers].filter(offerId => offerId !== id))
      }));
      
    } catch (error: any) {
      const errorMessage = error.message || 'Error al rechazar la oferta';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      updateState({ 
        updatingOffers: new Set([...state.updatingOffers].filter(offerId => offerId !== id))
      });
    }
  }, [updateState, state.updatingOffers, state.offers, toast]);

  /**
   * Carga los detalles completos de una oferta
   */
  const loadOfferDetails = useCallback(async (id: number) => {
    updateState({ loadingDetails: true, error: null });

    try {
      // TODO: Descomentar cuando el backend esté listo
      // const details = await adminOfferService.getOfferDetails(id);
      
      // MOCK: Buscar la oferta en los datos mock
      const offerFound = allMockOffers.find(offer => offer.id === id);
      
      if (!offerFound) {
        throw new Error('Oferta no encontrada');
      }
      
      // Convertir AdminOffer a OfferDetails (agregar campos adicionales si es necesario)
      const details: OfferDetails = {
        id: offerFound.id,
        title: offerFound.title,
        organization_id: offerFound.organization_id,
        organization_name: offerFound.organization_name,
        description: offerFound.description,
        status: (offerFound.status === 'pending' || offerFound.status === 'rejected' 
          ? offerFound.status 
          : 'pending') as 'pending' | 'rejected',
        created_at: offerFound.created_at,
        submitted_at: offerFound.submitted_at || new Date().toISOString(),
        salary: offerFound.salary,
        quota: offerFound.quota,
        application_deadline: offerFound.application_deadline || '',
        requirements: 'Requisitos:\n• Estudiante universitario activo\n• Conocimientos en las tecnologías indicadas\n• Capacidad de trabajo en equipo\n• Proactividad y ganas de aprender',
        modality: offerFound.modality,
        duration_text: offerFound.duration,
        location_text: offerFound.location,
        weekly_hours: 40,
        shift: 'Flexible',
        published_start_date: offerFound.published_start_date || null,
        technologies: offerFound.technologies || [],
        updated_at: offerFound.updated_at,
        rejection_reason: offerFound.rejection_reason
      };
      
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

  /**
   * Carga datos mock con paginación
   */
  const loadMockDataWithPagination = (page: number, limit: number) => {
    const mockStats: OfferStatistics = {
      total: 12,
      by_status: {
        draft: 0,
        pending: 5,
        approved: 4,
        rejected: 2,
        closed: 1
      },
      recent_approvals: 1,
      recent_rejections: 0,
      pending_review: 5
    };

    // Simular paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOffers = allMockOffers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allMockOffers.length / limit);

    setState(prev => ({
      ...prev,
      offers: paginatedOffers,
      totalOffers: allMockOffers.length,
      currentPage: page,
      totalPages: totalPages,
      statistics: mockStats,
      loading: false
    }));
  };

  // Carga inicial de ofertas con datos mock
  useEffect(() => {
    loadMockDataWithPagination(1, 10);
  }, []);

  return {
    // Estado
    ...state,
    
    // Acciones
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
