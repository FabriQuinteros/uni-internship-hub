import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

/**
 * Tipos de modal de confirmación
 */
export type ConfirmationType = 'danger' | 'warning' | 'info' | 'success';

/**
 * Props del modal de confirmación
 */
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  isLoading?: boolean;
  children?: React.ReactNode;
}

/**
 * Props del trigger del modal de confirmación
 */
export interface ConfirmationTriggerProps {
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * Obtiene el icono y estilos según el tipo de confirmación
 * @param type - Tipo de confirmación
 */
const getConfirmationStyles = (type: ConfirmationType) => {
  switch (type) {
    case 'danger':
      return {
        icon: <XCircle className="h-6 w-6 text-destructive" />,
        confirmClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      };
    case 'warning':
      return {
        icon: <AlertTriangle className="h-6 w-6 text-warning" />,
        confirmClass: 'bg-warning text-warning-foreground hover:bg-warning/90',
      };
    case 'success':
      return {
        icon: <CheckCircle className="h-6 w-6 text-success" />,
        confirmClass: 'bg-success text-success-foreground hover:bg-success/90',
      };
    case 'info':
    default:
      return {
        icon: <Info className="h-6 w-6 text-primary" />,
        confirmClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
      };
  }
};

/**
 * Modal de confirmación reutilizable
 * Permite confirmar acciones críticas con diferentes tipos visuales
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  isLoading = false,
  children,
}) => {
  const { icon, confirmClass } = getConfirmationStyles(type);

  /**
   * Maneja la confirmación de la acción
   */
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // El error se maneja en el componente padre
      console.error('Error en confirmación:', error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-3">
            {icon}
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Contenido adicional opcional */}
        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={confirmClass}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/**
 * Hook para manejar modals de confirmación de forma declarativa
 */
export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    type: ConfirmationType;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);

  /**
   * Muestra un modal de confirmación
   * @param options - Opciones del modal
   */
  const showConfirmation = (options: {
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    type?: ConfirmationType;
    confirmText?: string;
    cancelText?: string;
  }) => {
    setConfirmationState({
      isOpen: true,
      type: 'info',
      ...options,
    });
  };

  /**
   * Cierra el modal de confirmación
   */
  const closeConfirmation = () => {
    setConfirmationState(null);
    setIsLoading(false);
  };

  /**
   * Maneja la confirmación
   */
  const handleConfirm = async () => {
    if (!confirmationState) return;

    setIsLoading(true);
    try {
      await confirmationState.onConfirm();
      closeConfirmation();
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  /**
   * Métodos de conveniencia para diferentes tipos
   */
  const confirmDanger = (
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>,
    confirmText = 'Eliminar'
  ) => {
    showConfirmation({
      title,
      description,
      onConfirm,
      type: 'danger',
      confirmText,
    });
  };

  const confirmWarning = (
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>
  ) => {
    showConfirmation({
      title,
      description,
      onConfirm,
      type: 'warning',
    });
  };

  const confirmInfo = (
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>
  ) => {
    showConfirmation({
      title,
      description,
      onConfirm,
      type: 'info',
    });
  };

  // Componente del modal
  const ConfirmationComponent = confirmationState ? (
    <ConfirmationModal
      isOpen={true}
      onClose={closeConfirmation}
      onConfirm={handleConfirm}
      title={confirmationState.title}
      description={confirmationState.description}
      type={confirmationState.type}
      confirmText={confirmationState.confirmText}
      cancelText={confirmationState.cancelText}
      isLoading={isLoading}
    />
  ) : null;

  return {
    showConfirmation,
    confirmDanger,
    confirmWarning,
    confirmInfo,
    closeConfirmation,
    ConfirmationComponent,
    isLoading,
  };
};

/**
 * Componente trigger que envuelve un elemento para mostrar confirmación al hacer clic
 */
export const ConfirmationTrigger: React.FC<ConfirmationTriggerProps> = ({
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  children,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  /**
   * Maneja la confirmación
   */
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      // El error se maneja en el componente padre
      console.error('Error en confirmación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => !disabled && setIsOpen(true)}>
        {children}
      </div>
      
      <ConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title={title}
        description={description}
        confirmText={confirmText}
        cancelText={cancelText}
        type={type}
        isLoading={isLoading}
      />
    </>
  );
};

export default ConfirmationModal;