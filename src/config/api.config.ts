export const API_CONFIG = {
    // Durante desarrollo, usamos el proxy configurado en Vite
    BASE_URL: import.meta.env.VITE_API_URL,
    TIMEOUT: 15000, // 15 segundos de timeout por defecto
    ENDPOINTS: {
        PING: '/ping',
        // Aquí irán otros endpoints
    }
} as const;

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};