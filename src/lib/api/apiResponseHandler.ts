// src/lib/api/apiResponseHandler.ts

import { AxiosResponse, AxiosError } from 'axios';
import { ApiHandlerResult, ErrorType, ApiSuccessResponse, ApiErrorResponse } from '@/types/api';

/**
 * Maneja las respuestas de la API de forma centralizada según la especificación
 * de códigos HTTP y estructuras de respuesta
 */
export const handleApiResponse = async <T = any>(
  responsePromise: Promise<AxiosResponse>
): Promise<ApiHandlerResult<T>> => {
  try {
    const response = await responsePromise;
    return handleSuccessResponse<T>(response);
  } catch (error) {
    return handleErrorResponse(error as AxiosError);
  }
};

/**
 * Maneja respuestas exitosas (2xx)
 */
const handleSuccessResponse = <T>(response: AxiosResponse): ApiHandlerResult<T> => {
  const { status, data } = response;

  switch (status) {
    case 200: // OK
    case 201: // Created
      const successData = data as ApiSuccessResponse<T>;
      return {
        success: true,
        data: successData.data,
        message: successData.message,
        type: 'validation'
      };

    case 204: // No Content (para DELETE exitoso)
      return {
        success: true,
        message: "Elemento eliminado exitosamente",
        type: 'validation'
      };

    default:
      return {
        success: true,
        data: data,
        message: "Operación realizada exitosamente",
        type: 'validation'
      };
  }
};

/**
 * Maneja respuestas de error (4xx, 5xx)
 */
const handleErrorResponse = (error: AxiosError): ApiHandlerResult => {
  if (!error.response) {
    // Error de red o timeout
    return {
      success: false,
      message: "Error de conexión. Verifica tu conexión a internet.",
      error: error.message,
      type: 'server_error'
    };
  }

  const { status, data } = error.response;
  const errorData = data as ApiErrorResponse;

  switch (status) {
    case 400: // Bad Request
      return handle400Error(errorData);

    case 404: // Not Found
      return handle404Error(errorData);

    case 500: // Internal Server Error
      return handle500Error(errorData);

    default:
      return {
        success: false,
        message: "Error inesperado",
        error: errorData?.error,
        type: 'unknown'
      };
  }
};

/**
 * Maneja errores 400 Bad Request
 */
const handle400Error = (errorData: ApiErrorResponse): ApiHandlerResult => {
  const { message, error } = errorData;

  // Mapeo de mensajes específicos según la especificación
  switch (message) {
    case "Invalid ID format":
      return {
        success: false,
        message: "El identificador no es válido",
        type: 'validation'
      };

    case "Invalid input":
      return {
        success: false,
        message: "Los datos enviados no son válidos",
        error,
        type: 'validation'
      };

    case "Error creating item":
      return handleCreateError(error);

    case "Error updating item":
      return handleUpdateError(error);

    case "Error deleting item":
      return handleDeleteError(error);

    default:
      return {
        success: false,
        message: message || "Solicitud inválida",
        error,
        type: 'validation'
      };
  }
};

/**
 * Maneja errores específicos de creación
 */
const handleCreateError = (error?: string): ApiHandlerResult => {
  if (!error) {
    return {
      success: false,
      message: "Error al crear el elemento",
      type: 'validation'
    };
  }

  const errorLower = error.toLowerCase();

  if (errorLower.includes('name is required')) {
    return {
      success: false,
      message: "El campo nombre es obligatorio",
      type: 'validation'
    };
  }

  if (errorLower.includes('name must be unique')) {
    return {
      success: false,
      message: "Ya existe un elemento con ese nombre",
      type: 'validation'
    };
  }

  if (errorLower.includes('invalid category')) {
    return {
      success: false,
      message: "La categoría debe ser 'technology' o 'skill'",
      type: 'validation'
    };
  }

  return {
    success: false,
    message: "Error al crear el elemento",
    error,
    type: 'validation'
  };
};

/**
 * Maneja errores específicos de actualización
 */
const handleUpdateError = (error?: string): ApiHandlerResult => {
  if (!error) {
    return {
      success: false,
      message: "No se pudo actualizar el elemento",
      type: 'validation'
    };
  }

  const errorLower = error.toLowerCase();

  if (errorLower.includes('name must be unique')) {
    return {
      success: false,
      message: "Ya existe un elemento con ese nombre",
      type: 'validation'
    };
  }

  return {
    success: false,
    message: "No se pudo actualizar el elemento",
    error,
    type: 'validation'
  };
};

/**
 * Maneja errores específicos de eliminación
 */
const handleDeleteError = (error?: string): ApiHandlerResult => {
  if (!error) {
    return {
      success: false,
      message: "No se pudo eliminar el elemento",
      type: 'validation'
    };
  }

  const errorLower = error.toLowerCase();

  if (errorLower.includes('constraint') || errorLower.includes('foreign key')) {
    return {
      success: false,
      message: "No se pudo eliminar el elemento (puede estar en uso)",
      type: 'validation'
    };
  }

  return {
    success: false,
    message: "No se pudo eliminar el elemento",
    error,
    type: 'validation'
  };
};

/**
 * Maneja errores 404 Not Found
 */
const handle404Error = (errorData: ApiErrorResponse): ApiHandlerResult => {
  return {
    success: false,
    message: errorData.message || "El elemento no existe",
    type: 'not_found'
  };
};

/**
 * Maneja errores 500 Internal Server Error
 */
const handle500Error = (errorData: ApiErrorResponse): ApiHandlerResult => {
  const { message } = errorData;

  switch (message) {
    case "Error listing items":
      return {
        success: false,
        message: "No se pudieron cargar los elementos",
        type: 'server_error'
      };

    default:
      return {
        success: false,
        message: "Error interno del servidor",
        type: 'server_error'
      };
  }
};

/**
 * Utility para crear mensajes específicos por entidad
 */
export const createEntityMessage = (
  baseMessage: string,
  entityType?: string
): string => {
  if (!entityType) return baseMessage;

  const entityNames: Record<string, { singular: string; plural: string }> = {
    technologies: { singular: 'tecnología', plural: 'tecnologías' },
    positions: { singular: 'puesto', plural: 'puestos' },
    durations: { singular: 'duración', plural: 'duraciones' },
    locations: { singular: 'ubicación', plural: 'ubicaciones' },
    modalities: { singular: 'modalidad', plural: 'modalidades' },
  };

  const entity = entityNames[entityType];
  if (!entity) return baseMessage;

  // Personalizar mensajes según la entidad
  return baseMessage
    .replace('elemento', entity.singular)
    .replace('elementos', entity.plural);
};