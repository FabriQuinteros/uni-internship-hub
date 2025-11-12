/**
 * Tipos de datos para ofertas visibles para estudiantes
 * Solo incluye ofertas en estado "approved"
 */

/**
 * Oferta resumida para listado de estudiantes
 * NOTA: organization_id y organization_name NO se envían por privacidad
 * Los estudiantes solo ven el nombre de la empresa cuando su postulación tiene status: "accepted"
 */
export interface StudentOffer {
  id: number;
  organization_id?: number; // Ya NO se envía desde el backend (ofertas anónimas)
  position_id: number;
  duration_id: number;
  location_id: number;
  modality_id: number;
  title: string;
  description: string;
  requirements: string;
  salary: number;
  quota: number;
  published_start_date: string; // YYYY-MM-DD
  application_deadline: string; // YYYY-MM-DD
  weekly_hours: number;
  shift: 'morning' | 'afternoon' | 'mixed';
  status: 'approved'; // Solo ofertas aprobadas
  technologies: number[]; // IDs de tecnologías
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  industry?: string; // Rubro de la empresa (ej: "Tecnología", "Finanzas", "Salud")
  
  // Campos expandidos (si el backend los envía)
  position_name?: string;
  modality_name?: string;
  duration_name?: string;
  location_name?: string;
  organization_name?: string; // Ya NO se envía desde el backend (ofertas anónimas)
  has_applied?: boolean; // Si el estudiante ya se postuló
  application_status?: 'pending' | 'accepted' | 'rejected' | 'finalized'; // Estado de la postulación
}

/**
 * Detalle completo de una oferta para vista de estudiante
 */
export interface StudentOfferDetail extends StudentOffer {
  // Misma estructura que StudentOffer
  // El backend devuelve los mismos campos
}

/**
 * Respuesta del backend para listado de ofertas
 */
export interface StudentOffersResponse {
  message: string;
  data: {
    offers: StudentOffer[];
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
  };
}

/**
 * Respuesta del backend para detalle de oferta
 */
export interface StudentOfferDetailResponse {
  message: string;
  data: {
    offer: StudentOfferDetail;
  };
}

/**
 * Filtros para búsqueda de ofertas
 */
export interface StudentOffersFilters {
  page?: number; // Número de página, default: 1
  limit?: number; // Cantidad por página (max: 50), default: 10
  search?: string; // Buscar en título o descripción
  technology_id?: number; // Filtrar por tecnología específica
  modality_id?: number; // Filtrar por modalidad (presencial, remoto, híbrido)
  location_id?: number; // Filtrar por ubicación
  position_id?: number; // Filtrar por posición
}

/**
 * Estado de carga y datos para el hook
 */
export interface StudentOffersState {
  offers: StudentOffer[];
  totalOffers: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  loading: boolean;
  loadingDetail: boolean;
  error: string | null;
  filters: StudentOffersFilters;
  selectedOffer: StudentOfferDetail | null;
}

/**
 * Configuración de turnos para UI
 */
export const SHIFT_CONFIG = {
  morning: { 
    label: 'Turno mañana',
  },
  afternoon: { 
    label: 'Turno tarde',
  },
  mixed: { 
    label: 'Jornada completa',
  },
} as const;

/**
 * Helper para obtener el label del turno en español
 */
export const getShiftLabel = (shift: 'morning' | 'afternoon' | 'mixed'): string => {
  return SHIFT_CONFIG[shift]?.label || shift;
};

/**
 * Ayuda para formatear fechas
 */
export const formatDeadline = (deadline: string): string => {
  const date = new Date(deadline);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Vencida';
  if (diffDays === 0) return 'Vence hoy';
  if (diffDays === 1) return 'Vence mañana';
  if (diffDays <= 7) return `Vence en ${diffDays} días`;
  
  return date.toLocaleDateString('es-AR');
};
