import { create } from 'zustand';
import { Technology, Skill, CatalogType, CatalogItem } from '../types/catalog';
import { mockTechnologies, mockSkills } from '../data/mockCatalogData';

interface CatalogStore {
  // Estado
  technologies: Technology[];
  skills: Skill[];
  selectedCatalogType: CatalogType | null;
  
  // Acciones
  setSelectedCatalogType: (type: CatalogType | null) => void;
  addItem: (type: CatalogType, item: CatalogItem) => void;
  updateItem: (type: CatalogType, id: string, item: Partial<CatalogItem>) => void;
  deleteItem: (type: CatalogType, id: string) => void;
  getItems: (type: CatalogType) => CatalogItem[];
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  technologies: mockTechnologies,
  skills: mockSkills,
  selectedCatalogType: null,

  setSelectedCatalogType: (type) => set({ selectedCatalogType: type }),

  addItem: (type, item) => {
    set((state) => {
      if (type === 'technology') {
        return { technologies: [...state.technologies, item as Technology] };
      } else {
        return { skills: [...state.skills, item as Skill] };
      }
    });
  },

  updateItem: (type, id, updateData) => {
    set((state) => {
      if (type === 'technology') {
        const updatedTechnologies = state.technologies.map((tech) =>
          tech.id === id ? { ...tech, ...updateData } : tech
        );
        return { technologies: updatedTechnologies };
      } else {
        const updatedSkills = state.skills.map((skill) =>
          skill.id === id ? { ...skill, ...updateData } : skill
        );
        return { skills: updatedSkills };
      }
    });
  },

  deleteItem: (type, id) => {
    set((state) => {
      if (type === 'technology') {
        return { 
          technologies: state.technologies.filter((tech) => tech.id !== id) 
        };
      } else {
        return { 
          skills: state.skills.filter((skill) => skill.id !== id) 
        };
      }
    });
  },

  getItems: (type) => {
    const state = get();
    return type === 'technology' ? state.technologies : state.skills;
  },
}));
