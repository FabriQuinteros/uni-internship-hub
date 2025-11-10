export interface FormattedError {
  status: number;
  userMessage: string; // Mensaje amigable para mostrar al usuario (español)
  developerMessage?: string; // Mensaje técnico útil para logs
  original?: any; // Cuerpo original del backend o texto
}

/**
 * Intenta extraer información útil del body de la respuesta y devuelve
 * un mensaje en español, claro y empático para mostrar al usuario.
 */
export async function formatResponseError(response: Response, url?: string): Promise<FormattedError> {
  const status = response.status;
  let rawBody: any = null;
  let serverMessage: string | undefined = undefined;

  try {
    // Intentar parsear JSON; si falla, intentar texto
    rawBody = await response.clone().json().catch(() => undefined);
  } catch {
    rawBody = undefined;
  }

  if (!rawBody) {
    try {
      rawBody = await response.clone().text();
    } catch {
      rawBody = undefined;
    }
  }

  // Normalizar posibles campos de mensaje
  if (rawBody && typeof rawBody === 'object') {
    serverMessage = (rawBody.message || rawBody.error || rawBody.detail) as string | undefined;
  } else if (typeof rawBody === 'string') {
    serverMessage = rawBody;
  }

  // Mensaje base según código HTTP
  let userMessage = '';

  switch (status) {
    case 400:
      userMessage = 'Petición inválida. Verifica los datos ingresados e inténtalo de nuevo.';
      // Si hay errores de validación, intentar listar campos
      if (rawBody && typeof rawBody === 'object') {
        const validation = rawBody.errors || rawBody.validation || rawBody.details;
        if (validation && typeof validation === 'object') {
          try {
            const fields = Object.keys(validation);
            if (fields.length) {
              userMessage = `Hay errores en los campos: ${fields.join(', ')}. Revisa y vuelve a intentar.`;
            }
          } catch {}
        } else if (rawBody.message) {
          userMessage = String(rawBody.message);
        }
      }
      break;
    case 401:
      userMessage = 'No autorizado. Es posible que tu sesión haya expirado. Por favor inicia sesión nuevamente.';
      break;
    case 403:
      userMessage = 'No tienes permiso para realizar esta acción.';
      break;
    case 404:
      userMessage = 'No se encontró el recurso solicitado.';
      break;
    case 409:
      userMessage = serverMessage || 'Conflicto al procesar la solicitud.';
      break;
    case 422:
      userMessage = serverMessage || 'Datos inválidos. Revisa los campos e inténtalo de nuevo.';
      break;
    case 500:
      userMessage = 'Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.';
      break;
    default:
      userMessage = serverMessage || response.statusText || 'Ocurrió un error. Inténtalo de nuevo.';
  }

  // Añadir un tono empático y breve si el mensaje es muy técnico
  if (userMessage && !userMessage.endsWith('.')) userMessage += '.';

  const developerMessageParts: string[] = [];
  if (serverMessage) developerMessageParts.push(`server: ${serverMessage}`);
  if (url) developerMessageParts.push(`url: ${url}`);
  developerMessageParts.push(`status: ${status}`);

  return {
    status,
    userMessage,
    developerMessage: developerMessageParts.join(' | '),
    original: rawBody,
  };
}

/**
 * Formatea una excepción (network, timeout, etc.) a un FormattedError
 */
export function formatExceptionError(err: any): FormattedError {
  const message = err instanceof Error ? err.message : String(err);
  return {
    status: 0,
    userMessage: 'Error de comunicación. Por favor verifica tu conexión e inténtalo de nuevo.',
    developerMessage: `exception: ${message}`,
    original: err,
  };
}
