/**
 * Hook para obtener TODAS las postulaciones de TODAS las ofertas de una organización
 * Endpoint: GET /api/organizations/applications
 */

import { useState, useCallback } from 'react';
import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';

export interface ApplicationWithOffer {
  id: number;
  offer_id: number;
  offer_title: string;
  student_id: number;
  student_name: string;
  student_legajo: string;
  student_email: string;
  student_phone?: string;
  student_avatar?: string;
  status: 'pending' | 'approved' | 'accepted' | 'rejected' | 'finalized';
  applied_at: string;
  message?: string;
  rejection_reason?: string;
  admin_reviewed_at?: string;
  org_evaluated_at?: string;
  student_profile?: {
    phone?: string;
    location?: string;
    academic_formation?: string;
    availability?: string;
    previous_experience?: string;
  };
}

export interface AllApplicationsFilters {
  status?: 'pending' | 'approved' | 'accepted' | 'rejected' | 'finalized';
  offer_id?: number;
  page?: number;
  limit?: number;
}

interface AllApplicationsResponse {
  applications: ApplicationWithOffer[];
  total: number;
  approvedCount?: number;
  acceptedCount?: number;
  rejectedCount?: number;
}

export const useOrganizationAllApplications = () => {
  const [applications, setApplications] = useState<ApplicationWithOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });
  const [stats, setStats] = useState({
    approvedCount: 0,
    acceptedCount: 0,
    rejectedCount: 0
  });

  /**
   * Transforma una aplicación del formato backend (camelCase) al formato del frontend (snake_case)
   */
  const transformApplication = (app: any): ApplicationWithOffer => {
    return {
      id: app.id,
      offer_id: app.offer_id || app.offerId,
      offer_title: app.offer_title || app.offerTitle,
      student_id: app.student_id || app.studentId,
      student_name: app.student_name || app.studentName,
      student_legajo: app.student_legajo || app.studentLegajo,
      student_email: app.student_email || app.studentEmail,
      student_phone: app.student_phone || app.studentPhone,
      student_avatar: app.student_avatar || app.studentAvatar,
      status: app.status,
      applied_at: app.applied_at || app.appliedAt,
      message: app.message,
      rejection_reason: app.rejection_reason || app.rejectionReason,
      admin_reviewed_at: app.admin_reviewed_at || app.adminReviewedAt,
      org_evaluated_at: app.org_evaluated_at || app.orgEvaluatedAt,
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
   * Obtener TODAS las postulaciones de la organización
   */
  const fetchAllApplications = useCallback(async (
    filters: AllApplicationsFilters = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL(
        `${API_CONFIG.BASE_URL}/api/organizations/applications`
      );
      
      if (filters.page) url.searchParams.append('page', filters.page.toString());
      if (filters.limit) url.searchParams.append('limit', filters.limit.toString());
      if (filters.status) url.searchParams.append('status', filters.status);
      if (filters.offer_id) url.searchParams.append('offer_id', filters.offer_id.toString());

      const response = await httpClient.get(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();

      // Debug: Ver qué devuelve el backend
      console.log('🔍 [AllApplications] Response from backend:', responseData);

      // Manejar respuesta anidada con wrapper "data"
      const data = responseData.data || responseData;

      console.log('🔍 [AllApplications] Data after unwrapping:', data);

      // Manejar diferentes formatos de respuesta
      if (Array.isArray(data)) {
        // Formato: array directo
        const transformedApps = data.map(transformApplication);
        setApplications(transformedApps);
        setPagination(prev => ({
          ...prev,
          total: transformedApps.length,
          total_pages: 1
        }));
      } else if (data.applications && Array.isArray(data.applications)) {
        // Formato: { applications: [], total: X, counters... }
        const transformedApps = data.applications.map(transformApplication);
        console.log('🔍 [AllApplications] Transformed applications:', transformedApps);
        setApplications(transformedApps);
        setPagination(prev => ({
          ...prev,
          total: data.total || transformedApps.length,
          total_pages: Math.ceil((data.total || transformedApps.length) / prev.limit)
        }));
        
        // Actualizar estadísticas si están disponibles (manejar camelCase y snake_case)
        setStats({
          approvedCount: data.approvedCount || data.approved_count || 0,
          acceptedCount: data.acceptedCount || data.accepted_count || 0,
          rejectedCount: data.rejectedCount || data.rejected_count || 0
        });
      } else {
        console.warn('Formato de respuesta no reconocido:', data);
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
      console.error('Error fetching all applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    applications,
    loading,
    error,
    pagination,
    stats,
    fetchAllApplications
  };
};
