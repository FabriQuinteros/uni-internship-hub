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
  logoUrl?: string; // optional, max 500 chars
  agreementStatus: 'active' | 'inactive'; // default: "inactive"
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
  logoUrl?: string; // optional, max 500 chars
  agreementStatus?: 'active' | 'inactive'; // optional
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
  status?: OrganizationStatus; // filtrar por estado
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
}
