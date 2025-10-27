/**
 * Tipos de datos para ofertas visibles para estudiantes
 * Solo incluye ofertas en estado "approved"
 */

/**
 * Turnos disponibles para las ofertas
 */
export type OfferShift = "morning" | "afternoon" | "mixed";

/**
 * Estado de la oferta
 */
export type OfferStatus = "approved" | "pending" | "rejected";

/**
 * Estado de la postulación
 */
export type ApplicationStatus = 
  | "pending_admin"      // Pendiente de aprobación del admin
  | "approved_admin"     // Aprobada por admin
  | "rejected_admin"     // Rechazada por admin
  | "pending_org"        // Pendiente de evaluación de la organización
  | "accepted"           // Aceptada por la organización
  | "rejected_org";      // Rechazada por la organización

/**
 * Oferta resumida para listado de estudiantes
 * Estructura según respuesta del backend
 */
export interface StudentOffer {
  // Identificadores
  id: number;
  organization_id: number;
  organization_name: string;

  // Información básica
  title: string;
  description: string;
  requirements: string;

  // Información de catálogos (pueden ser null)
  position_id: number | null;
  position_name: string | null;

  modality_id: number | null;
  modality_name: string | null;

  location_id: number | null;
  location_name: string | null;

  duration_id: number | null;
  duration_name: string | null;
  duration_months?: number | null; // Cantidad de meses de duración

  // Tecnologías requeridas (siempre array, puede estar vacío)
  technologies: number[];

  // Detalles adicionales
  salary: number | null;
  quota: number;
  weekly_hours: number;
  shift: OfferShift;

  // Fechas importantes
  published_start_date: string; // YYYY-MM-DD
  application_deadline: string; // YYYY-MM-DD

  // Información adicional de la organización (solo en detalles)
  organization_description?: string;
  organization_address?: string;
  organization_industry?: string;

  // Metadatos
  status: OfferStatus;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/**
 * Detalle completo de una oferta para vista de estudiante
 * Mismo formato que StudentOffer (alias de tipo)
 */
export type StudentOfferDetail = StudentOffer;

/**
 * Postulación de un estudiante
 * Estructura según respuesta del backend
 */
export interface StudentApplication {
  // IDs de relación
  id: number;
  student_id: number;
  offer_id: number;
  
  // Información de la oferta
  offer_title: string;
  organization_name: string;
  organization_id: number;
  
  // Detalles de la oferta (pueden ser null)
  position_id: number | null;
  position_name: string | null;
  modality_id: number | null;
  modality_name: string | null;
  location_id: number | null;
  location_name: string | null;
  duration_id: number | null;
  duration_name: string | null;
  
  // Detalles adicionales de la oferta
  weekly_hours: number;
  shift: OfferShift;
  salary: number | null;
  
  // Estado y evaluación de la postulación
  status: ApplicationStatus;
  message: string | null;
  rejection_reason: string | null;
  
  // Fechas importantes
  applied_at: string; // ISO 8601
  admin_reviewed_at: string | null; // ISO 8601
  org_evaluated_at: string | null; // ISO 8601
  
  // Estado de la oferta
  offer_status: OfferStatus;
  application_deadline: string; // YYYY-MM-DD
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
 * Respuesta del endpoint de postulaciones del estudiante
 */
export interface StudentApplicationsResponse {
  message: string;
  data: {
    applications: StudentApplication[];
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
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
 * Oferta con información de postulación calculada
 */
export interface StudentOfferWithApplication extends StudentOffer {
  has_applied: boolean;
  application_id?: number;
  application_status?: ApplicationStatus;
}

/**
 * Configuración de turnos para UI
 */
export const SHIFT_CONFIG = {
  morning: { 
    label: 'Mañana', 
    icon: '🌅',
    description: 'Turno matutino'
  },
  afternoon: { 
    label: 'Tarde', 
    icon: '🌆',
    description: 'Turno vespertino'
  },
  mixed: { 
    label: 'Mixto', 
    icon: '🔄',
    description: 'Turnos rotativos o flexibles'
  },
} as const;

/**
 * Helper para obtener el label del turno en español
 */
export const getShiftLabel = (shift: 'morning' | 'afternoon' | 'mixed'): string => {
  return SHIFT_CONFIG[shift]?.label || shift;
};

/**
 * Helper para obtener el icono del turno
 */
export const getShiftIcon = (shift: 'morning' | 'afternoon' | 'mixed'): string => {
  return SHIFT_CONFIG[shift]?.icon || '⏰';
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
