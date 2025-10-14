import { useCallback, useEffect } from 'react';
import { useStudentProfileStore } from '@/store/studentProfileStore';
import { UpdateStudentProfileRequest } from '@/types/user';
import { useApi } from '@/hooks/use-api';
import { StudentService } from '@/services/studentService';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook personalizado para gestión del perfil de estudiante
 * Combina el store de Zustand con patrones de la aplicación
 */
export const useStudentProfileForm = () => {
  const { toast } = useToast();
  const profileStore = useStudentProfileStore();
  
  // API hook para operaciones
  const { execute: executeUpdate, loading: updating } = useApi({
    showSuccessToast: false, // Manejamos toasts manualmente
    showErrorToast: false,
    onSuccess: (data) => {
      // El store ya se actualiza en updateProfile
      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios se han guardado correctamente.',
        variant: 'default'
      });
    },
    onError: (error, type) => {
      toast({
        title: 'Error al actualizar',
        description: error,
        variant: 'destructive'
      });
    }
  });

  // Cargar perfil al inicializar
  const initializeProfile = useCallback(async () => {
    if (!profileStore.profile && !profileStore.loading) {
      await profileStore.fetchProfile();
    }
  }, [profileStore]);

  // Actualizar perfil con validaciones adicionales
  const updateProfile = useCallback(async (data: UpdateStudentProfileRequest) => {
    try {
      // Validaciones pre-envío
      if (!data.legajo?.trim()) {
        throw new Error('El legajo es requerido');
      }
      if (!data.first_name?.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (!data.last_name?.trim()) {
        throw new Error('El apellido es requerido');
      }
      if (!data.preferred_contact) {
        throw new Error('El método de contacto preferido es requerido');
      }

      // Ejecutar actualización
      await executeUpdate(async () => {
        const updatedProfile = await StudentService.updateProfile(data);
        return {
          success: true,
          data: updatedProfile,
          message: 'Perfil actualizado correctamente',
          type: 'unknown' as const
        };
      });

      // Si llegamos aquí, fue exitoso
      // El store se actualiza automáticamente a través del servicio
      profileStore.setEditing(false);
      profileStore.setUnsavedChanges(false);
      
    } catch (error: any) {
      // Manejar errores específicos
      let errorMessage = error.message || 'Error al actualizar el perfil';
      
      if (error.message?.includes('legajo ya registrado')) {
        errorMessage = 'El legajo ingresado ya está en uso por otro estudiante';
      } else if (error.message?.includes('requerido')) {
        errorMessage = 'Por favor complete todos los campos obligatorios';
      } else if (error.message?.includes('400')) {
        errorMessage = 'Los datos ingresados no son válidos';
      } else if (error.message?.includes('401')) {
        errorMessage = 'Su sesión ha expirado. Por favor inicie sesión nuevamente';
      } else if (error.message?.includes('403')) {
        errorMessage = 'No tiene permisos para realizar esta acción';
      }

      toast({
        title: 'Error al guardar',
        description: errorMessage,
        variant: 'destructive'
      });

      throw error;
    }
  }, [executeUpdate, profileStore, toast]);

  // Validar disponibilidad de legajo (debounced)
  const validateLegajo = useCallback(async (legajo: string): Promise<boolean> => {
    if (!legajo?.trim()) return false;
    
    // Si es el mismo legajo actual, es válido
    if (profileStore.profile?.legajo === legajo) return true;
    
    try {
      // Aquí podrías agregar una validación específica de legajo único
      // por ahora asumimos que la validación se hace en el servidor
      return true;
    } catch (error) {
      return false;
    }
  }, [profileStore.profile?.legajo]);

  // Verificar cambios pendientes antes de salir
  const checkUnsavedChanges = useCallback((): boolean => {
    return profileStore.hasUnsavedChanges;
  }, [profileStore.hasUnsavedChanges]);

  // Confirmar salida con cambios pendientes
  const confirmNavigation = useCallback((): boolean => {
    if (!checkUnsavedChanges()) return true;
    
    return window.confirm(
      'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?'
    );
  }, [checkUnsavedChanges]);

  // Resetear formulario
  const resetForm = useCallback(() => {
    profileStore.setEditing(false);
    profileStore.setUnsavedChanges(false);
    profileStore.clearError();
  }, [profileStore]);

  // Auto-inicializar perfil
  useEffect(() => {
    initializeProfile();
  }, [initializeProfile]);

  return {
    // Estado del perfil
    profile: profileStore.profile,
    loading: profileStore.loading || updating,
    error: profileStore.error,
    isEditing: profileStore.isEditing,
    hasUnsavedChanges: profileStore.hasUnsavedChanges,
    
    // Estados calculados
    isProfileComplete: profileStore.isProfileComplete(),
    requiredFields: profileStore.getRequiredFields(),
    missingRequiredFields: profileStore.getMissingRequiredFields(),
    
    // Acciones principales
    fetchProfile: profileStore.fetchProfile,
    updateProfile,
    refreshProfile: profileStore.refreshProfile,
    
    // Control de edición
    startEditing: () => profileStore.setEditing(true),
    cancelEditing: () => {
      if (confirmNavigation()) {
        resetForm();
      }
    },
    
    // Utilidades
    clearError: profileStore.clearError,
    validateLegajo,
    checkUnsavedChanges,
    confirmNavigation,
    resetForm,
    
    // Control de cambios
    setUnsavedChanges: profileStore.setUnsavedChanges,
  };
};

/**
 * Hook simple para solo lectura del perfil
 */
export const useStudentProfileView = () => {
  const profileStore = useStudentProfileStore();
  
  // Auto-cargar si no está cargado
  useEffect(() => {
    if (!profileStore.profile && !profileStore.loading) {
      profileStore.fetchProfile();
    }
  }, [profileStore]);

  return {
    profile: profileStore.profile,
    loading: profileStore.loading,
    error: profileStore.error,
    isProfileComplete: profileStore.isProfileComplete(),
    refreshProfile: profileStore.refreshProfile,
  };
};

// Re-export del hook del store para compatibilidad
export { useStudentProfile } from '@/store/studentProfileStore';