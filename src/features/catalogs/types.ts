export enum CatalogType {
  TECHNOLOGIES = 'technologies',
  POSITIONS = 'positions',
  MODALITIES = 'modalities',
  DURATIONS = 'durations',
  LOCATIONS = 'locations',
  INDUSTRIES = 'industries'
}

export interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
}

export interface CatalogConfig {
  type: CatalogType;
  displayName: string;
  description: string;
  hasCategories: boolean;
  allowDescription: boolean;
  validationRules: {
    minLength: number;
    maxLength: number;
    allowSpecialChars: boolean;
  };
}

export interface CatalogItemForm {
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
}

export const catalogConfigs: Record<CatalogType, CatalogConfig> = {
  [CatalogType.TECHNOLOGIES]: {
    type: CatalogType.TECHNOLOGIES,
    displayName: 'Tecnologías y Habilidades',
    description: 'Gestiona las tecnologías y habilidades disponibles para ofertas y perfiles',
    hasCategories: true,
    allowDescription: true,
    validationRules: { minLength: 2, maxLength: 50, allowSpecialChars: false }
  },
  [CatalogType.POSITIONS]: {
    type: CatalogType.POSITIONS,
    displayName: 'Puestos y Roles',
    description: 'Define los tipos de puestos disponibles para las ofertas',
    hasCategories: false,
    allowDescription: true,
    validationRules: { minLength: 3, maxLength: 100, allowSpecialChars: true }
  },
  [CatalogType.MODALITIES]: {
    type: CatalogType.MODALITIES,
    displayName: 'Modalidades',
    description: 'Tipos de modalidad de trabajo disponibles',
    hasCategories: false,
    allowDescription: true,
    validationRules: { minLength: 3, maxLength: 50, allowSpecialChars: false }
  },
  [CatalogType.DURATIONS]: {
    type: CatalogType.DURATIONS,
    displayName: 'Duraciones',
    description: 'Períodos estándar de duración de pasantías',
    hasCategories: false,
    allowDescription: true,
    validationRules: { minLength: 2, maxLength: 50, allowSpecialChars: true }
  },
  [CatalogType.LOCATIONS]: {
    type: CatalogType.LOCATIONS,
    displayName: 'Ubicaciones',
    description: 'Ubicaciones disponibles para las ofertas',
    hasCategories: true,
    allowDescription: false,
    validationRules: { minLength: 2, maxLength: 100, allowSpecialChars: true }
  },
  [CatalogType.INDUSTRIES]: {
    type: CatalogType.INDUSTRIES,
    displayName: 'Industrias',
    description: 'Sectores industriales para categorizar empresas',
    hasCategories: false,
    allowDescription: true,
    validationRules: { minLength: 3, maxLength: 100, allowSpecialChars: true }
  }
};
