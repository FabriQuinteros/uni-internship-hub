/**
 * Utilidades para validar el estado operativo de organizaciones
 * Basado en la nueva lógica simplificada que usa solo 'status' + 'agreementExpiry'
 */

import { Organization, OrganizationStatus } from '../types/user';

export interface ValidationResult {
  canAccess: boolean;
  reason?: string;
}

/**
 * Determina si una organización puede operar según la nueva lógica:
 * - Debe tener status = 'active'
 * - Si tiene agreementExpiry, debe ser fecha futura (no expirado)
 * - Si no tiene agreementExpiry, puede operar sin restricción temporal
 */
export function canOrganizationOperate(org: Organization): boolean {
  // Primero verificar que la cuenta esté activa
  if (org.status !== OrganizationStatus.ACTIVE) {
    return false;
  }

  // Si no hay fecha de expiración, puede operar
  if (!org.agreementExpiry) {
    return true;
  }

  // Si hay fecha de expiración, verificar que no haya expirado
  // El backend puede enviar formato ISO (2026-10-15T00:00:00Z) o formato fecha (2026-10-15)
  const expiryDate = new Date(org.agreementExpiry);
  const today = new Date();
  
  // Comparar solo fechas (sin horas) para evitar problemas de timezone
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const expiryDateOnly = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
  
  return expiryDateOnly > todayDateOnly;
}

/**
 * Validación completa con mensajes descriptivos para el usuario
 */
export function validateOrganizationAccess(org: Organization): ValidationResult {
  if (org.status !== OrganizationStatus.ACTIVE) {
    const statusMessages = {
      [OrganizationStatus.PENDING]: 'La cuenta está pendiente de aprobación. Contacte al administrador.',
      [OrganizationStatus.REJECTED]: 'La cuenta ha sido rechazada. Contacte al administrador.',
      [OrganizationStatus.SUSPENDED]: 'La cuenta está suspendida. Contacte al administrador.',
    };

    return {
      canAccess: false,
      reason: statusMessages[org.status] || 'La cuenta no está activa. Contacte al administrador.'
    };
  }

  if (org.agreementExpiry) {
    const expiryDate = new Date(org.agreementExpiry);
    const today = new Date();
    
    // Comparar solo fechas para evitar problemas de timezone
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const expiryDateOnly = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
    
    if (expiryDateOnly <= todayDateOnly) {
      return {
        canAccess: false,
        reason: 'El convenio ha expirado. Contacte al administrador para renovarlo.'
      };
    }
  }

  return { canAccess: true };
}

/**
 * Obtiene el estado del convenio para filtros y displays
 */
export function getAgreementStatus(org: Organization): 'valid' | 'expired' | 'no_expiry' {
  if (!org.agreementExpiry) return 'no_expiry';
  
  const expiryDate = new Date(org.agreementExpiry);
  const today = new Date();
  
  // Comparar solo fechas para evitar problemas de timezone
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const expiryDateOnly = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
  
  return expiryDateOnly > todayDateOnly ? 'valid' : 'expired';
}

/**
 * Obtiene información readable del estado del convenio
 */
export function getAgreementStatusInfo(org: Organization): {
  status: 'valid' | 'expired' | 'no_expiry';
  label: string;
  color: 'green' | 'red' | 'gray';
  description: string;
} {
  const status = getAgreementStatus(org);
  
  switch (status) {
    case 'valid':
      return {
        status: 'valid',
        label: 'Vigente',
        color: 'green',
        description: `Válido hasta ${new Date(org.agreementExpiry!).toLocaleDateString('es-ES')}`
      };
    case 'expired':
      return {
        status: 'expired',
        label: 'Expirado',
        color: 'red',
        description: `Expiró el ${new Date(org.agreementExpiry!).toLocaleDateString('es-ES')}`
      };
    case 'no_expiry':
      return {
        status: 'no_expiry',
        label: 'Sin vencimiento',
        color: 'gray',
        description: 'No tiene fecha de expiración establecida'
      };
  }
}

/**
 * Verifica si el convenio está próximo a expirar (dentro de X días)
 */
export function isAgreementExpiringSoon(org: Organization, daysThreshold: number = 30): boolean {
  if (!org.agreementExpiry) return false;
  
  const expiryDate = new Date(org.agreementExpiry);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry > 0 && daysUntilExpiry <= daysThreshold;
}

/**
 * Calcula días restantes hasta la expiración
 */
export function getDaysUntilExpiry(org: Organization): number | null {
  if (!org.agreementExpiry) return null;
  
  const expiryDate = new Date(org.agreementExpiry);
  const today = new Date();
  
  // Calcular diferencia solo en días para evitar problemas de timezone
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const expiryDateOnly = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
  
  return Math.ceil((expiryDateOnly.getTime() - todayDateOnly.getTime()) / (1000 * 60 * 60 * 24));
}