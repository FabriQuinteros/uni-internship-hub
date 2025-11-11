/**
 * Hook para obtener estadísticas de ofertas (Admin)
 * Endpoint: GET /api/admin/offers/stats
 */

import { useState, useCallback } from 'react';
import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';

export interface OfferStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  active: number;
  closed: number;
}

interface OfferStatsResponse {
  data: OfferStats;
}

export const useAdminOffersStats = () => {
  const [stats, setStats] = useState<OfferStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL(API_CONFIG.ENDPOINTS.ADMIN.OFFERS.STATS, API_CONFIG.BASE_URL);
      const response = await httpClient.get(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: OfferStatsResponse = await response.json();
      setStats(data.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar estadísticas de ofertas';
      setError(errorMessage);
      console.error('Error fetching offer stats:', err);
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
