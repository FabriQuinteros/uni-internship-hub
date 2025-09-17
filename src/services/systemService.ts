import { apiClient } from '@/lib/api/apiClient';
import { API_CONFIG } from '@/config/api.config';

export const systemService = {
    /**
     * Verifica la conexión con el backend
     * @returns {Promise<string>} Respuesta del servidor
     */
    async ping(): Promise<string> {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.PING);
        return response.data.message || 'Respuesta recibida sin mensaje';
    }
};