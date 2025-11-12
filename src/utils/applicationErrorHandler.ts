/**
 * Helper para manejar errores específicos de postulaciones
 * Traduce errores técnicos del backend a mensajes user-friendly
 */

export interface ApplicationError {
  status: number;
  message: string;
  error: string;
}

/**
 * Traduce errores de postulación a mensajes amigables
 */
export const handleApplicationError = (error: ApplicationError): string => {
  const { status, message, error: errorDetail } = error;
  const errorLower = (errorDetail || message || '').toLowerCase();
  
  // Errores 409 - Conflicto
  if (status === 409) {
    if (errorLower.includes('already applied')) {
      return 'Ya te postulaste a esta oferta anteriormente. Revisa tu sección de postulaciones.';
    }
    if (errorLower.includes('quota is full') || errorLower.includes('cupo')) {
      return 'Lo sentimos, no hay cupos disponibles para esta oferta.';
    }
    if (errorLower.includes('deadline')) {
      return 'La fecha límite de postulación ha vencido.';
    }
    if (errorLower.includes('not available') || errorLower.includes('not approved')) {
      return 'Esta oferta no está disponible para postulaciones en este momento.';
    }
    return 'No se pudo procesar tu postulación. Puede que ya te hayas postulado o la oferta no esté disponible.';
  }
  
  // Errores 400 - Bad Request
  if (status === 400) {
    if (errorLower.includes('existing application') || errorLower.includes('checking existing')) {
      return 'Ya tienes una postulación registrada para esta oferta. Revisa tu historial de postulaciones.';
    }
    if (errorLower.includes('profile') || errorLower.includes('perfil')) {
      return 'Debes completar tu perfil antes de postularte a ofertas.';
    }
    if (errorLower.includes('sql') || errorLower.includes('database')) {
      return 'Ocurrió un error al verificar tu postulación. Por favor, intenta nuevamente o contacta al administrador.';
    }
    return 'Hubo un problema al procesar tu postulación. Verifica que hayas completado todos los campos requeridos.';
  }
  
  // Errores 404 - Not Found
  if (status === 404) {
    if (errorLower.includes('offer')) {
      return 'La oferta que buscas no existe o fue eliminada.';
    }
    if (errorLower.includes('student')) {
      return 'No se encontró tu perfil de estudiante. Verifica que hayas completado tu registro.';
    }
    return 'El recurso solicitado no fue encontrado.';
  }
  
  // Errores 403 - Forbidden
  if (status === 403) {
    return 'No tienes permisos para postularte a esta oferta. Verifica que tu cuenta esté activa.';
  }
  
  // Errores 401 - Unauthorized
  if (status === 401) {
    return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
  }
  
  // Errores 500+ - Server errors
  if (status >= 500) {
    return 'Error en el servidor. Por favor, intenta nuevamente en unos minutos.';
  }
  
  // Error genérico
  return 'No se pudo completar tu postulación. Por favor, intenta nuevamente.';
};

/**
 * Traduce errores de evaluación de postulaciones (para organizaciones)
 */
export const handleEvaluationError = (error: ApplicationError): string => {
  const { status, message, error: errorDetail } = error;
  const errorLower = (errorDetail || message || '').toLowerCase();
  
  if (status === 404) {
    return 'La postulación no fue encontrada o ya fue procesada.';
  }
  
  if (status === 409) {
    if (errorLower.includes('already evaluated')) {
      return 'Esta postulación ya fue evaluada anteriormente.';
    }
    return 'No se puede evaluar esta postulación en su estado actual.';
  }
  
  if (status === 400) {
    if (errorLower.includes('rejection reason') || errorLower.includes('motivo')) {
      return 'Debes proporcionar un motivo al rechazar una postulación.';
    }
    return 'Datos inválidos. Verifica que hayas completado todos los campos requeridos.';
  }
  
  if (status === 403) {
    return 'No tienes permisos para evaluar esta postulación. Verifica que sea de una de tus ofertas.';
  }
  
  if (status >= 500) {
    return 'Error en el servidor. Por favor, intenta nuevamente en unos minutos.';
  }
  
  return 'No se pudo procesar la evaluación. Por favor, intenta nuevamente.';
};

/**
 * Traduce errores de cancelación de postulaciones (para estudiantes)
 */
export const handleCancelApplicationError = (error: ApplicationError): string => {
  const { status, message, error: errorDetail } = error;
  const errorLower = (errorDetail || message || '').toLowerCase();
  
  if (status === 404) {
    return 'La postulación no fue encontrada.';
  }
  
  if (status === 409) {
    if (errorLower.includes('already evaluated') || errorLower.includes('ya evaluada')) {
      return 'No puedes cancelar una postulación que ya fue evaluada por la organización.';
    }
    return 'No se puede cancelar esta postulación en su estado actual.';
  }
  
  if (status === 403) {
    return 'No tienes permisos para cancelar esta postulación.';
  }
  
  if (status >= 500) {
    return 'Error en el servidor. Por favor, intenta nuevamente en unos minutos.';
  }
  
  return 'No se pudo cancelar la postulación. Por favor, intenta nuevamente.';
};
