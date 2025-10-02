// src/lib/api/apiClient.ts

import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';

// 1. Creamos la instancia de Axios con la configuración base
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. (Opcional pero MUY recomendado) Interceptores para manejar Tokens y Errores
// Interceptor de Solicitud: Se ejecuta ANTES de que cada solicitud sea enviada.
apiClient.interceptors.request.use(
  (config) => {
    // Aquí puedes añadir lógica para incluir tokens de autenticación
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    // Manejar errores en la configuración de la solicitud
    console.error('Error en la configuración de la solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor de Respuesta: Se ejecuta DESPUÉS de recibir cada respuesta.
apiClient.interceptors.response.use(
  (response) => {
    // Cualquier código de estado que se encuentre en el rango de 2xx causa que esta función se active
    // Simplemente devolvemos la respuesta
    return response;
  },
  (error) => {
    // Cualquier código de estado que esté fuera del rango de 2xx causa que esta función se active
    // Aquí puedes manejar errores globales (ej. 401 Unauthorized, 403 Forbidden)
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      // Ejemplo: si el error es 401, redirigir al login
      // if (error.response.status === 401) {
      //   window.location.href = '/login';
      // }
    } else if (error.request) {
      console.error('Network Error: No se recibió respuesta del servidor.');
    } else {
      console.error('Axios Error:', error.message);
    }
    
    // Rechazamos la promesa para que el .catch() en tu servicio o componente se active
    return Promise.reject(error);
  }
);

export { apiClient };