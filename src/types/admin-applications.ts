/**
 * Tipos para gestión de postulaciones desde administrador
 */

/**
 * Estados de postulación según el backend
 */
export type ApplicationStatus = 'pending' | 'approved' | 'accepted' | 'rejected';

/**
 * Postulación vista desde administrador
 */
export interface AdminApplication {
  id: number;
  student_id: number;
  offer_id: number;
  
  // Estado de la postulación (único campo que usa el backend)
  status: ApplicationStatus;
  
  // Fechas
  applied_at: string;
  admin_reviewed_at?: string; // Cuando el admin la revisó
  admin_reviewed_by?: number; // ID del admin que la revisó
  org_evaluated_at?: string; // Cuando la organización la evaluó
  org_evaluated_by?: number; // ID de la org que la evaluó
  
  // Mensajes
  message?: string; // Mensaje del estudiante
  rejection_reason?: string; // Motivo de rechazo (puede ser del admin o de la org)
  
  // Datos del estudiante
  student_name: string;
  student_email: string;
  student_legajo?: string; // FALTA EN BACKEND
  student_phone?: string;
  student_avatar?: string;
  student_career?: string;
  student_university?: string;
  student_skills?: string[];
  
  // Datos de la oferta
  offer_title: string;
  offer_position?: string; // FALTA EN BACKEND
  offer_location?: string; // FALTA EN BACKEND
  offer_modality?: string; // FALTA EN BACKEND
  
  // Datos de la organización
  organization_id: number;
  organization_name: string;
  organization_logo?: string;
  
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
  status?: ApplicationStatus | 'all';
  search?: string; // Buscar por nombre estudiante u oferta
  page?: number;
  limit?: number;
  offer_id?: number;
  student_id?: number;
}

/**
 * Respuesta del backend para listado de postulaciones
 */
export interface AdminApplicationsResponse {
  message: string;
  data: {
    applications: AdminApplication[];
    page?: number;
    limit?: number;
    total: number;
    total_pages?: number;
    pending_count: number;
    approved_count: number;
    rejected_count: number;
    accepted_count: number;
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
  total_applications: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  accepted_count: number;
  approval_rate: number;
  acceptance_rate: number;
}

/**
 * Configuración de estados para UI
 * - pending: Esperando revisión del admin
 * - approved: Pre-aprobada por admin, esperando evaluación de org
 * - rejected: Rechazada (por admin o por org)
 * - accepted: Aceptada por la organización
 */
export const ADMIN_STATUS_CONFIG = {
  pending: {
    label: 'Pendiente de Revisión',
    variant: 'warning' as const,
    description: 'Esperando aprobación del administrador',
    color: 'text-warning'
  },
  approved: {
    label: 'Aprobada',
    variant: 'success' as const,
    description: 'Aprobada por el administrador, esperando evaluación de la organización',
    color: 'text-success'
  },
  rejected: {
    label: 'Rechazada',
    variant: 'destructive' as const,
    description: 'Rechazada por el administrador o la organización',
    color: 'text-destructive'
  },
  accepted: {
    label: 'Aceptada',
    variant: 'default' as const,
    description: 'Aceptada por la organización',
    color: 'text-primary'
  }
} as const;
