import { httpClient } from '@/lib/httpInterceptors';
import { API_CONFIG } from '@/config/api.config';
import { 
  StudentRegisterData, 
  RegisterResponse, 
  StudentProfile, 
  UpdateStudentProfileRequest, 
  StudentProfileResponse 
} from '@/types/user';

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
      const response = await httpClient.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.REGISTER}`,
        studentData
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        return errorData as RegisterResponse;
      }
      
      const data = await response.json();
      return data as RegisterResponse;
    } catch (error: any) {
      console.error('Error en registro de estudiante:', error);
      
      // Error de red o técnico
      return {
        available: false,
        message: 'Error de conexión. Intenta nuevamente.'
      };
    }
  }

  /**
   * Obtiene el perfil del estudiante autenticado
   * @returns Promise con el perfil del estudiante
   */
  static async getProfile(): Promise<StudentProfile> {
    try {
      const response = await httpClient.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.PROFILE.GET}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data: StudentProfileResponse = await response.json();
      return data.data;
    } catch (error: any) {
      console.error('Error al obtener perfil de estudiante:', error);
      throw new Error(error.message || 'Error al obtener el perfil');
    }
  }

  /**
   * Actualiza el perfil del estudiante autenticado
   * @param profileData - Datos del perfil a actualizar
   * @returns Promise con el perfil actualizado
   */
  static async updateProfile(profileData: UpdateStudentProfileRequest): Promise<StudentProfile> {
    try {
      const response = await httpClient.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.PROFILE.UPDATE}`,
        profileData
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Manejar errores específicos según la documentación
        if (response.status === 409) {
          throw new Error('El legajo ingresado ya está en uso por otro estudiante');
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Datos inválidos. Verifique los campos requeridos');
        } else {
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
      }
      
      const data: StudentProfileResponse = await response.json();
      return data.data;
    } catch (error: any) {
      console.error('Error al actualizar perfil de estudiante:', error);
      throw error; // Re-throw para que el caller pueda manejar errores específicos
    }
  }

  /**
   * Obtiene el perfil de un estudiante por ID (solo para organizaciones)
   * @param studentId - ID del usuario estudiante
   * @returns Promise con el perfil del estudiante
   */
  static async getProfileById(studentId: number): Promise<StudentProfile> {
    try {
      const response = await httpClient.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STUDENTS.PROFILE.GET_BY_ID(studentId)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 403) {
          throw new Error('No tienes permisos para ver este perfil');
        } else if (response.status === 404) {
          throw new Error('Perfil de estudiante no encontrado');
        } else {
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
      }
      
      const data: StudentProfileResponse = await response.json();
      return data.data;
    } catch (error: any) {
      console.error('Error al obtener perfil de estudiante por ID:', error);
      throw error;
    }
  }
}

export default StudentService;