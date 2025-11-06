/**
 * Hook para obtener el perfil completo de un estudiante por ID
 * Usado por organizaciones para ver detalles completos al revisar postulaciones
 */

import { useState, useCallback } from 'react';
import { StudentService } from '@/services/studentService';
import { StudentProfile } from '@/types/user';

export const useStudentFullProfile = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene el perfil completo de un estudiante por su ID
   */
  const fetchStudentProfile = useCallback(async (studentId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const studentProfile = await StudentService.getProfileById(studentId);
      setProfile(studentProfile);
      return studentProfile;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar el perfil del estudiante';
      setError(errorMessage);
      console.error('Error fetching student profile:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpia el perfil cargado y los errores
   */
  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  return {
    profile,
    loading,
    error,
    fetchStudentProfile,
    clearProfile
  };
};
