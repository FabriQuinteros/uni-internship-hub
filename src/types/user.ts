export interface User {
  id?: string;
  email: string;
  role: 'student' | 'organization' | 'admin';
  name?: string;
  first_name?: string;
  last_name?: string;
  imageUrl?: string;
}

// Interfaz específica para el registro de estudiantes
// Solo campos obligatorios para el registro inicial
export interface StudentRegisterData {
  email: string;
  password: string;
  legajo: string;
  first_name: string;
  last_name: string;
  phone: string;
}

// Interfaz completa del perfil del estudiante (para futuras funcionalidades)
export interface StudentProfile extends StudentRegisterData {
  id?: string;
  preferred_contact?: string;
  location?: string;
  academic_formation?: string;
  previous_experience?: string;
  availability_hours?: string;
  created_at?: string;
  updated_at?: string;
}

// Interfaz para las respuestas de la API de registro
export interface RegisterResponse {
  available: boolean;
  message: string;
}
