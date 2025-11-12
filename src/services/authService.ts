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

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
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
      
      // Fallback: Si la API no está disponible, permitir login con credenciales de desarrollo
      console.warn('🔧 API no disponible - Usando modo de desarrollo');
      console.log('📧 Credenciales válidas: estudiante@universidad.edu, empresa@org.com, admin@uni.edu');
      const devLoginResult = this.tryDevelopmentLogin(email, password);
      
      if (devLoginResult.success) {
        return devLoginResult;
      }
      
      return {
        success: false,
        error: 'Error de conexión. Verifica que la API esté ejecutándose.',
      };
    }
  }

  /**
   * Realiza el logout del usuario
   */
  async logout(): Promise<void> {
    // Limpiar el token INMEDIATAMENTE (sincrónico)
    const token = this.getToken();
    localStorage.removeItem(this.TOKEN_KEY);
    
    // Intentar llamar al endpoint de logout en segundo plano si había token
    if (token) {
      try {
        await fetch(`${this.BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.log('Error en logout del servidor:', error);
        // No es crítico si falla, el token ya fue eliminado localmente
      }
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

  /**
   * Login de desarrollo para cuando la API no está disponible
   * SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN
   */
  private tryDevelopmentLogin(email: string, password: string): LoginResult {
    const devCredentials = {
      'estudiante@universidad.edu': {
        id: '1',
        email: 'estudiante@universidad.edu',
        role: 'student' as const,
        first_name: 'María',
        last_name: 'González'
      },
      'empresa@org.com': {
        id: '2',
        email: 'empresa@org.com',
        role: 'organization' as const,
        name: 'Tech Solutions Inc.'
      },
      'admin@uni.edu': {
        id: '3',
        email: 'admin@uni.edu',
        role: 'admin' as const,
        name: 'Administrador del Sistema'
      }
    };

    const user = devCredentials[email as keyof typeof devCredentials];
    
    if (!user) {
      console.log('❌ Email no encontrado en credenciales de desarrollo');
      return {
        success: false,
        error: 'Credenciales de desarrollo no válidas'
      };
    }

    // Aceptar cualquier contraseña que no esté vacía
    if (!password || password.trim().length === 0) {
      return {
        success: false,
        error: 'La contraseña no puede estar vacía'
      };
    }

    console.log('✅ Login de desarrollo exitoso para:', user.role);

    // Crear un token JWT simulado para desarrollo
    const mockToken = this.createMockJWT(user);
    localStorage.setItem(this.TOKEN_KEY, mockToken);

    return {
      success: true,
      token: mockToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: 'first_name' in user ? user.first_name : undefined,
        last_name: 'last_name' in user ? user.last_name : undefined,
        name: 'name' in user ? user.name : undefined,
        first_login: false,
        permissions: user.role === 'admin' ? ['read', 'write', 'delete'] : ['read']
      }
    };
  }

  /**
   * Crea un token JWT simulado para desarrollo
   */
  private createMockJWT(user: any): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      id: parseInt(user.id),
      role: user.role,
      permissions: user.role === 'admin' ? ['read', 'write', 'delete'] : ['read'],
      first_login: false,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 horas
      iat: Math.floor(Date.now() / 1000)
    };

    // Simular JWT con base64 (NO es seguro para producción)
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const mockSignature = 'dev-signature';

    return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
  }

  /**
   * Resetea la contraseña de un usuario usando un token
   */
  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const requestUrl = `${this.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}`;
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Error al resetear la contraseña'
        };
      }

      return {
        success: true,
        message: data.message || 'Contraseña actualizada exitosamente'
      };
    } catch (error: any) {
      console.error('❌ Error en resetPassword:', error);
      return {
        success: false,
        message: error.message || 'Error de conexión'
      };
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
export default authService;
