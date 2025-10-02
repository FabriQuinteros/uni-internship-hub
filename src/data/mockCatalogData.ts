import { Technology, Skill, Duration, Location, Modality, Language, Role, CatalogItemStatus, TechnologyCategory, SkillLevel, LanguageLevel } from '../types/catalog';

export const mockTechnologies: Technology[] = [
  {
    id: 't1',
    name: 'React',
    description: 'Biblioteca JavaScript para construir interfaces de usuario',
    category: 'Frontend',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    icon: 'react'
  },
  {
    id: 't2',
    name: 'Node.js',
    description: 'Entorno de ejecución para JavaScript del lado del servidor',
    category: 'Backend',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    icon: 'nodejs'
  },
  {
    id: 't3',
    name: 'PostgreSQL',
    description: 'Sistema de gestión de bases de datos relacional',
    category: 'Database',
    status: 'active',
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16'),
    icon: 'postgresql'
  },
  // ... más tecnologías aquí
];

export const mockSkills: Skill[] = [
  {
    id: 's1',
    name: 'Resolución de problemas',
    description: 'Capacidad para identificar y resolver problemas de manera eficiente',
    level: 'Avanzado',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 's2',
    name: 'Trabajo en equipo',
    description: 'Habilidad para trabajar efectivamente en equipos multidisciplinarios',
    level: 'Experto',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  // ... más habilidades aquí
];

export const mockDurations: Duration[] = [
  {
    id: 'd1',
    name: '3 Meses',
    description: 'Duración estándar para pasantías cortas',
    months: 3,
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'd2',
    name: '6 Meses',
    description: 'Duración recomendada para pasantías estándares',
    months: 6,
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'd3',
    name: '9 Meses',
    description: 'Duración para pasantías extendidas',
    months: 9,
    status: 'active',
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16')
  },
  {
    id: 'd4',
    name: '12 Meses',
    description: 'Duración para pasantías anuales completas',
    months: 12,
    status: 'active',
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16')
  }
];

export const mockLocations: Location[] = [
  {
    id: 'l1',
    name: 'Córdoba Capital',
    description: 'Ciudad capital de la provincia de Córdoba',
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'l2',
    name: 'Villa Carlos Paz',
    description: 'Ciudad turística de la provincia de Córdoba',
    city: 'Villa Carlos Paz',
    province: 'Córdoba',
    country: 'Argentina',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'l3',
    name: 'Río Cuarto',
    description: 'Segunda ciudad más importante de Córdoba',
    city: 'Río Cuarto',
    province: 'Córdoba',
    country: 'Argentina',
    status: 'active',
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16')
  },
  {
    id: 'l4',
    name: 'Madrid',
    description: 'Capital de España - Oportunidades internacionales',
    city: 'Madrid',
    province: 'Madrid',
    country: 'España',
    status: 'active',
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16')
  }
];

export const mockModalities: Modality[] = [
  {
    id: 'm1',
    name: 'Presencial',
    description: 'Trabajo completamente en oficina',
    type: 'Presencial',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'm2',
    name: 'Virtual',
    description: 'Trabajo completamente remoto',
    type: 'Virtual',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'm3',
    name: 'Híbrido',
    description: 'Combinación de trabajo presencial y remoto',
    type: 'Híbrido',
    status: 'active',
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16')
  }
];

export const mockLanguages: Language[] = [
  {
    id: 'lang1',
    name: 'Español',
    description: 'Idioma español',
    isoCode: 'ES',
    level: 'Nativo',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'lang2',
    name: 'Inglés',
    description: 'Idioma inglés',
    isoCode: 'EN',
    level: 'Avanzado',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'lang3',
    name: 'Portugués',
    description: 'Idioma portugués',
    isoCode: 'PT',
    level: 'Intermedio',
    status: 'active',
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16')
  },
  {
    id: 'lang4',
    name: 'Francés',
    description: 'Idioma francés',
    isoCode: 'FR',
    level: 'Básico',
    status: 'active',
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16')
  }
];

export const mockRoles: Role[] = [
  {
    id: 'r1',
    name: 'Desarrollador Frontend',
    description: 'Desarrollo de interfaces de usuario y experiencia del usuario',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'r2',
    name: 'Desarrollador Backend',
    description: 'Desarrollo de lógica de servidor, APIs y bases de datos',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 'r3',
    name: 'Analista de Datos',
    description: 'Análisis y procesamiento de datos para obtener insights de negocio',
    status: 'active',
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16')
  },
  {
    id: 'r4',
    name: 'Diseñador UX/UI',
    description: 'Diseño de experiencia de usuario e interfaces gráficas',
    status: 'active',
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16')
  }
];

export const TECHNOLOGY_CATEGORIES: TechnologyCategory[] = [
  'Frontend',
  'Backend',
  'Database',
  'Mobile',
  'DevOps',
  'Cloud'
];

export const SKILL_LEVELS: SkillLevel[] = [
  'Básico',
  'Intermedio',
  'Avanzado',
  'Experto'
];

export const DURATION_MONTHS: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24
];

export const MODALITY_TYPES: ('Presencial' | 'Virtual' | 'Híbrido')[] = [
  'Presencial',
  'Virtual',
  'Híbrido'
];

export const LANGUAGE_LEVELS: LanguageLevel[] = [
  'Básico',
  'Intermedio',
  'Avanzado',
  'Nativo'
];

export const CATALOG_STATUS: CatalogItemStatus[] = [
  'active',
  'inactive'
];
