import { Technology, Skill, CatalogItemStatus, TechnologyCategory, SkillLevel } from '../types/catalog';

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

export const CATALOG_STATUS: CatalogItemStatus[] = [
  'active',
  'inactive'
];
