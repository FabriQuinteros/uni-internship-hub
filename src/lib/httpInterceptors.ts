/**
 * HTTP Interceptors - Sistema para interceptar peticiones HTTP y manejar tokens automáticamente
 * Agrega automáticamente el token Bearer y maneja errores 401
 */

import { authService } from '@/services/authService';

// Tipos para los interceptores
export interface RequestConfig {
  url: string;
  options: RequestInit;
}

export interface ResponseError {
  status: number;
  message: string;
  url: string;
}

class HttpInterceptors {
  private static instance: HttpInterceptors;
  private isRedirectingToLogin = false;

  private constructor() {}

  public static getInstance(): HttpInterceptors {
    if (!HttpInterceptors.instance) {
      HttpInterceptors.instance = new HttpInterceptors();
    }
    return HttpInterceptors.instance;
  }

  /**
   * Lista de rutas que NO requieren token de autenticación
   */
  private readonly PUBLIC_ROUTES = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/user/forgot-password',
    '/api/user/reset-password',
    '/api/organizations/register',
    '/api/students/register',
    '/ping',
  ];

  /**
   * Verifica si una URL es pública (no requiere autenticación)
   */
  private isPublicRoute(url: string): boolean {
    return this.PUBLIC_ROUTES.some(route => {
      // Crear un objeto URL para comparar solo el pathname
      try {
        const urlObj = new URL(url, window.location.origin);
        return urlObj.pathname === route || urlObj.pathname.startsWith(route);
      } catch {
        // Si no es una URL válida, comparar directamente
        return url === route || url.startsWith(route);
      }
    });
  }

  /**
   * Intercepta las peticiones para agregar automáticamente el token
   */
  private interceptRequest = (url: string, options: RequestInit): RequestInit => {
    // Si es una ruta pública, no agregar token
    if (this.isPublicRoute(url)) {
      return options;
    }

    // Obtener headers existentes o crear objeto nuevo
    const headers = new Headers(options.headers);

    // Agregar token si el usuario está autenticado
    if (authService.isAuthenticated()) {
      const token = authService.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Asegurar que Content-Type esté configurado para JSON si no existe
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    return {
      ...options,
      headers,
    };
  };

  /**
   * Intercepta las respuestas para manejar errores de autenticación
   */
  private interceptResponse = async (response: Response, url: string): Promise<Response> => {
    // Si la respuesta es 401 y no estamos ya redirigiendo
    if (response.status === 401 && !this.isRedirectingToLogin) {
      await this.handleUnauthorized(url);
    }

    // Si la respuesta es 403, podría ser un problema de permisos
    if (response.status === 403) {
      console.warn('Acceso denegado a:', url);
      // Aquí podrías mostrar un mensaje específico de permisos
    }

    return response;
  };

  /**
   * Maneja errores 401 (No autorizado)
   */
  private async handleUnauthorized(url: string): Promise<void> {
    // Evitar múltiples redirecciones simultáneas
    if (this.isRedirectingToLogin) return;
    
    this.isRedirectingToLogin = true;

    try {
      // Limpiar tokens y datos de autenticación
      await authService.logout();
      
      // Solo redirigir si no estamos ya en una página de autenticación
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/auth/') && !currentPath.includes('/login')) {
        // Guardar la URL actual para redirigir después del login
        const returnUrl = window.location.pathname + window.location.search;
        
        // Redirigir al login con la URL de retorno
        window.location.href = `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`;
      }
    } catch (error) {
      console.error('Error manejando 401:', error);
    } finally {
      // Resetear el flag después de un breve delay
      setTimeout(() => {
        this.isRedirectingToLogin = false;
      }, 1000);
    }
  }

  /**
   * Fetch interceptado que maneja automáticamente tokens y errores
   */
  public async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      // Interceptar la petición para agregar token
      const interceptedOptions = this.interceptRequest(url, options);
      
      // Realizar la petición
      const response = await fetch(url, interceptedOptions);
      
      // Interceptar la respuesta para manejar errores
      return await this.interceptResponse(response, url);
    } catch (error) {
      console.error('Error en petición HTTP:', error);
      throw error;
    }
  }

  /**
   * Método de conveniencia para peticiones GET
   */
  public async get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * Método de conveniencia para peticiones POST
   */
  public async post(url: string, body?: any, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Método de conveniencia para peticiones PUT
   */
  public async put(url: string, body?: any, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Método de conveniencia para peticiones DELETE
   */
  public async delete(url: string, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Verifica y actualiza el estado de autenticación
   */
  public async checkAuthStatus(): Promise<boolean> {
    try {
      if (!authService.isAuthenticated()) {
        return false;
      }

      // Verificar si el token está cerca de expirar
      if (authService.isTokenNearExpiry()) {
        console.warn('Token cerca de expirar');
        // Aquí podrías implementar renovación automática de token si el backend lo soporta
      }

      return true;
    } catch (error) {
      console.error('Error verificando estado de auth:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const httpClient = HttpInterceptors.getInstance();

// También exportar como default
export default httpClient;