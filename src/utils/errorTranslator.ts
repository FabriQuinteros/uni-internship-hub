import { CatalogType } from '@/types/catalog';
import { ErrorType } from '@/types/api';


const catalogNames: Record<CatalogType, { singular: string; plural: string; article: string }> = {
  technologies: { singular: 'tecnología', plural: 'tecnologías', article: 'la' },
  positions: { singular: 'puesto', plural: 'puestos', article: 'el' },
  durations: { singular: 'duración', plural: 'duraciones', article: 'la' },
  locations: { singular: 'ubicación', plural: 'ubicaciones', article: 'la' },
  modalities: { singular: 'modalidad', plural: 'modalidades', article: 'la' },
};


export const getOperationMessages = (
  operation: 'create' | 'update' | 'delete' | 'list',
  catalogType?: CatalogType
) => {
  const entity = catalogType ? catalogNames[catalogType] : { singular: 'elemento', plural: 'elementos', article: 'el' };
  
  const messages = {
    create: {
      success: `${entity.article === 'la' ? 'La' : 'El'} ${entity.singular} fue ${entity.article === 'la' ? 'creada' : 'creado'} exitosamente`,
      duplicateName: `Ya existe ${entity.article === 'la' ? 'una' : 'un'} ${entity.singular} con ese nombre`,
      requiredField: (field: string) => `El campo ${field} es obligatorio`,
      invalidCategory: `La categoría debe ser 'technology' o 'skill'`,
      invalidData: 'Los datos enviados no son válidos',
      genericError: `Error al crear ${entity.article} ${entity.singular}`
    },
    update: {
      success: `${entity.article === 'la' ? 'La' : 'El'} ${entity.singular} fue ${entity.article === 'la' ? 'actualizada' : 'actualizado'} exitosamente`,
      notFound: `${entity.article === 'la' ? 'La' : 'El'} ${entity.singular} no existe`,
      invalidId: 'El identificador no es válido',
      duplicateName: `Ya existe ${entity.article === 'la' ? 'una' : 'un'} ${entity.singular} con ese nombre`,
      genericError: `No se pudo actualizar ${entity.article} ${entity.singular}`
    },
    delete: {
      success: `${entity.article === 'la' ? 'La' : 'El'} ${entity.singular} fue ${entity.article === 'la' ? 'eliminada' : 'eliminado'} exitosamente`,
      invalidId: 'El identificador no es válido',
      inUse: `No se pudo eliminar ${entity.article} ${entity.singular} (puede estar en uso)`,
      genericError: `No se pudo eliminar ${entity.article} ${entity.singular}`
    },
    list: {
      success: `${entity.plural} cargados exitosamente`,
      empty: `No hay ${entity.plural} disponibles`,
      error: `No se pudieron cargar los ${entity.plural}`
    }
  };

  return messages[operation];
};


export const translateError = (error: string, catalogType?: CatalogType): string => {
  const errorLower = error.toLowerCase();
  const entity = catalogType ? catalogNames[catalogType] : { singular: 'elemento', plural: 'elementos', article: 'el' };

  // Errores de duplicación (MySQL 1062)
  if (errorLower.includes('duplicate entry') || errorLower.includes('1062')) {
    if (errorLower.includes('.name')) {
      return `Ya existe ${entity.article === 'la' ? 'una' : 'un'} ${entity.singular} con ese nombre. Por favor, elige un nombre diferente.`;
    }
    if (errorLower.includes('.code')) {
      return `Ya existe ${entity.article === 'la' ? 'una' : 'un'} ${entity.singular} con ese código. Por favor, elige un código diferente.`;
    }
    return `Ya existe ${entity.article === 'la' ? 'una' : 'un'} ${entity.singular} con esos datos. Por favor, verifica la información ingresada.`;
  }

  // Errores de unicidad específicos
  if (errorLower.includes('must be unique')) {
    if (errorLower.includes('name')) {
      return `El nombre de ${entity.article} ${entity.singular} ya está en uso. Por favor, elige un nombre diferente.`;
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
    return `${entity.article === 'la' ? 'La' : 'El'} ${entity.singular} no fue ${entity.article === 'la' ? 'encontrada' : 'encontrado'}.`;
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

/**
 * Obtiene el mensaje de toast apropiado basado en el tipo de error
 */
export const getToastMessage = (
  errorType: ErrorType,
  operation: 'create' | 'update' | 'delete' | 'list',
  catalogType?: CatalogType
): string => {
  const entity = catalogType ? catalogNames[catalogType] : { singular: 'elemento', plural: 'elementos', article: 'el' };

  switch (errorType) {
    case 'validation':
      switch (operation) {
        case 'create':
          return `Error al crear ${entity.article} ${entity.singular}`;
        case 'update':
          return `No se pudo actualizar ${entity.article} ${entity.singular}`;
        case 'delete':
          return `No se pudo eliminar ${entity.article} ${entity.singular}`;
        case 'list':
          return `No se pudieron cargar los ${entity.plural}`;
        default:
          return 'Error de validación';
      }
    case 'not_found':
      return `${entity.article === 'la' ? 'La' : 'El'} ${entity.singular} no existe`;
    case 'server_error':
      return 'Error del servidor. Intenta nuevamente.';
    default:
      return 'Error inesperado. Intenta nuevamente.';
  }
};