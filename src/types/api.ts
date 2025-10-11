// src/types/api.ts

export interface ApiSuccessResponse<T = any> {
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  type?: 'validation' | 'not_found' | 'server_error' | 'unknown';
}

export type ErrorType = 'validation' | 'not_found' | 'server_error' | 'unknown';

export interface ApiHandlerResult<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  type: ErrorType;
}

// Tipos específicos para operaciones CRUD
export interface CreateResponse<T = any> extends ApiSuccessResponse<T> {}
export interface UpdateResponse<T = any> extends ApiSuccessResponse<T> {}
export interface ListResponse<T = any> extends ApiSuccessResponse<T[]> {}
export interface DeleteResponse extends Omit<ApiSuccessResponse, 'data'> {}

// Error específicos por operación
export interface ValidationError extends ApiErrorResponse {
  message: "Invalid input" | "Error creating item" | "Error updating item";
  error: string;
}

export interface NotFoundError extends ApiErrorResponse {
  message: string; // e.g., "Technology not found"
}

export interface ServerError extends ApiErrorResponse {
  message: "Error listing items" | "Error deleting item";
  error: string;
}

// Offer type used by frontend to create/update offers
export interface Offer {
  id?: number;
  organization_id?: number;
  position_id?: number;
  duration_id?: number;
  location_id?: number;
  modality_id?: number;
  title?: string;
  description?: string;
  requirements?: string;
  modality?: string;
  duration_text?: string;
  location_text?: string;
  salary?: number;
  quota?: number;
  published_start_date?: string | null;
  application_deadline?: string | null;
  weekly_hours?: number;
  shift?: string;
  status?: string;
  rejection_reason?: string;
  technologies?: number[];
  created_at?: string;
  updated_at?: string;
}