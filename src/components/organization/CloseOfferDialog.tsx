/**
 * Diálogo de confirmación para cerrar una oferta
 * Permite opcionalmente ingresar un motivo de cierre
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CloseOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  isLoading?: boolean;
  offerTitle: string;
}

export const CloseOfferDialog: React.FC<CloseOfferDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  offerTitle,
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason(''); // Limpiar el campo después de confirmar
  };

  const handleCancel = () => {
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Cerrar Oferta
          </DialogTitle>
          <DialogDescription>
            ¿Está seguro que desea cerrar la oferta "<strong>{offerTitle}</strong>"?
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta acción cambiará el estado de la oferta a "cerrada" y no recibirá más postulaciones.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="reason">
            Motivo de cierre <span className="text-muted-foreground text-sm">(opcional)</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Ej: Posición cubierta, Cambio de prioridades, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            disabled={isLoading}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            El motivo será registrado pero no será visible públicamente.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Cerrando...' : 'Cerrar Oferta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
