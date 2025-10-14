import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';

export const systemService = {
    /**
     * Verifica la conexión con el backend
     * @returns {Promise<string>} Respuesta del servidor
     */
    async ping(): Promise<string> {
        const response = await httpClient.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PING}`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data?.message) {
            throw new Error("Respuesta inválida del servidor");
        }
        
        return data.message;
    }
};