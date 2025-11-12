/**
 * Hook para obtener estadísticas de estudiantes (Admin)
 * Endpoint: GET /api/admin/students/stats
 */

import { useState, useCallback } from 'react';
import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
}

interface StudentStatsResponse {
  data: StudentStats;
}

export const useAdminStudentsStats = () => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL(API_CONFIG.ENDPOINTS.STUDENTS.ADMIN.STATS, API_CONFIG.BASE_URL);
      const response = await httpClient.get(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: StudentStatsResponse = await response.json();
      setStats(data.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar estadísticas de estudiantes';
      setError(errorMessage);
      console.error('Error fetching student stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats
  };
};
