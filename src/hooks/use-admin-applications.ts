/**
 * Hook para gestión de postulaciones desde administrador
 * Permite listar, aprobar y rechazar postulaciones
 */

import { useState, useCallback } from 'react';
import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';
import {
  AdminApplication,
  AdminApplicationsFilters,
  AdminApplicationsResponse,
  ApproveApplicationRequest,
  RejectApplicationRequest,
  AdminApplicationsStats
} from '@/types/admin-applications';

export const useAdminApplications = () => {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });

  /**
   * Obtener lista de postulaciones
   */
  const fetchApplications = useCallback(async (filters: AdminApplicationsFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL(API_CONFIG.ENDPOINTS.ADMIN.APPLICATIONS.LIST, API_CONFIG.BASE_URL);
      
      if (filters.page) url.searchParams.append('page', filters.page.toString());
      if (filters.limit) url.searchParams.append('limit', filters.limit.toString());
      if (filters.admin_status && filters.admin_status !== 'all') {
        url.searchParams.append('admin_status', filters.admin_status);
      }
      if (filters.status && filters.status !== 'all') {
        url.searchParams.append('status', filters.status);
      }
      if (filters.search) url.searchParams.append('search', filters.search);

      const response = await httpClient.get(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: AdminApplicationsResponse = await response.json();

      setApplications(data.data.applications);
      setPagination({
        page: data.data.page,
        limit: data.data.limit,
        total: data.data.total,
        total_pages: data.data.total_pages
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar las postulaciones';
      setError(errorMessage);
      console.error('Error fetching admin applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Aprobar una postulación
   */
  const approveApplication = useCallback(async (
    applicationId: number
  ): Promise<boolean> => {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN.APPLICATIONS.APPROVE(applicationId)}`;
      const response = await httpClient.put(url, {} as ApproveApplicationRequest);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al aprobar la postulación');
      }
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al aprobar la postulación';
      setError(errorMessage);
      console.error('Error approving application:', err);
      return false;
    }
  }, []);

  /**
   * Rechazar una postulación
   */
  const rejectApplication = useCallback(async (
    applicationId: number,
    data: RejectApplicationRequest
  ): Promise<boolean> => {
    try {
      // Validar que tenga motivo
      if (!data.rejection_reason || !data.rejection_reason.trim()) {
        setError('El motivo de rechazo es obligatorio');
        return false;
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN.APPLICATIONS.REJECT(applicationId)}`;
      const response = await httpClient.put(url, data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al rechazar la postulación');
      }
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al rechazar la postulación';
      setError(errorMessage);
      console.error('Error rejecting application:', err);
      return false;
    }
  }, []);

  /**
   * Obtener estadísticas de postulaciones
   */
  const fetchStats = useCallback(async (): Promise<AdminApplicationsStats | null> => {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN.APPLICATIONS.STATS}`;
      const response = await httpClient.get(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      return null;
    }
  }, []);

  return {
    applications,
    loading,
    error,
    pagination,
    fetchApplications,
    approveApplication,
    rejectApplication,
    fetchStats
  };
};
