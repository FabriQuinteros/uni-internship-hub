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

// Interfaces para datos expandidos de catálogos
export interface LocationCatalog {
  id: number;
  name: string;
  province: string;
  country: string;
  is_active: boolean;
}

export interface AvailabilityCatalog {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

// Interfaz para skills/habilidades del estudiante
export interface StudentSkill {
  id: number;
  student_id: number;
  technology_id: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  technology?: {
    id: number;
    name: string;
    category: 'technology' | 'skill';
  };
}

// Interfaz para idiomas del estudiante
export interface StudentLanguage {
  id: number;
  student_id: number;
  language_id: number;
  level: 'basic' | 'intermediate' | 'advanced' | 'native';
  language?: {
    id: number;
    name: string;
    code_iso?: string;
  };
}

// Interfaz completa del perfil del estudiante (con IDs de catálogos)
export interface StudentProfile {
  id: number;
  user_id: number;
  legajo: string;                    // REQUERIDO - único por estudiante
  first_name: string;                // REQUERIDO
  last_name: string;                 // REQUERIDO
  phone?: string;                    // Opcional - máximo 20 caracteres
  preferred_contact: 'email' | 'phone'; // CATÁLOGO - valores fijos del backend
  location_id?: number;              // ID del catálogo de ubicaciones
  academic_formation?: string;       // Texto libre - formación académica
  previous_experience?: string;      // Texto libre - experiencia previa
  availability_id?: number;          // ID del catálogo de disponibilidad
  created_at: string;               // ISO 8601
  updated_at: string;               // ISO 8601
  user?: {                          // Datos del usuario relacionado (opcional en respuestas)
    id: number;
    email: string;
    role: string;
    status: string;
  };
  // Datos expandidos de catálogos (incluidos en responses)
  location?: LocationCatalog;
  availability?: AvailabilityCatalog;
  // Datos adicionales del perfil completo
  skills?: StudentSkill[];           // Habilidades técnicas del estudiante
  languages?: StudentLanguage[];     // Idiomas que maneja el estudiante
}

// Interfaz para actualización de perfil de estudiante (campos editables)
export interface UpdateStudentProfileRequest {
  legajo: string;                    // REQUERIDO - único
  first_name: string;                // REQUERIDO
  last_name: string;                 // REQUERIDO
  phone?: string;                    // Opcional
  preferred_contact: 'email' | 'phone'; // REQUERIDO - valores del catálogo
  location_id: number;               // REQUERIDO - ID del catálogo de ubicaciones
  academic_formation: string;        // REQUERIDO - Texto libre - formación académica
  previous_experience?: string;      // Opcional - Texto libre - experiencia previa
  availability_id: number;           // REQUERIDO - ID del catálogo de disponibilidad
}

// Interfaz para respuesta de API de perfil de estudiante
export interface StudentProfileResponse {
  message: string;
  data: StudentProfile;
}

// Interfaz para las respuestas de la API de registro
export interface RegisterResponse {
  available: boolean;
  message: string;
}

// ===== PERFIL DE ORGANIZACIONES =====

// Interface para perfil de organización (GET/PUT /api/organizations/profile)
export interface OrganizationProfile {
  id: string; // UUID
  userId: string; // UUID, foreign key
  businessName: string; // required, max 255 chars
  industry?: string; // optional, max 100 chars
  address?: string; // optional, max 255 chars
  website?: string; // optional, valid URL, max 255 chars
  description?: string; // optional, max 1000 chars
  mainContact: string; // required, max 255 chars
  phone?: string; // optional, contact phone number
  email?: string; // optional, contact email (from user table)
  logoUrl?: string; // optional, max 500 chars
  agreementExpiry?: string; // optional, format: "YYYY-MM-DD"
  createdAt: string; // ISO 8601, auto-generated
}

// Interface para actualización de perfil de organización
export interface UpdateOrganizationProfileRequest {
  businessName: string; // required, max 255 chars
  industry?: string; // optional, max 100 chars
  address?: string; // optional, max 255 chars
  website?: string; // optional, valid URL, max 255 chars
  description?: string; // optional, max 1000 chars
  mainContact: string; // required, max 255 chars
  phone?: string; // optional, contact phone number
  email?: string; // optional, contact email
  logoUrl?: string; // optional, max 500 chars
  agreementExpiry?: string; // optional, formato YYYY-MM-DD
}

// Interface para registro de organización (POST /api/organizations/register)
export interface OrganizationRegisterRequest {
  email: string;              // required, email válido
  password: string;           // required, min 6 chars
  confirmPassword: string;    // required, debe = password
  companyName: string;        // required, max 255 chars
  industry: string;           // required, max 100 chars  
  website?: string;           // optional, URL válida si se envía, max 255
  description?: string;       // optional, max 1000 chars
  address?: string;           // optional, max 255 chars
  contactName: string;        // required, max 255 chars
  contactPhone?: string;      // optional, formato teléfono válido
  termsAccepted: boolean;     // required, debe ser true
}

// Interface para respuesta de registro de organización
export interface OrganizationRegisterResponse {
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      role: string;
      status: string;
      created_at: string;
    };
    profile: {
      id: number;
      user_id: number;
      business_name: string;
      industry: string;
      website?: string;
      description?: string;
      address?: string;
      main_contact: string;
      phone?: string;
      agreement_status: string;
      agreement_expiry?: string;
    };
  };
}

