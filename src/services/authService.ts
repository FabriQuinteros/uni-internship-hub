/**
 * AuthService - Servicio centralizado para manejo de autenticación con JWT
 * Maneja login, logout, almacenamiento de tokens y verificación de autenticación
 */

import { API_CONFIG } from '@/config/api.config';

// Tipos para el servicio de autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'organization' | 'student';
  first_name?: string;
  last_name?: string;
  name?: string;
  first_login?: boolean;
  permissions?: string[];
  exp?: number; // JWT expiration timestamp
  iat?: number; // JWT issued at timestamp
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly BASE_URL: string;

  constructor() {
    this.BASE_URL = API_CONFIG.BASE_URL || '';
  }

  /**
   * Realiza el login del usuario
   */
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const requestUrl = `${this.BASE_URL}/api/auth/login`;
      const requestBody = { email, password };
      
      console.log('🔑 Login attempt:', {
        url: requestUrl,
        email: email,
        passwordLength: password.length
      });

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📝 Response data:', data);

      if (response.ok) {
        const { token } = data as LoginResponse;
        
        // Guardar token en localStorage
        localStorage.setItem(this.TOKEN_KEY, token);
        
        // Decodificar el token para obtener información del usuario
        const user = this.decodeToken(token);
        
        return {
          success: true,
          token,
          user,
        };
      } else {
        // Manejar diferentes tipos de errores
        let errorMessage = 'Error al iniciar sesión';
        
        switch (response.status) {
          case 401:
            errorMessage = 'Credenciales incorrectas';
            break;
          case 400:
            errorMessage = 'Datos inválidos';
            break;
          case 429:
            errorMessage = 'Demasiados intentos. Intenta más tarde';
            break;
          default:
            errorMessage = data.error || 'Error del servidor';
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: 'Error de conexión. Verifica tu conexión a internet.',
      };
    }
  }

  /**
   * Realiza el logout del usuario
   */
  async logout(): Promise<void> {
    try {
      // Intentar llamar al endpoint de logout si hay token
      const token = this.getToken();
      if (token) {
        await fetch(`${this.BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
        });
      }
    } catch (error) {
      console.log('Error en logout:', error);
    } finally {
      // SIEMPRE limpiar el token localmente
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  /**
   * Obtiene el token almacenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene headers de autorización para peticiones
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      if (!payload) return false;

      // Verificar si el token no está expirado
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem(this.TOKEN_KEY);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      localStorage.removeItem(this.TOKEN_KEY);
      return false;
    }
  }

  /**
   * Obtiene la información del usuario desde el token
   */
  getCurrentUser(): AuthUser | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return this.decodeToken(token);
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  /**
   * Decodifica el token JWT para extraer la información del usuario
   */
  private decodeToken(token: string): AuthUser | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido');
      }

      const payload = JSON.parse(atob(parts[1]));
      
      console.log('🔍 JWT Payload decoded:', payload);
      
      return {
        id: payload.id?.toString() || '',
        email: payload.email || '',
        role: payload.role || 'student',
        first_name: payload.first_name,
        last_name: payload.last_name,
        name: payload.name,
        first_login: payload.first_login,
        permissions: payload.permissions || [],
        exp: payload.exp,
        iat: payload.iat,
      } as AuthUser;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  /**
   * Verifica si el token está cerca de expirar (menos de 5 minutos)
   */
  isTokenNearExpiry(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.exp) return false;

    const fiveMinutesInMs = 5 * 60 * 1000;
    const timeUntilExpiry = (user.exp * 1000) - Date.now();
    
    return timeUntilExpiry < fiveMinutesInMs;
  }

  /**
   * Limpia todos los datos de autenticación
   */
  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
export default authService;