import { create } from 'zustand';
import { StudentService } from '@/services/studentService';
import { catalogService, availabilityService } from '@/services/catalogService';
import { StudentProfile, UpdateStudentProfileRequest, LocationCatalog, AvailabilityCatalog } from '@/types/user';
import { Location, Availability } from '@/types/catalog';

interface StudentProfileStore {
  // Estado
  profile: StudentProfile | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  hasUnsavedChanges: boolean;

  // Estados de catálogos
  locations: Location[];
  availabilities: Availability[];
  catalogsLoading: boolean;
  catalogsError: string | null;

  // Acciones principales
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: UpdateStudentProfileRequest) => Promise<void>;
  clearError: () => void;
  reset: () => void;

  // Acciones de catálogos
  loadCatalogs: () => Promise<void>;
  loadLocations: () => Promise<void>;
  loadAvailabilities: () => Promise<void>;
  clearCatalogsError: () => void;

  // Estados de edición
  setEditing: (editing: boolean) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;

  // Utilidades
  refreshProfile: () => Promise<void>;
  isProfileComplete: () => boolean;
  getRequiredFields: () => Array<keyof UpdateStudentProfileRequest>;
  getMissingRequiredFields: () => Array<keyof UpdateStudentProfileRequest>;
  getFieldDisplayName: (fieldName: string) => string;
  getLocationDisplay: () => LocationCatalog | Location | null;
  getAvailabilityDisplay: () => AvailabilityCatalog | Availability | null;
}

