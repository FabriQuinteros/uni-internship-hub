/**
 * Tipos de datos para la gestión administrativa de ofertas
 * Basado en la especificación técnica del backend
 */

// Estados de ofertas según el flujo del backend
export type OfferStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'closed';

// Tipos de decisión para aprobación/rechazo
export type ApprovalDecision = 'approved' | 'rejected';

/**
 * Interface para una oferta pendiente de aprobación (vista admin)
 */
export interface PendingOffer {
  id: number;
  title: string;
  organization_id: number;
  organization_name: string;
  description: string;
  status: 'pending' | 'rejected';
  created_at: string; // ISO 8601
  submitted_at: string; // ISO 8601
  salary?: number;
  quota: number;
  application_deadline: string; // YYYY-MM-DD
}

/**
 * Interface para la respuesta de lista de ofertas pendientes
 */
export interface PendingOffersResponse {
  message: string;
  data: {
    offers: PendingOffer[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

/**
 * Interface para la solicitud de decisión de aprobación/rechazo
 */
export interface ApproveRejectRequest {
  decision: ApprovalDecision;
  rejection_reason?: string; // Requerido solo si decision = "reject"
}

/**
 * Interface para la respuesta de decisión de aprobación/rechazo
 */
export interface ApproveRejectResponse {
  message: string;
  data: {
    id: number;
    title: string;
    status: 'approved' | 'rejected';
    rejection_reason?: string;
    updated_at: string; // ISO 8601
    message: string;
  };
}

/**
 * Interface para filtros de búsqueda de ofertas pendientes
 */
export interface PendingOffersFilters {
  page?: number; // min: 1, default: 1
  limit?: number; // min: 5, max: 100, default: 10
  search?: string; // búsqueda por título/descripción
  status?: 'pending' | 'rejected'; // filtrar por estado
}

/**
 * Interface para filtros simplificados de todas las ofertas (admin)
 */
export interface AllOffersFilters {
  page?: number; // min: 1, default: 1
  limit?: number; // min: 5, max: 100, default: 10
  search?: string; // búsqueda por título/descripción
  status?: OfferStatus; // filtrar por cualquier estado
  date_from?: string; // fecha de publicación desde (YYYY-MM-DD)
  date_to?: string; // fecha de publicación hasta (YYYY-MM-DD)
}

/**
 * Interface para oferta completa en listado de admin
 */
export interface AdminOffer {
  id: number;
  title: string;
  organization_id: number;
  organization_name: string;
  description: string;
  status: OfferStatus;
  created_at: string; // ISO 8601
  submitted_at?: string; // ISO 8601
  updated_at?: string; // ISO 8601
  published_start_date?: string | null; // YYYY-MM-DD
  salary?: number;
  quota: number;
  application_deadline?: string; // YYYY-MM-DD
  modality?: string;
  location?: string;
  duration?: string;
  technologies?: number[];
  rejection_reason?: string; // Solo si fue rechazada
  applications_count?: number; // Cantidad de postulaciones
}

/**
 * Interface para la respuesta de lista de todas las ofertas (admin)
 */
export interface AllOffersResponse {
  message: string;
  data: {
    offers: AdminOffer[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

/**
 * Interface para estadísticas de ofertas (admin)
 */
export interface OfferStatistics {
  total: number;
  by_status: {
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
    closed: number;
  };
  recent_approvals: number; // Últimas 24h
  recent_rejections: number; // Últimas 24h
  pending_review: number; // Pendientes de revisión
}

/**
 * Interface para detalles completos de una oferta (para revisión admin)
 */
export interface OfferDetails extends PendingOffer {
  requirements?: string;
  modality?: string;
  duration_text?: string;
  location_text?: string;
  weekly_hours?: number;
  shift?: string;
  published_start_date?: string | null;
  technologies?: number[];
  updated_at?: string;
  rejection_reason?: string; // Solo presente si fue rechazada
}

/**
 * Interface extendida para Offer con estados del flujo
 */
export interface OfferWithStatus {
  id?: number;
  organization_id?: number;
  position_id?: number;
  duration_id?: number;
  location_id?: number;
  modality_id?: number;
  title?: string;
  description?: string;
  requirements?: string;
  modality?: string;
  duration_text?: string;
  location_text?: string;
  salary?: number;
  quota?: number;
  published_start_date?: string | null;
  application_deadline?: string | null;
  weekly_hours?: number;
  shift?: string;
  status?: OfferStatus; // Estados del flujo del backend
  rejection_reason?: string; // Motivo de rechazo si aplica
  technologies?: number[];
  created_at?: string;
  updated_at?: string;
  submitted_at?: string; // Cuándo se envió a aprobación
}

/**
 * Transiciones permitidas entre estados
 */
export const ALLOWED_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  draft: ['pending'],
  pending: ['approved', 'rejected'],
  approved: ['closed'],
  rejected: ['pending'], // Puede reenviar tras modificar
  closed: [], // Estado final
};

/**
 * Configuración de estados para UI
 */
export const OFFER_STATUS_CONFIG = {
  draft: { 
    label: 'Borrador', 
    variant: 'secondary' as const, 
    description: 'Oferta en preparación',
    visibleToStudents: false,
    canModify: true
  },
  pending: { 
    label: 'Pendiente', 
    variant: 'warning' as const,
    description: 'Esperando aprobación admin',
    visibleToStudents: false,
    canModify: false
  },
  approved: { 
    label: 'Aprobada', 
    variant: 'success' as const,
    description: 'Publicada y visible',
    visibleToStudents: true,
    canModify: false
  },
  rejected: { 
    label: 'Rechazada', 
    variant: 'destructive' as const,
    description: 'Revisar y reenviar',
    visibleToStudents: false,
    canModify: true
  },
  closed: { 
    label: 'Cerrada', 
    variant: 'outline' as const,
    description: 'Finalizada por organización',
    visibleToStudents: false,
    canModify: false
  },
} as const;