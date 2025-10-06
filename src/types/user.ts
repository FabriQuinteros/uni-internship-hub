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

// Enums para estados de organización
export enum OrganizationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  DISABLED = 'disabled'
}

// Interface para organización
export interface Organization {
  id: string;
  name: string;
  email: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
  profileComplete: boolean;
  lastStatusChange?: string;
  observations?: OrganizationObservation[];
}

// Interface para observaciones de administración
export interface OrganizationObservation {
  id: string;
  organizationId: string;
  adminId: string;
  adminName: string;
  action: OrganizationAction;
  observation: string;
  createdAt: string;
  previousStatus?: OrganizationStatus;
  newStatus: OrganizationStatus;
}

// Enum para acciones de administración
export enum OrganizationAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  SUSPEND = 'suspend',
  REACTIVATE = 'reactivate',
  DISABLE = 'disable',
  UPDATE_PROFILE = 'update_profile'
}

// Interface para filtros de búsqueda
export interface OrganizationFilters {
  status?: OrganizationStatus[];
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  profileComplete?: boolean;
}

// Interface para paginación
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interface para respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface para cambio de estado
export interface StatusChangeRequest {
  organizationId: string;
  newStatus: OrganizationStatus;
  observation: string;
  adminId: string;
}
