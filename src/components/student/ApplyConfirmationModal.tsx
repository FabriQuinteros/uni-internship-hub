/**
 * Modal de confirmación para postularse a una oferta
 * Permite al estudiante agregar un mensaje opcional
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Send, AlertCircle, Loader2 } from 'lucide-react';

interface ApplyConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (message?: string) => Promise<void>;
  offerTitle?: string;
  loading?: boolean;
  error?: string | null;
}

export const ApplyConfirmationModal: React.FC<ApplyConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  offerTitle,
  loading = false,
  error = null
}) => {
  const [message, setMessage] = useState('');

  const handleConfirm = async () => {
    await onConfirm(message.trim() || undefined);
  };

  const handleClose = () => {
    if (!loading) {
      setMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Confirmar Postulación
          </DialogTitle>
          <DialogDescription>
            Estás a punto de postularte a la oferta{' '}
            <span className="font-semibold text-foreground">
              {offerTitle || 'esta oferta'}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Mensaje opcional */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Mensaje para la organización{' '}
              <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="message"
              placeholder="¿Por qué te interesa esta oferta? ¿Qué puedes aportar? Destaca tu experiencia relevante..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              disabled={loading}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500 caracteres
            </p>
          </div>

          {/* Información importante */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Ten en cuenta:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Una vez enviada, no podrás editar tu postulación</li>
                <li>Solo podrás cancelarla si aún no ha sido evaluada</li>
                <li>Recibirás una notificación cuando sea revisada</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Confirmar Postulación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
