/**
 * Hook para gestión de postulaciones recibidas por la organización
 * Endpoints:
 * - GET /api/organizations/offers/:offerId/applications
 * - PUT /api/organizations/applications/:applicationId/evaluate
 */

import { useState, useCallback } from 'react';
import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';

export interface OfferApplication {
  id: number;
  student_id: number;
  student_name: string;
  student_legajo: string;
  student_email: string;
  student_phone?: string;
  student_avatar?: string;
  student_skills?: string[];
  career?: string;
  university?: string;
  student_location?: string;
  student_availability?: string;
  status: 'pending' | 'approved' | 'accepted' | 'rejected' | 'finalized';
  applied_at: string;
  message?: string;
  rejection_reason?: string; // Nombre correcto del backend
  rejectionReason?: string; // Mantener para compatibilidad
  admin_reviewed_at?: string;
  org_evaluated_at?: string;
  evaluated_at?: string; // Mantener para compatibilidad
  student_profile?: {
    phone?: string;
    location?: string;
    academic_formation?: string;
    availability?: string;
    previous_experience?: string;
  };
}

export interface ApplicationsFilters {
  status?: 'pending' | 'approved' | 'accepted' | 'rejected' | 'finalized';
  page?: number;
  limit?: number;
}

interface ApplicationsResponse {
  applications: OfferApplication[];
  total: number;
  approvedCount?: number;
  acceptedCount?: number;
  rejectedCount?: number;
}

interface EvaluateApplicationRequest {
  status: 'accepted' | 'rejected';
  reason?: string; // Campo para el frontend
}

// Formato que espera el backend (con mayúsculas)
interface EvaluateApplicationBackendRequest {
  Decision: 'accepted' | 'rejected';
  Reason?: string;
}

export const useOrganizationApplications = () => {
  const [applications, setApplications] = useState<OfferApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  /**
   * Transforma una aplicación del formato backend (camelCase) al formato del frontend (snake_case)
   */
  const transformApplication = (app: any): OfferApplication => {
    return {
      id: app.id,
      student_id: app.student_id || app.studentId,
      student_name: app.student_name || app.studentName,
      student_legajo: app.student_legajo || app.studentLegajo,
      student_email: app.student_email || app.studentEmail,
      student_phone: app.student_phone || app.studentPhone,
      student_avatar: app.student_avatar || app.studentAvatar,
      student_skills: app.student_skills || app.studentSkills,
      career: app.career,
      university: app.university,
      student_location: app.student_location || app.studentLocation,
      student_availability: app.student_availability || app.studentAvailability,
      status: app.status,
      applied_at: app.applied_at || app.appliedAt,
      message: app.message,
      rejection_reason: app.rejection_reason || app.rejectionReason,
      rejectionReason: app.rejectionReason || app.rejection_reason,
      admin_reviewed_at: app.admin_reviewed_at || app.adminReviewedAt,
      org_evaluated_at: app.org_evaluated_at || app.orgEvaluatedAt,
      evaluated_at: app.evaluated_at || app.evaluatedAt,
      student_profile: app.student_profile || app.studentProfile ? {
        phone: app.student_profile?.phone || app.studentProfile?.phone || app.studentPhone,
        location: app.student_profile?.location || app.studentProfile?.location || app.studentLocation,
        academic_formation: app.student_profile?.academic_formation || app.studentProfile?.academicFormation,
        availability: app.student_profile?.availability || app.studentProfile?.availability || app.studentAvailability,
        previous_experience: app.student_profile?.previous_experience || app.studentProfile?.previousExperience,
      } : undefined,
    };
  };

  /**
   * Obtener postulaciones de una oferta específica
   */
  const fetchApplications = useCallback(async (
    offerId: number,
    filters: ApplicationsFilters = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL(
        API_CONFIG.ENDPOINTS.ORGANIZATIONS.OFFERS.APPLICATIONS(offerId),
        API_CONFIG.BASE_URL
      );
      
      if (filters.page) url.searchParams.append('page', filters.page.toString());
      if (filters.limit) url.searchParams.append('limit', filters.limit.toString());
      if (filters.status) url.searchParams.append('status', filters.status);

      const response = await httpClient.get(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();

      // Debug: Ver qué devuelve el backend
      console.log('🔍 [OfferApplications] Response from backend:', responseData);

      // Manejar respuesta anidada con wrapper "data"
      const data = responseData.data || responseData;

      console.log('🔍 [OfferApplications] Data after unwrapping:', data);

      // Manejar ambos formatos de respuesta
      if (Array.isArray(data)) {
        // Formato antiguo: array directo
        const transformedApps = data.map(transformApplication);
        setApplications(transformedApps);
        setPagination(prev => ({
          ...prev,
          total: transformedApps.length,
          total_pages: 1
        }));
      } else if (data.applications && Array.isArray(data.applications)) {
        // Formato nuevo: { applications: [], total: X, approvedCount: Y, ... }
        const transformedApps = data.applications.map(transformApplication);
        console.log('🔍 [OfferApplications] Transformed applications:', transformedApps);
        setApplications(transformedApps);
        setPagination(prev => ({
          ...prev,
          total: data.total || transformedApps.length,
          total_pages: Math.ceil((data.total || transformedApps.length) / prev.limit)
        }));
      } else {
        // Formato desconocido
        console.warn('🔍 [OfferApplications] Formato no reconocido:', data);
        setApplications([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          total_pages: 0
        }));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar las postulaciones';
      setError(errorMessage);
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Evaluar una postulación (aceptar o rechazar)
   */
  const evaluateApplication = useCallback(async (
    applicationId: number,
    data: EvaluateApplicationRequest
  ): Promise<boolean> => {
    try {
      // Validar que si es rejected, tenga reason
      if (data.status === 'rejected' && !data.reason) {
        setError('El motivo de rechazo es obligatorio');
        return false;
      }

      // Transformar al formato que espera el backend (con mayúsculas)
      const backendPayload: EvaluateApplicationBackendRequest = {
        Decision: data.status,
        Reason: data.reason || undefined
      };

      console.log('🔍 [EvaluateApplication] Sending to backend:', backendPayload);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.APPLICATIONS.EVALUATE(applicationId)}`;
      const response = await httpClient.put(url, backendPayload);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al evaluar la postulación');
      }
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al evaluar la postulación';
      setError(errorMessage);
      console.error('Error evaluating application:', err);
      return false;
    }
  }, []);

  return {
    applications,
    loading,
    error,
    pagination,
    fetchApplications,
    evaluateApplication
  };
};
