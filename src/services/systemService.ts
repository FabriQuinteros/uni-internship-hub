import { apiClient } from '@/lib/api/apiClient';
import { API_CONFIG } from '@/config/api.config';

export const systemService = {
    /**
     * Verifica la conexión con el backend
     * @returns {Promise<string>} Respuesta del servidor
     */
    async ping(): Promise<string> {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.PING);
        if (!response?.data?.message) {
            throw new Error("Respuesta inválida del servidor");
          }
        return response.data.message;
    }
};