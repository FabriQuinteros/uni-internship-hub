import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';

// Creamos una instancia de axios con configuración base
export const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Aquí puedes manejar errores globalmente
        // Por ejemplo, redireccionar al login si hay un 401
        if (error.response?.status === 401) {
            // Manejar unauthorized
        }
        return Promise.reject(error);
    }
);