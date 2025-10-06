import { useState, useCallback, useEffect } from 'react';
import { ApiHandlerResult, ErrorType } from '@/types/api';
import { CatalogType } from '@/types/catalog';
import { getToastMessage } from '@/utils/errorTranslator';
import { useToast } from '@/hooks/use-toast';

export interface UseApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string, type: ErrorType) => void;
}


export const useApi = <T = any>(options: UseApiOptions = {}) => {
  const { toast } = useToast();
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const execute = useCallback(async (
    operation: () => Promise<ApiHandlerResult<T>>,
    operationType?: 'create' | 'update' | 'delete' | 'list',
    catalogType?: CatalogType
  ): Promise<ApiHandlerResult<T>> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false
    }));

    try {
      const result = await operation();

      if (result.success) {
        setState({
          data: result.data || null,
          loading: false,
          error: null,
          success: true
        });

        // Mostrar toast de éxito si está habilitado
        if (showSuccessToast) {
          toast({
            title: "Éxito",
            description: successMessage || result.message,
            variant: "default"
          });
        }

        // Ejecutar callback de éxito
        if (onSuccess && result.data) {
          onSuccess(result.data);
        }
      } else {
        const errorMessage = result.message || 'Error desconocido';
        
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          success: false
        });

        // Mostrar toast de error si está habilitado
        if (showErrorToast) {
          const toastMessage = operationType && catalogType
            ? getToastMessage(result.type, operationType, catalogType)
            : errorMessage;

          toast({
            title: "Error",
            description: toastMessage,
            variant: "destructive"
          });
        }

        // Ejecutar callback de error
        if (onError) {
          onError(errorMessage, result.type);
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false
      });

      // Mostrar toast de error para errores no controlados
      if (showErrorToast) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }

      // Devolver un resultado de error
      return {
        success: false,
        message: errorMessage,
        type: 'unknown'
      };
    }
  }, [toast, showSuccessToast, showErrorToast, successMessage, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};


export const useCatalogApi = <T = any>(
  catalogType: CatalogType,
  options: UseApiOptions = {}
) => {
  const baseApi = useApi<T>(options);

  const executeWithCatalogContext = useCallback(async (
    operation: () => Promise<ApiHandlerResult<T>>,
    operationType: 'create' | 'update' | 'delete' | 'list'
  ): Promise<ApiHandlerResult<T>> => {
    return baseApi.execute(operation, operationType, catalogType);
  }, [baseApi.execute, catalogType]);

  return {
    ...baseApi,
    execute: executeWithCatalogContext
  };
};


export const useApiList = <T = any>(
  fetchFunction: () => Promise<ApiHandlerResult<T[]>>,
  dependencies: any[] = []
) => {
  const [state, setState] = useState<UseApiState<T[]>>({
    data: [],
    loading: true,
    error: null,
    success: false
  });

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchFunction();

      if (result.success) {
        setState({
          data: result.data || [],
          loading: false,
          error: null,
          success: true
        });
      } else {
        setState({
          data: [],
          loading: false,
          error: result.message,
          success: false
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar datos';
      setState({
        data: [],
        loading: false,
        error: errorMessage,
        success: false
      });
    }
  }, [fetchFunction]);


  useEffect(() => {
    refresh();
  }, dependencies);

  return {
    ...state,
    refresh
  };
};