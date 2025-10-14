/**
 * Modal para tomar decisiones de aprobación/rechazo de ofertas
 * Incluye formulario con motivo obligatorio para rechazos
 */

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText,
  Clock
} from 'lucide-react';
import { useAdminOffers } from '@/hooks/use-admin-offers';
import { ApprovalDecision } from '@/types/admin-offers';

interface ApprovalDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: number | null;
  offerTitle: string;
}

/**
 * Modal para decisiones de aprobación/rechazo
 */
const ApprovalDecisionModal: React.FC<ApprovalDecisionModalProps> = ({
  isOpen,
  onClose,
  offerId,
  offerTitle
}) => {
  const { approveOffer, rejectOffer, loadingApproval } = useAdminOffers();
  
  // Estados del formulario
  const [decision, setDecision] = useState<ApprovalDecision>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Limpiar formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setDecision('approve');
      setRejectionReason('');
      setFormError(null);
    }
  }, [isOpen]);

  /**
   * Valida el formulario antes del envío
   */
  const validateForm = (): boolean => {
    setFormError(null);

    if (decision === 'reject') {
      if (!rejectionReason.trim()) {
        setFormError('El motivo de rechazo es obligatorio');
        return false;
      }
      
      if (rejectionReason.trim().length < 10) {
        setFormError('El motivo de rechazo debe tener al menos 10 caracteres');
        return false;
      }

      if (rejectionReason.trim().length > 500) {
        setFormError('El motivo de rechazo no puede superar los 500 caracteres');
        return false;
      }
    }

    return true;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async () => {
    if (!offerId) return;
    
    if (!validateForm()) return;

    try {
      if (decision === 'approve') {
        await approveOffer(offerId);
      } else {
        await rejectOffer(offerId, rejectionReason.trim());
      }
      
      onClose();
    } catch (error) {
      // El error ya se maneja en el hook y se muestra via toast
      console.error('Error en decisión de oferta:', error);
    }
  };

  /**
   * Configuración de opciones de decisión
   */
  const decisionOptions = [
    {
      value: 'approve' as const,
      label: 'Aprobar Oferta',
      description: 'La oferta será publicada y visible para estudiantes',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      value: 'reject' as const,
      label: 'Rechazar Oferta',
      description: 'La oferta será devuelta a la organización para correcciones',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  const currentOption = decisionOptions.find(opt => opt.value === decision);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Decisión sobre Oferta
          </DialogTitle>
          <DialogDescription className="text-base">
            Revisa y toma una decisión sobre la siguiente oferta:
          </DialogDescription>
        </DialogHeader>

        {/* Información de la oferta */}
        <div className="bg-muted/30 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-foreground line-clamp-1">
              {offerTitle}
            </h4>
            <Badge variant="outline" className="text-xs">
              ID: {offerId}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Esta decisión será notificada automáticamente a la organización.
          </p>
        </div>

        {/* Error del formulario */}
        {formError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {/* Opciones de decisión */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Selecciona tu decisión:</Label>
          
          <RadioGroup value={decision} onValueChange={setDecision as (value: string) => void}>
            <div className="space-y-3">
              {decisionOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = decision === option.value;
                
                return (
                  <div 
                    key={option.value}
                    className={`
                      relative flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected 
                        ? `${option.bgColor} ${option.borderColor} shadow-sm` 
                        : 'border-muted hover:border-muted-foreground/20 hover:bg-muted/30'
                      }
                    `}
                    onClick={() => setDecision(option.value)}
                  >
                    <RadioGroupItem value={option.value} className="mt-1" />
                    <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? option.color : 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {option.label}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        {/* Campo de motivo de rechazo */}
        {decision === 'reject' && (
          <div className="space-y-2">
            <Label htmlFor="rejection-reason" className="text-base font-medium text-red-700">
              Motivo del Rechazo *
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Explica por qué se rechaza la oferta. Este mensaje será enviado a la organización para que puedan corregir y reenviar la oferta..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {rejectionReason.length < 10 
                  ? `Mínimo 10 caracteres (faltan ${10 - rejectionReason.length})`
                  : '✓ Mínimo alcanzado'
                }
              </span>
              <span>{rejectionReason.length}/500</span>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">¿Qué sucede después?</p>
              <ul className="text-xs space-y-1">
                {decision === 'approve' ? (
                  <>
                    <li>• La oferta será publicada inmediatamente</li>
                    <li>• Los estudiantes podrán ver y postularse</li>
                    <li>• La organización será notificada de la aprobación</li>
                  </>
                ) : (
                  <>
                    <li>• La oferta volverá al estado "rechazada"</li>
                    <li>• La organización recibirá el motivo del rechazo</li>
                    <li>• Podrán corregir y reenviar la oferta</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loadingApproval}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loadingApproval || (decision === 'reject' && !rejectionReason.trim())}
            className={`
              ${decision === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            `}
          >
            {loadingApproval ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Procesando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {currentOption && <currentOption.icon className="h-4 w-4" />}
                {decision === 'approve' ? 'Aprobar Oferta' : 'Rechazar Oferta'}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDecisionModal;