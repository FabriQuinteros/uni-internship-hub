import { CatalogType, CatalogConfig } from '@/types/catalog';

/**
 * Configuration for each catalog type including form fields and display settings
 */
export const catalogConfigs: Record<CatalogType, CatalogConfig> = {
  technologies: {
    type: 'technologies',
    label: 'Tecnologías y Habilidades',
    singularLabel: 'Tecnología/Habilidad',
    fields: [
      {
        name: 'name',
        label: 'Nombre',
        type: 'text',
        required: true,
        placeholder: 'ej. React, Python, Comunicación',
      },
      {
        name: 'category',
        label: 'Categoría',
        type: 'select',
        required: true,
        options: [
          { value: 'technology', label: 'Tecnología' },
          { value: 'skill', label: 'Habilidad' },
        ],
      },
    ],
    listFields: [
      { key: 'name', label: 'Nombre' },
      { key: 'category', label: 'Categoría', type: 'badge' },
      { key: 'is_active', label: 'Estado', type: 'badge' },
    ],
  },

  positions: {
    type: 'positions',
    label: 'Puestos',
    singularLabel: 'Puesto',
    fields: [
      {
        name: 'name',
        label: 'Nombre del Puesto',
        type: 'text',
        required: true,
        placeholder: 'ej. Desarrollador Frontend, Analista de Datos',
      },
      {
        name: 'description',
        label: 'Descripción',
        type: 'textarea',
        placeholder: 'Breve descripción del puesto...',
      },
    ],
    listFields: [
      { key: 'name', label: 'Nombre del Puesto' },
      { key: 'description', label: 'Descripción' },
      { key: 'is_active', label: 'Estado', type: 'badge' },
    ],
  },

  durations: {
    type: 'durations',
    label: 'Duraciones',
    singularLabel: 'Duración',
    fields: [
      {
        name: 'name',
        label: 'Nombre de Duración',
        type: 'text',
        required: true,
        placeholder: 'ej. 3 meses, 6 meses',
      },
      {
        name: 'months',
        label: 'Duración (Meses)',
        type: 'number',
        required: true,
        placeholder: '3',
      },
    ],
    listFields: [
      { key: 'name', label: 'Nombre de Duración' },
      { key: 'months', label: 'Meses', type: 'number' },
      { key: 'is_active', label: 'Estado', type: 'badge' },
    ],
  },

  locations: {
    type: 'locations',
    label: 'Ubicaciones',
    singularLabel: 'Ubicación',
    fields: [
      {
        name: 'name',
        label: 'Nombre de Ciudad',
        type: 'text',
        required: true,
        placeholder: 'ej. Buenos Aires, Madrid',
      },
      {
        name: 'province',
        label: 'Provincia/Estado',
        type: 'text',
        required: true,
        placeholder: 'ej. CABA, Madrid',
      },
      {
        name: 'country',
        label: 'País',
        type: 'text',
        required: true,
        placeholder: 'ej. Argentina, España',
      },
    ],
    listFields: [
      { key: 'name', label: 'Ciudad' },
      { key: 'province', label: 'Provincia/Estado' },
      { key: 'country', label: 'País' },
      { key: 'is_active', label: 'Estado', type: 'badge' },
    ],
  },

  modalities: {
    type: 'modalities',
    label: 'Modalidades',
    singularLabel: 'Modalidad',
    fields: [
      {
        name: 'name',
        label: 'Nombre de Modalidad',
        type: 'text',
        required: true,
        placeholder: 'ej. Remoto, Presencial, Híbrido',
      },
      {
        name: 'description',
        label: 'Descripción',
        type: 'textarea',
        placeholder: 'Descripción de la modalidad de trabajo...',
      },
    ],
    listFields: [
      { key: 'name', label: 'Nombre de Modalidad' },
      { key: 'description', label: 'Descripción' },
      { key: 'is_active', label: 'Estado', type: 'badge' },
    ],
  },
};

/**
 * Get configuration for a specific catalog type
 */
export const getCatalogConfig = (type: CatalogType): CatalogConfig => {
  return catalogConfigs[type];
};

/**
 * Get all available catalog types
 */
export const getAllCatalogTypes = (): CatalogType[] => {
  return Object.keys(catalogConfigs) as CatalogType[];
};

/**
 * Formatear valor de campo para mostrar
 */
export const formatFieldValue = (value: any, type?: string): string => {
  // Manejar diferentes tipos de valores null/undefined/empty
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string' && value.trim() === '') return '-';
  if (value === 0 && type !== 'number') return '-';
  
  switch (type) {
    case 'badge':
      if (typeof value === 'boolean') {
        return value ? 'Activo' : 'Inactivo';
      }
      return String(value).trim();
    case 'number':
      return String(value);
    default:
      const stringValue = String(value).trim();
      return stringValue || '-';
  }
};

/**
 * Get the badge variant for different values
 */
export const getBadgeVariant = (value: any, key: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (key === 'is_active') {
    return value ? 'default' : 'secondary';
  }
  
  if (key === 'category') {
    return value === 'technology' ? 'default' : 'outline';
  }
  
  return 'outline';
};