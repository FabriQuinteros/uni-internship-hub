export interface Catalog {
  id?: string;
  title: string;
  description: string;
  organizationId: string;
  status: 'active' | 'inactive' | 'draft';
  startDate?: Date;
  endDate?: Date;
  requirements?: string[];
  categories?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipos base para el sistema de catálogos
export type CatalogItemStatus = 'active' | 'inactive';
export type TechnologyCategory = 'Frontend' | 'Backend' | 'Database' | 'Mobile' | 'DevOps' | 'Cloud';
export type SkillLevel = 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto';
export type LanguageLevel = 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo';

// Interfaz base para todos los elementos de catálogo
export interface BaseCatalogItem {
  id: string;
  name: string;
  description: string;
  status: CatalogItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Catálogo de Tecnologías - incluye categoría específica
export interface Technology extends BaseCatalogItem {
  category: TechnologyCategory;
  icon?: string;
}

// Catálogo de Habilidades - incluye nivel de competencia
export interface Skill extends BaseCatalogItem {
  level: SkillLevel;
}

// Catálogo de Duración - solo meses (nombre/descripción auto-generados)
export interface Duration extends BaseCatalogItem {
  months: number;
}

// Catálogo de Localidades - ciudad, provincia, país (nombre/descripción auto-generados)
export interface Location extends BaseCatalogItem {
  city: string;
  province: string;
  country: string;
}

// Catálogo de Modalidades - tipo de trabajo (nombre/descripción auto-generados)
export interface Modality extends BaseCatalogItem {
  type: 'Presencial' | 'Virtual' | 'Híbrido';
}

// Catálogo de Idiomas - incluye código ISO y nivel
export interface Language extends BaseCatalogItem {
  isoCode: string;
  level: LanguageLevel;
}

// Catálogo de Roles - usa solo campos base (name, description)
export interface Role extends BaseCatalogItem {
  // Solo usa name y description de BaseCatalogItem
}

// Tipos de catálogos disponibles en el sistema
export type CatalogType = 'technology' | 'skill' | 'duration' | 'location' | 'modality' | 'language' | 'role';

// Unión de todos los tipos de elementos de catálogo
export type CatalogItem = Technology | Skill | Duration | Location | Modality | Language | Role;

export interface CatalogStats {
  total: number;
  active: number;
  inactive: number;
  byCategory?: Record<string, number>;
}
