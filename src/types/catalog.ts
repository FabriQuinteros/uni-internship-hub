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

export type CatalogItemStatus = 'active' | 'inactive';

export type TechnologyCategory = 'Frontend' | 'Backend' | 'Database' | 'Mobile' | 'DevOps' | 'Cloud';

export type SkillLevel = 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto';

export interface BaseCatalogItem {
  id: string;
  name: string;
  description: string;
  status: CatalogItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Technology extends BaseCatalogItem {
  category: TechnologyCategory;
  icon?: string;
}

export interface Skill extends BaseCatalogItem {
  level: SkillLevel;
}

export type CatalogType = 'technology' | 'skill';

export type CatalogItem = Technology | Skill;

export interface CatalogStats {
  total: number;
  active: number;
  inactive: number;
  byCategory?: Record<string, number>;
}