// ===== ADMINISTRACIÓN DE ORGANIZACIONES =====

// Enums para estados de organización (según backend)
export enum OrganizationStatus {
  PENDING = 'pending',
  ACTIVE = 'active', 
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

// Interface para item de organización en listado (GET /admin/organizations)
export interface OrganizationListItem {
  id: string; // UUID
  name: string;
  email: string;
  status: OrganizationStatus;
  createdAt: string; // ISO 8601
  agreementExpiry?: string; // YYYY-MM-DD - fecha de expiración del convenio
}

// Interface para detalles completos de organización (GET /admin/organizations/:id/details)
export interface OrganizationDetails {
  id: string; // UUID
  name: string;
  email: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  status: OrganizationStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  profileComplete: boolean;
  lastStatusChange?: string; // ISO 8601
  agreementExpiry?: string; // YYYY-MM-DD - fecha de expiración del convenio
}

// Interface para resumen de organización (GET /admin/organizations/:id/summary)
export interface OrganizationSummary {
  id: string; // UUID
  name: string;
  status: OrganizationStatus;
  profileComplete: boolean;
  registrationDate: string; // YYYY-MM-DD
}

// Interface para cambio de estado (PUT /admin/organizations/:id/status)
export interface UpdateStatusRequest {
  newStatus: OrganizationStatus;
  adminId: string; // UUID del admin
  agreementExpiry?: string; // YYYY-MM-DD - requerido solo cuando newStatus = 'active'
}

// Interface para respuesta de cambio de estado
export interface UpdateStatusResponse {
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    status: OrganizationStatus;
    updatedAt: string;
    lastStatusChange: string;
    profileComplete: boolean;
  };
}

// Interface para estadísticas de organizaciones (GET /admin/organizations/stats)
export interface OrganizationStats {
  total: number;
  pending: number;
  approved: number; // En backend es 'approved' pero status es 'active'
  rejected: number;
  suspended: number;
}

// Interface para respuesta de listado paginado
export interface ListOrganizationsResponse {
  data: OrganizationListItem[];
  total: number;
  page: number;
  totalPages: number;
}

// Enum para acciones de administración
export enum OrganizationAction {
  APPROVE = 'approve',
  REJECT = 'reject', 
  SUSPEND = 'suspend',
  REACTIVATE = 'reactivate'
}

// Interface para filtros de búsqueda (query params para GET /admin/organizations)
export interface OrganizationFilters {
  page?: number; // min: 1, default: 1
  limit?: number; // min: 5, max: 100, default: 25
  search?: string; // texto de búsqueda
  status?: OrganizationStatus; // filtrar por estado de cuenta
  agreementStatus?: 'valid' | 'expired' | 'no_expiry'; // 🆕 filtro derivado para convenio
}

// Interface para paginación
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interface para respuesta paginada genérica
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ===== BACKWARD COMPATIBILITY =====
// Mantenemos algunas interfaces para compatibilidad con el código existente

// Alias para mantener compatibilidad
export type Organization = OrganizationListItem;

// Interface para cambio de estado (compatibilidad con store existente)
export interface StatusChangeRequest {
  organizationId: string;
  newStatus: OrganizationStatus;
  adminId: string;
  agreementExpiry?: string; // YYYY-MM-DD - requerido cuando newStatus = 'active'
}

// Interface para datos del modal de eliminación (frontend interno)
export interface DeleteOrganizationModalData {
  reason?: string; // Motivo de eliminación para logging interno
  confirmedName: string; // Nombre confirmado por el usuario
}

// Interface para respuesta de eliminación (backend)
export interface DeleteOrganizationResponse {
  success: boolean;
  message: string;
  deletedId: string;
}

// Interface para item de estudiantes en listado (GET /admin/students)
export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  legajo: string;
  status: 'active' | 'suspended' | 'pending' | 'rejected'; 
}

// Interface completa para estudiante (usado en administración)
export interface Student {
  id: string;
  email: string;
  legajo: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'rejected';
  createdAt: string;
  phone?: string;
  updatedAt?: string;
}

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  byUniversity?: { [key: string]: number };
  byCareer?: { [key: string]: number };
}