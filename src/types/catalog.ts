// src/types/catalog.ts

// --- CATALOG TYPES ---
export type CatalogType = 'technologies' | 'positions' | 'durations' | 'locations' | 'modalities';

// --- INTERFAZ BASE PARA TODOS LOS ITEMS ---
// Esta es la base común para cualquier elemento en el catálogo según la API.
export interface BaseCatalogItem {
  id: number;
  name: string;
  is_active: boolean;
}

// --- INTERFACES ESPECÍFICAS QUE EXTIENDEN LA BASE ---

export interface Technology extends BaseCatalogItem {
  category: 'technology' | 'skill';
}

export interface Position extends BaseCatalogItem {
  description?: string;
}

export interface Duration extends BaseCatalogItem {
  months: number;
}

export interface Location extends BaseCatalogItem {
  province: string;
  country: string;
}

export interface Modality extends BaseCatalogItem {
  description?: string;
}

// --- TIPOS DE UNIÓN ---

// Unión de todos los posibles items de catálogo
export type CatalogItem = Technology | Position | Duration | Location | Modality;

// --- API REQUEST/RESPONSE INTERFACES ---

export interface ApiListResponse<T> {
  message: string;
  data: Record<string, T[]>;
}

export interface ApiSingleResponse<T> {
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
}

// --- CREATE REQUEST PAYLOADS ---

export interface CreateTechnologyRequest {
  name: string;
  category: 'technology' | 'skill';
}

export interface CreatePositionRequest {
  name: string;
  description?: string;
}

export interface CreateDurationRequest {
  name: string;
  months: number;
}

export interface CreateLocationRequest {
  name: string;
  province: string;
  country: string;
}

export interface CreateModalityRequest {
  name: string;
  description?: string;
}

export type CreateCatalogRequest = 
  | CreateTechnologyRequest 
  | CreatePositionRequest 
  | CreateDurationRequest 
  | CreateLocationRequest 
  | CreateModalityRequest;

// --- UPDATE REQUEST PAYLOADS ---

export interface UpdateTechnologyRequest {
  name?: string;
  category?: 'technology' | 'skill';
  is_active?: boolean;
}

export interface UpdatePositionRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateDurationRequest {
  name?: string;
  months?: number;
  is_active?: boolean;
}

export interface UpdateLocationRequest {
  name?: string;
  province?: string;
  country?: string;
  is_active?: boolean;
}

export interface UpdateModalityRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export type UpdateCatalogRequest = 
  | UpdateTechnologyRequest 
  | UpdatePositionRequest 
  | UpdateDurationRequest 
  | UpdateLocationRequest 
  | UpdateModalityRequest;

// --- UI HELPER INTERFACES ---

export interface CatalogFormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface CatalogConfig {
  type: CatalogType;
  label: string;
  singularLabel: string;
  fields: CatalogFormField[];
  listFields: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'badge';
  }>;
}