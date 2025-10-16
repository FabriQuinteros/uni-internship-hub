import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AgreementExpiryDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (expiryDate: string) => void;
  organizationName: string;
}

const AgreementExpiryDatePicker: React.FC<AgreementExpiryDatePickerProps> = ({
  isOpen,
  onClose,
  onConfirm,
  organizationName
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Función para obtener la fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Función para obtener la fecha máxima sugerida (1 año desde hoy)
  const getMaxSuggestedDate = () => {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return oneYearFromNow.toISOString().split('T')[0];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    
    // Validar que la fecha no sea en el pasado
    const today = new Date().toISOString().split('T')[0];
    if (date && date < today) {
      setError('La fecha de expiración no puede ser en el pasado');
    } else {
      setError('');
    }
  };

  const handleConfirm = () => {
    console.log('📅 AgreementExpiryDatePicker handleConfirm called');
    console.log('📅 Selected date:', selectedDate);
    
    if (!selectedDate) {
      console.log('❌ No date selected');
      setError('Por favor selecciona una fecha de expiración');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (selectedDate < today) {
      console.log('❌ Date is in the past');
      setError('La fecha de expiración no puede ser en el pasado');
      return;
    }

    console.log('✅ Calling onConfirm with date:', selectedDate);
    onConfirm(selectedDate);
    handleClose();
    console.log('✅ Modal closed');
  };

  const handleClose = () => {
    setSelectedDate('');
    setError('');
    onClose();
  };

  // Función para establecer fechas comunes
  const setCommonDate = (months: number) => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + months);
    setSelectedDate(futureDate.toISOString().split('T')[0]);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fecha de Expiración del Convenio
          </DialogTitle>
          <DialogDescription>
            Establece la fecha de expiración del convenio para <strong>{organizationName}</strong>. 
            Después de esta fecha, la organización no podrá publicar ofertas hasta renovar el convenio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Campo de fecha */}
          <div className="space-y-2">
            <Label htmlFor="expiry-date">Fecha de Expiración</Label>
            <Input
              id="expiry-date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={getMinDate()}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Fechas comunes sugeridas */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Fechas comunes:</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCommonDate(6)}
                className="text-xs"
              >
                6 meses
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCommonDate(12)}
                className="text-xs"
              >
                1 año
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCommonDate(24)}
                className="text-xs"
              >
                2 años
              </Button>
            </div>
          </div>

          {/* Información adicional */}
          {selectedDate && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Fecha seleccionada:</strong> {new Date(selectedDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                La organización podrá publicar ofertas hasta esta fecha.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedDate || !!error}
          >
            Activar Organización
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AgreementExpiryDatePicker;