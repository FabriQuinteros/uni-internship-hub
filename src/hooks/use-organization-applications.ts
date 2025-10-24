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
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  message?: string;
  student_profile?: {
    phone?: string;
    location?: string;
    academic_formation?: string;
    availability?: string;
    previous_experience?: string;
  };
}

export interface ApplicationsFilters {
  status?: 'pending' | 'accepted' | 'rejected';
  page?: number;
  limit?: number;
}

interface ApplicationsResponse {
  data: OfferApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface EvaluateApplicationRequest {
  decision: 'accepted' | 'rejected';
  message?: string;
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
      
      const data: ApplicationsResponse = await response.json();

      setApplications(data.data);
      setPagination(data.pagination);
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
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORGANIZATIONS.APPLICATIONS.EVALUATE(applicationId)}`;
      await httpClient.put(url, data);
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
