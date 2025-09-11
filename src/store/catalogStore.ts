import { create } from 'zustand';
import { Technology, Skill, Duration, Location, Modality, Language, Role, CatalogType, CatalogItem } from '../types/catalog';
import { mockTechnologies, mockSkills, mockDurations, mockLocations, mockModalities, mockLanguages, mockRoles } from '../data/mockCatalogData';

// Store global para gestionar todos los catálogos del sistema
interface CatalogStore {
  // Estado - Arrays para cada tipo de catálogo
  technologies: Technology[];
  skills: Skill[];
  durations: Duration[];
  locations: Location[];
  modalities: Modality[];
  languages: Language[];
  roles: Role[];
  selectedCatalogType: CatalogType | null;
  
  // Acciones CRUD para todos los catálogos
  setSelectedCatalogType: (type: CatalogType | null) => void;
  addItem: (type: CatalogType, item: any) => void;
  updateItem: (type: CatalogType, id: string, item: any) => void;
  deleteItem: (type: CatalogType, id: string) => void;
  getItems: (type: CatalogType) => CatalogItem[];
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  // Inicialización con datos mock para cada catálogo
  technologies: mockTechnologies,
  skills: mockSkills,
  durations: mockDurations,
  locations: mockLocations,
  modalities: mockModalities,
  languages: mockLanguages,
  roles: mockRoles,
  selectedCatalogType: null,

  setSelectedCatalogType: (type) => set({ selectedCatalogType: type }),

  // Agregar nuevo elemento al catálogo correspondiente
  addItem: (type: any, item: any) => {
    set((state) => {
      if (type === 'technology') {
        return { technologies: [...state.technologies, item] };
      } else if (type === 'skill') {
        return { skills: [...state.skills, item] };
      } else if (type === 'duration') {
        return { durations: [...state.durations, item] };
      } else if (type === 'location') {
        return { locations: [...state.locations, item] };
      } else if (type === 'modality') {
        return { modalities: [...state.modalities, item] };
      } else if (type === 'language') {
        return { languages: [...state.languages, item] };
      } else {
        return { roles: [...state.roles, item] };
      }
    });
  },

  // Actualizar elemento existente en el catálogo correspondiente
  updateItem: (type, id, updateData) => {
    set((state) => {
      if (type === 'technology') {
        const updatedTechnologies = state.technologies.map((tech) =>
          tech.id === id ? { ...tech, ...updateData } : tech
        );
        return { technologies: updatedTechnologies };
      } else if (type === 'skill') {
        const updatedSkills = state.skills.map((skill) =>
          skill.id === id ? { ...skill, ...updateData } : skill
        );
        return { skills: updatedSkills };
      } else if (type === 'duration') {
        const updatedDurations = state.durations.map((duration) =>
          duration.id === id ? { ...duration, ...updateData } : duration
        );
        return { durations: updatedDurations };
      } else if (type === 'location') {
        const updatedLocations = state.locations.map((location) =>
          location.id === id ? { ...location, ...updateData } : location
        );
        return { locations: updatedLocations };
      } else if (type === 'modality') {
        const updatedModalities = state.modalities.map((modality) =>
          modality.id === id ? { ...modality, ...updateData } : modality
        );
        return { modalities: updatedModalities };
      } else if (type === 'language') {
        const updatedLanguages = state.languages.map((language) =>
          language.id === id ? { ...language, ...updateData } : language
        );
        return { languages: updatedLanguages };
      } else {
        const updatedRoles = state.roles.map((role) =>
          role.id === id ? { ...role, ...updateData } : role
        );
        return { roles: updatedRoles };
      }
    });
  },

  // Eliminar elemento del catálogo correspondiente
  deleteItem: (type, id) => {
    set((state) => {
      if (type === 'technology') {
        return { 
          technologies: state.technologies.filter((tech) => tech.id !== id) 
        };
      } else if (type === 'skill') {
        return { 
          skills: state.skills.filter((skill) => skill.id !== id) 
        };
      } else if (type === 'duration') {
        return { 
          durations: state.durations.filter((duration) => duration.id !== id) 
        };
      } else if (type === 'location') {
        return { 
          locations: state.locations.filter((location) => location.id !== id) 
        };
      } else if (type === 'modality') {
        return { 
          modalities: state.modalities.filter((modality) => modality.id !== id) 
        };
      } else if (type === 'language') {
        return { 
          languages: state.languages.filter((language) => language.id !== id) 
        };
      } else {
        return { 
          roles: state.roles.filter((role) => role.id !== id) 
        };
      }
    });
  },

  // Obtener elementos del catálogo especificado
  getItems: (type) => {
    const state = get();
    if (type === 'technology') return state.technologies;
    if (type === 'skill') return state.skills;
    if (type === 'duration') return state.durations;
    if (type === 'location') return state.locations;
    if (type === 'modality') return state.modalities;
    if (type === 'language') return state.languages;
    return state.roles;
  },
}));
