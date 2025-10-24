/**
 * Hook para manejar la lógica de postulación a ofertas
 * Gestiona estados de carga, errores y éxito
 */

import { useState, useCallback } from 'react';
import applicationService, { ApplyToOfferRequest } from '@/services/applicationService';

export interface UseApplyOfferResult {
  applying: boolean;
  error: string | null;
  success: boolean;
  applyToOffer: (offerId: number, data?: ApplyToOfferRequest) => Promise<boolean>;
  reset: () => void;
}

/**
 * Hook para postularse a ofertas
 */
export const useApplyOffer = (): UseApplyOfferResult => {
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Postularse a una oferta
   */
  const applyToOffer = useCallback(async (
    offerId: number,
    data?: ApplyToOfferRequest
  ): Promise<boolean> => {
    setApplying(true);
    setError(null);
    setSuccess(false);

    try {
      await applicationService.applyToOffer(offerId, data);
      setSuccess(true);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al postularse a la oferta';
      setError(errorMessage);
      console.error('Error applying to offer:', err);
      return false;
    } finally {
      setApplying(false);
    }
  }, []);

  /**
   * Resetear estados
   */
  const reset = useCallback(() => {
    setApplying(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    applying,
    error,
    success,
    applyToOffer,
    reset
  };
};
