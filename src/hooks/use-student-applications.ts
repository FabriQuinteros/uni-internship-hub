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
  status: 'pending' | 'approved' | 'accepted' | 'rejected' | 'finalized';
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
  status?: 'pending' | 'approved' | 'accepted' | 'rejected' | 'finalized';
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
      
      const result = await response.json();
      
      // Transformar campos de camelCase a snake_case si es necesario
      const transformApplication = (app: any): StudentApplication => ({
        id: app.id,
        offer_id: app.offerId || app.offer_id,
        offer_title: app.offerTitle || app.offer_title,
        organization_name: app.organizationName || app.organization_name,
        organization_logo: app.organizationLogo || app.organization_logo,
        status: app.status,
        applied_at: app.appliedAt || app.applied_at,
        message: app.message,
        rejectionReason: app.rejectionReason || app.rejection_reason,
        evaluated_at: app.evaluatedAt || app.evaluated_at,
        offer_details: app.offerDetails || app.offer_details
      });
      
      // Verificar estructura de respuesta del backend
      if (result.data) {
        // Nuevo formato: { data: { applications: [...], total: X } }
        if (result.data.applications && Array.isArray(result.data.applications)) {
          const transformedApps = result.data.applications.map(transformApplication);
          setApplications(transformedApps);
          setPagination(prev => ({
            ...prev,
            total: result.data.total || transformedApps.length,
            total_pages: Math.ceil((result.data.total || transformedApps.length) / prev.limit)
          }));
        }
        // Formato alternativo: { data: [...] }
        else if (Array.isArray(result.data)) {
          const transformedApps = result.data.map(transformApplication);
          setApplications(transformedApps);
          
          if (result.pagination) {
            setPagination(result.pagination);
          } else {
            setPagination(prev => ({
              ...prev,
              total: transformedApps.length,
              total_pages: 1
            }));
          }
        }
      } 
      // Formato muy antiguo: array directo
      else if (Array.isArray(result)) {
        const transformedApps = result.map(transformApplication);
        setApplications(transformedApps);
        setPagination(prev => ({
          ...prev,
          total: transformedApps.length,
          total_pages: 1
        }));
      }
      // Sin datos
      else {
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