export const useStudentProfileStore = create<StudentProfileStore>((set, get) => ({
  // Estado inicial
  profile: null,
  loading: false,
  error: null,
  isEditing: false,
  hasUnsavedChanges: false,

  // Estados de catálogos
  locations: [],
  availabilities: [],
  catalogsLoading: false,
  catalogsError: null,

  // Obtener perfil del estudiante autenticado
  fetchProfile: async () => {
    set({ loading: true, error: null });
    
    try {
      const profile = await StudentService.getProfile();
      set({ 
        profile, 
        loading: false, 
        error: null 
      });

      // Cargar catálogos en paralelo (no bloquea el perfil)
      get().loadCatalogs().catch(error => {
        console.warn('Warning: Failed to load catalogs:', error);
        // No afecta el éxito de fetchProfile
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cargar el perfil';
      set({ 
        profile: null, 
        loading: false, 
        error: errorMessage 
      });
      console.error('Error en fetchProfile:', error);
    }
  },

  // Actualizar perfil del estudiante
  updateProfile: async (profileData: UpdateStudentProfileRequest) => {
    set({ loading: true, error: null });
    
    try {
      const updatedProfile = await StudentService.updateProfile(profileData);
      set({ 
        profile: updatedProfile, 
        loading: false, 
        error: null,
        hasUnsavedChanges: false,
        isEditing: false
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Error al actualizar el perfil';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      throw error; // Re-throw para que el componente pueda manejarlo
    }
  },

  // Limpiar errores
  clearError: () => {
    set({ error: null });
  },

  // Resetear store
  reset: () => {
    set({
      profile: null,
      loading: false,
      error: null,
      isEditing: false,
      hasUnsavedChanges: false,
      locations: [],
      availabilities: [],
      catalogsLoading: false,
      catalogsError: null
    });
  },

  // Cargar todos los catálogos
  loadCatalogs: async () => {
    set({ catalogsLoading: true, catalogsError: null });
    
    try {
      await Promise.all([
        get().loadLocations(),
        get().loadAvailabilities()
      ]);
      set({ catalogsLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cargar catálogos';
      set({ 
        catalogsLoading: false, 
        catalogsError: errorMessage 
      });
      console.error('Error en loadCatalogs:', error);
    }
  },

  // Cargar ubicaciones
  loadLocations: async () => {
    try {
      const locations = await catalogService.list<Location>('locations');
      set({ locations });
    } catch (error: any) {
      console.error('Error loading locations:', error);
      throw error;
    }
  },

  // Cargar disponibilidades
  loadAvailabilities: async () => {
    try {
      const availabilities = await availabilityService.list();
      set({ availabilities });
    } catch (error: any) {
      console.error('Error loading availabilities:', error);
      throw error;
    }
  },

  // Limpiar errores de catálogos
  clearCatalogsError: () => {
    set({ catalogsError: null });
  },

  // Estados de edición
  setEditing: (editing: boolean) => {
    set({ isEditing: editing });
  },

  setUnsavedChanges: (hasChanges: boolean) => {
    set({ hasUnsavedChanges: hasChanges });
  },

  // Refrescar perfil (alias para fetchProfile)
  refreshProfile: async () => {
    await get().fetchProfile();
  },

  // Verificar si el perfil está completo
  isProfileComplete: () => {
    const { profile } = get();
    if (!profile) return false;

    const requiredFields = get().getRequiredFields();
    return requiredFields.every(field => {
      const value = profile[field as keyof StudentProfile];
      return value !== null && value !== undefined && value !== '';
    });
  },

  // Obtener campos requeridos
  getRequiredFields: (): Array<keyof UpdateStudentProfileRequest> => {
    return [
      'legajo', 
      'first_name', 
      'last_name', 
      'preferred_contact',
      'location_id',
      'academic_formation', 
      'availability_id'
    ];
  },

  // Obtener campos requeridos faltantes
  getMissingRequiredFields: (): Array<keyof UpdateStudentProfileRequest> => {
    const { profile } = get();
    if (!profile) return get().getRequiredFields();

    const requiredFields = get().getRequiredFields();
    return requiredFields.filter(field => {
      const value = profile[field as keyof StudentProfile];
      return value === null || value === undefined || value === '';
    });
  },



  // Traducir nombres de campos para mensajes amigables
  getFieldDisplayName: (fieldName: string): string => {
    const fieldNames: Record<string, string> = {
      'location_id': 'Ubicación',
      'location': 'Ubicación',
      'academic_formation': 'Formación Académica',
      'availability_id': 'Disponibilidad Horaria',
      'availability_hours': 'Disponibilidad Horaria',
      'preferred_contact': 'Método de Contacto Preferido',
      'first_name': 'Nombre',
      'last_name': 'Apellido',
      'legajo': 'Legajo',
      'phone': 'Teléfono',
      'previous_experience': 'Experiencia Previa'
    };
    
    return fieldNames[fieldName] || fieldName;
  },

  // Helper para obtener datos de ubicación (expandido o desde catálogo)
  getLocationDisplay: () => {
    const { profile, locations } = get();
    if (!profile) return null;

    // Si viene expandido del backend, usar eso
    if (profile.location) {
      return profile.location;
    }

    // Si no, buscar en catálogos cargados
    if (profile.location_id && locations.length > 0) {
      const location = locations.find(loc => loc.id === profile.location_id);
      return location || null;
    }

    return null;
  },

  // Helper para obtener datos de disponibilidad (expandido o desde catálogo)
  getAvailabilityDisplay: () => {
    const { profile, availabilities } = get();
    if (!profile) return null;

    // Si viene expandido del backend, usar eso
    if (profile.availability) {
      return profile.availability;
    }

    // Si no, buscar en catálogos cargados
    if (profile.availability_id && availabilities.length > 0) {
      const availability = availabilities.find(avail => avail.id === profile.availability_id);
      return availability || null;
    }

    return null;
  },
}));

// Hook helper para usar el store con facilidad
export const useStudentProfile = () => {
  const store = useStudentProfileStore();
  
  return {
    // Estado
    profile: store.profile,
    loading: store.loading,
    error: store.error,
    isEditing: store.isEditing,
    hasUnsavedChanges: store.hasUnsavedChanges,
    
    // Estados de catálogos
    locations: store.locations,
    availabilities: store.availabilities,
    catalogsLoading: store.catalogsLoading,
    catalogsError: store.catalogsError,
    
    // Acciones
    fetchProfile: store.fetchProfile,
    updateProfile: store.updateProfile,
    clearError: store.clearError,
    reset: store.reset,
    setEditing: store.setEditing,
    setUnsavedChanges: store.setUnsavedChanges,
    refreshProfile: store.refreshProfile,
    
    // Acciones de catálogos
    loadCatalogs: store.loadCatalogs,
    loadLocations: store.loadLocations,
    loadAvailabilities: store.loadAvailabilities,
    clearCatalogsError: store.clearCatalogsError,
    
    // Utilidades
    isProfileComplete: store.isProfileComplete(),
    requiredFields: store.getRequiredFields(),
    missingRequiredFields: store.getMissingRequiredFields(),
    getFieldDisplayName: store.getFieldDisplayName,
    getLocationDisplay: store.getLocationDisplay,
    getAvailabilityDisplay: store.getAvailabilityDisplay,
  };
};