/**
 * Tipos para gestión de postulaciones desde administrador
 */

/**
 * Estado de revisión del administrador
 */
export type AdminReviewStatus = 'pending_review' | 'approved' | 'rejected';

/**
 * Postulación vista desde administrador
 */
export interface AdminApplication {
  id: number;
  student_id: number;
  offer_id: number;
  
  // Estado de la postulación
  status: 'pending' | 'accepted' | 'rejected' | 'finalized';
  admin_status: AdminReviewStatus; // Estado de revisión del admin
  
  // Fechas
  applied_at: string;
  reviewed_at?: string; // Cuando el admin la revisó
  evaluated_at?: string; // Cuando la organización la evaluó
  
  // Mensajes
  message?: string; // Mensaje del estudiante
  admin_rejection_reason?: string; // Motivo de rechazo del admin
  rejectionReason?: string; // Motivo de rechazo de la organización
  
  // Datos del estudiante
  student_name: string;
  student_email: string;
  student_legajo: string;
  student_phone?: string;
  student_avatar?: string;
  student_career?: string;
  student_university?: string;
  student_skills?: string[];
  
  // Datos de la oferta
  offer_title: string;
  offer_position: string;
  offer_organization_name: string;
  offer_location: string;
  offer_modality: string;
  
  // Perfil completo del estudiante (opcional)
  student_profile?: {
    phone?: string;
    location?: string;
    academic_formation?: string;
    availability?: string;
    previous_experience?: string;
  };
}

/**
 * Filtros para búsqueda de postulaciones de admin
 */
export interface AdminApplicationsFilters {
  admin_status?: AdminReviewStatus | 'all';
  status?: 'pending' | 'accepted' | 'rejected' | 'finalized' | 'all';
  search?: string; // Buscar por nombre estudiante u oferta
  page?: number;
  limit?: number;
}

/**
 * Respuesta del backend para listado de postulaciones
 */
export interface AdminApplicationsResponse {
  message: string;
  data: {
    applications: AdminApplication[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Respuesta del backend para detalle de postulación
 */
export interface AdminApplicationDetailResponse {
  message: string;
  data: AdminApplication;
}

/**
 * Request para aprobar postulación
 */
export interface ApproveApplicationRequest {
  // Sin campos adicionales por ahora
}

/**
 * Request para rechazar postulación
 */
export interface RejectApplicationRequest {
  rejection_reason: string; // Motivo obligatorio
}

/**
 * Estadísticas de postulaciones para admin
 */
export interface AdminApplicationsStats {
  total: number;
  pending_review: number;
  approved: number;
  rejected: number;
  finalized: number;
}

/**
 * Configuración de estados para UI
 */
export const ADMIN_STATUS_CONFIG = {
  pending_review: {
    label: 'Pendiente de Revisión',
    variant: 'warning' as const,
    description: 'Esperando aprobación del administrador',
    color: 'text-warning'
  },
  approved: {
    label: 'Aprobada',
    variant: 'success' as const,
    description: 'Aprobada por el administrador',
    color: 'text-success'
  },
  rejected: {
    label: 'Rechazada por Admin',
    variant: 'destructive' as const,
    description: 'Rechazada por el administrador',
    color: 'text-destructive'
  }
} as const;
