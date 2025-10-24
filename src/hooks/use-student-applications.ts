/**
 * Hook para gestión de postulaciones del estudiante
 * Endpoint: GET /api/students/applications
 */

import { useState, useCallback } from 'react';
import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';

export interface StudentApplication {
  id: number;
  offer_id: number;
  offer_title: string;
  organization_name: string;
  organization_logo?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'finalized';
  applied_at: string;
  message?: string;
  rejectionReason?: string; // Alineado con backend (camelCase)
  evaluated_at?: string;
  offer_details?: {
    position: string;
    modality: string;
    location: string;
  };
}

export interface ApplicationsFilters {
  status?: 'pending' | 'accepted' | 'rejected' | 'finalized';
  page?: number;
  limit?: number;
}

interface ApplicationsResponse {
  data: StudentApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export const useStudentApplications = () => {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  const fetchApplications = useCallback(async (filters: ApplicationsFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL(API_CONFIG.ENDPOINTS.STUDENTS.APPLICATIONS.LIST, API_CONFIG.BASE_URL);
      
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
      console.error('Error fetching student applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelApplication = useCallback(async (applicationId: number) => {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.APPLICATIONS.DELETE(applicationId)}`;
      await httpClient.delete(url);
      // Recargar la lista después de cancelar
      await fetchApplications({ page: pagination.page, limit: pagination.limit });
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cancelar la postulación';
      setError(errorMessage);
      console.error('Error canceling application:', err);
      return false;
    }
  }, [fetchApplications, pagination]);

  return {
    applications,
    loading,
    error,
    pagination,
    fetchApplications,
    cancelApplication
  };
};
