/**
 * Helper para traducir errores de postulaciones a mensajes legibles
 */

/**
 * Traduce errores de API relacionados con postulaciones
 * @param error - Error capturado
 * @param statusCode - Código de estado HTTP (opcional)
 * @returns Mensaje de error traducido
 */
export const handleApplicationError = (error: any, statusCode?: number): string => {
  // Si ya tiene un mensaje personalizado, usarlo
  if (error?.message) {
    return error.message;
  }

  const errorMessage = error?.response?.data?.error || error?.error || '';
  const status = statusCode || error?.response?.status;

  // Errores 409 - Conflicto de negocio
  if (status === 409) {
    if (errorMessage.includes('already applied')) {
      return 'Ya te postulaste a esta oferta anteriormente';
    }
    
    if (errorMessage.includes('quota is full') || errorMessage.includes('no cupos')) {
      return 'Lo sentimos, no hay cupos disponibles para esta oferta';
    }
    
    if (errorMessage.includes('deadline has passed') || errorMessage.includes('fecha límite')) {
      return 'La fecha límite para postularse a esta oferta ha vencido';
    }
    
    if (errorMessage.includes('not available') || errorMessage.includes('no está disponible')) {
      return 'Esta oferta no está disponible para postulaciones en este momento';
    }
    
    if (errorMessage.includes('already been evaluated')) {
      return 'Esta postulación ya fue evaluada y no puede modificarse';
    }
    
    return 'No se pudo procesar la postulación. Verifica los requisitos.';
  }

  // Errores 404 - No encontrado
  if (status === 404) {
    if (errorMessage.includes('offer')) {
      return 'La oferta que buscas no existe o fue eliminada';
    }
    
    if (errorMessage.includes('application')) {
      return 'No se encontró la postulación solicitada';
    }
    
    return 'El recurso solicitado no fue encontrado';
  }

  // Errores 403 - Prohibido
  if (status === 403) {
    return 'No tienes permisos para realizar esta acción';
  }

  // Errores 400 - Bad Request
  if (status === 400) {
    if (errorMessage.includes('rejection reason') || errorMessage.includes('motivo')) {
      return 'Debes proporcionar un motivo al rechazar una postulación';
    }
    
    return 'Los datos proporcionados no son válidos';
  }

  // Errores 401 - No autenticado
  if (status === 401) {
    return 'Debes iniciar sesión para realizar esta acción';
  }

  // Errores 500+ - Error del servidor
  if (status && status >= 500) {
    return 'Error en el servidor. Por favor, intenta nuevamente más tarde';
  }

  // Error genérico
  return 'Ocurrió un error inesperado. Por favor, intenta nuevamente';
};

/**
 * Verifica si un error es recuperable (el usuario puede reintentar)
 * @param error - Error capturado
 * @returns true si el error es recuperable
 */
export const isRecoverableError = (error: any): boolean => {
  const status = error?.response?.status || error?.status;
  
  // Errores de servidor o temporales son recuperables
  if (status && status >= 500) return true;
  
  // Timeout o errores de red son recuperables
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return true;
  }
  
  // Conflictos de negocio no son recuperables
  if (status === 409) return false;
  
  // Not found no es recuperable
  if (status === 404) return false;
  
  // Otros casos, asumir que no es recuperable
  return false;
};

/**
 * Extrae un mensaje de error amigable de una respuesta de API
 * @param response - Respuesta de la API
 * @returns Mensaje de error
 */
export const extractErrorMessage = (response: any): string => {
  // Intentar obtener el mensaje del backend
  if (response?.data?.error) return response.data.error;
  if (response?.data?.message) return response.data.message;
  
  // Mensajes por código de estado
  const status = response?.status;
  if (status === 400) return 'Datos inválidos';
  if (status === 401) return 'No autorizado';
  if (status === 403) return 'Acceso denegado';
  if (status === 404) return 'No encontrado';
  if (status === 409) return 'Conflicto con el estado actual';
  if (status >= 500) return 'Error del servidor';
  
  return 'Error desconocido';
};
