import { CatalogType } from '@/types/catalog';

/**
 * Traduce errores técnicos a mensajes amigables en español
 */
export const translateError = (error: string, catalogType?: CatalogType): string => {
  const errorLower = error.toLowerCase();
  
  // Nombres amigables para cada tipo de catálogo
  const catalogNames: Record<CatalogType, { singular: string; plural: string }> = {
    technologies: { singular: 'tecnología', plural: 'tecnologías' },
    positions: { singular: 'puesto', plural: 'puestos' },
    durations: { singular: 'duración', plural: 'duraciones' },
    locations: { singular: 'ubicación', plural: 'ubicaciones' },
    modalities: { singular: 'modalidad', plural: 'modalidades' },
  };

  const currentCatalog = catalogType ? catalogNames[catalogType] : { singular: 'elemento', plural: 'elementos' };

  // Errores de duplicación (MySQL 1062)
  if (errorLower.includes('duplicate entry') || errorLower.includes('1062')) {
    if (errorLower.includes("for key 'catalog_")) {
      // Extraer el campo que está duplicado
      if (errorLower.includes('.name')) {
        return `Ya existe ${currentCatalog.singular === 'ubicación' ? 'una' : 'un'} ${currentCatalog.singular} con ese nombre. Por favor, elige un nombre diferente.`;
      }
      if (errorLower.includes('.code')) {
        return `Ya existe ${currentCatalog.singular === 'ubicación' ? 'una' : 'un'} ${currentCatalog.singular} con ese código. Por favor, elige un código diferente.`;
      }
    }
    return `Ya existe ${currentCatalog.singular === 'ubicación' ? 'una' : 'un'} ${currentCatalog.singular} con esos datos. Por favor, verifica la información ingresada.`;
  }

  // Errores de unicidad específicos
  if (errorLower.includes('must be unique')) {
    if (errorLower.includes('name')) {
      return `El nombre de ${currentCatalog.singular === 'ubicación' ? 'la' : 'el'} ${currentCatalog.singular} ya está en uso. Por favor, elige un nombre diferente.`;
    }
    if (errorLower.includes('code')) {
      return `El código de ${currentCatalog.singular === 'ubicación' ? 'la' : 'el'} ${currentCatalog.singular} ya está en uso. Por favor, elige un código diferente.`;
    }
    return `Los datos ingresados ya están en uso. Por favor, verifica la información.`;
  }

  // Errores de validación
  if (errorLower.includes('validation error') || errorLower.includes('invalid')) {
    return `Los datos ingresados no son válidos. Por favor, revisa la información e intenta nuevamente.`;
  }

  // Errores de campos requeridos
  if (errorLower.includes('required') || errorLower.includes('cannot be null') || errorLower.includes('not null')) {
    return `Todos los campos obligatorios deben ser completados.`;
  }

  // Errores de longitud
  if (errorLower.includes('too long') || errorLower.includes('data too long')) {
    return `Uno o más campos exceden la longitud máxima permitida.`;
  }

  // Errores de conexión
  if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('timeout')) {
    return `Problema de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.`;
  }

  // Errores de servidor
  if (errorLower.includes('internal server error') || errorLower.includes('500')) {
    return `Error interno del servidor. Por favor, intenta nuevamente en unos momentos.`;
  }

  // Errores de autorización
  if (errorLower.includes('unauthorized') || errorLower.includes('401')) {
    return `No tienes permisos para realizar esta acción.`;
  }

  // Errores de no encontrado
  if (errorLower.includes('not found') || errorLower.includes('404')) {
    return `${currentCatalog.singular === 'ubicación' ? 'La' : 'El'} ${currentCatalog.singular} no fue ${currentCatalog.singular === 'ubicación' ? 'encontrada' : 'encontrado'}.`;
  }

  // Errores de conflicto
  if (errorLower.includes('conflict') || errorLower.includes('409')) {
    return `Existe un conflicto con los datos. Por favor, recarga la página e intenta nuevamente.`;
  }

  // Si no coincide con ningún patrón conocido, devolver un mensaje genérico amigable
  return `Ocurrió un error inesperado. Por favor, intenta nuevamente o contacta al administrador si el problema persiste.`;
};

/**
 * Procesa un error y devuelve un mensaje amigable
 */
export const processError = (error: any, catalogType?: CatalogType): string => {
  let errorMessage = '';

  // Si el error tiene una respuesta de la API
  if (error.response?.data) {
    const { data } = error.response;
    
    // Intentar extraer el mensaje de error de diferentes estructuras
    if (data.error) {
      errorMessage = data.error;
    } else if (data.message) {
      errorMessage = data.message;
    } else if (data.details) {
      errorMessage = data.details;
    } else if (typeof data === 'string') {
      errorMessage = data;
    }
  }
  
  // Si el error tiene un mensaje directo
  if (!errorMessage && error.message) {
    errorMessage = error.message;
  }
  
  // Si aún no hay mensaje, usar el error como string
  if (!errorMessage) {
    errorMessage = String(error);
  }

  // Traducir el mensaje a algo amigable
  return translateError(errorMessage, catalogType);
};