// Tipos optimizados solo para el listado - Performance First
export interface OrganizationListItem {
  id: string;
  name: string;
  email: string;
  status: OrganizationStatus;
  createdAt: string; // Solo para ordenamiento, no mostrar
}

// Respuesta optimizada para el listado
export interface OrganizationListResponse {
  data: OrganizationListItem[];
  total: number;
  page: number;
  totalPages: number;
}

// Para detalles completos - solo cuando se necesite
export interface OrganizationDetails extends OrganizationListItem {
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  profileComplete: boolean;
  updatedAt: string;
  lastStatusChange?: string;
}