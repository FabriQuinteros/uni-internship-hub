import { apiClient } from '@/lib/api/apiClient';
import { API_CONFIG } from '@/config/api.config';
import { StudentRegisterData, RegisterResponse } from '@/types/user';

/**
 * Servicio para operaciones relacionadas con estudiantes
 */
export class StudentService {
  /**
   * Registra un nuevo estudiante en el sistema
   * @param studentData - Datos del estudiante a registrar
   * @returns Promise con la respuesta del registro
   */
  static async register(studentData: StudentRegisterData): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>(
        API_CONFIG.ENDPOINTS.STUDENTS.REGISTER,
        studentData
      );
      
      return response.data;
    } catch (error: any) {
      // Manejo específico de errores según la documentación del backend
      if (error.response) {
        const { status, data } = error.response;
        
        // Devolver la respuesta del backend tal como está definida en la documentación
        if (status === 409 || status === 400 || status === 500) {
          return data as RegisterResponse;
        }
      }
      
      // Error de red o técnico
      return {
        available: false,
        message: 'Error de conexión. Intenta nuevamente.'
      };
    }
  }
}

export default StudentService;