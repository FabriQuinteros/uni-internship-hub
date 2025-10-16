import React, { useState } from 'react';
import { AlertTriangle, Trash2, Building, FileX, Bell, Key } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Organization } from '../../types/user';

interface DeleteOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  organization: Organization | null;
  isDeleting: boolean;
}

const DeleteOrganizationModal: React.FC<DeleteOrganizationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  organization,
  isDeleting
}) => {
  const [confirmationName, setConfirmationName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleClose = () => {
    setConfirmationName('');
    setError('');
    onClose();
  };

  const handleConfirm = () => {
    if (!organization) return;

    // Validar que el nombre ingresado coincide exactamente
    if (confirmationName.trim() !== organization.name.trim()) {
      setError('El nombre de la organización no coincide. Por favor verifica e intenta de nuevo.');
      return;
    }

    setError('');
    onConfirm();
  };

  const isConfirmationValid = confirmationName.trim() === organization?.name.trim();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-destructive">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            Eliminar Organización
          </DialogTitle>
          <DialogDescription className="text-base">
            Esta acción eliminará permanentemente la organización <strong>{organization?.name}</strong> y todos sus datos asociados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Advertencia crítica */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              ⚠️ ADVERTENCIA: Esta acción es irreversible y no se puede deshacer.
            </AlertDescription>
          </Alert>

          {/* Lista de elementos que se eliminarán */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Se eliminarán los siguientes elementos:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Building className="h-4 w-4 text-red-500" />
                <span>Cuenta de organización y perfil completo</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <FileX className="h-4 w-4 text-red-500" />
                <span>Todas las ofertas de trabajo publicadas</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Bell className="h-4 w-4 text-red-500" />
                <span>Notificaciones y mensajes del sistema</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Key className="h-4 w-4 text-red-500" />
                <span>Tokens de acceso y sesiones activas</span>
              </div>
            </div>
          </div>

          {/* Confirmación del nombre */}
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium text-destructive">
              Confirmación requerida *
            </Label>
            <p className="text-sm text-muted-foreground">
              Para confirmar la eliminación, escribe exactamente el nombre de la organización:
            </p>
            <div className="p-2 bg-muted rounded text-sm font-mono text-center">
              {organization?.name}
            </div>
            <Input
              id="confirmation"
              placeholder="Escribe el nombre exacto de la organización"
              value={confirmationName}
              onChange={(e) => {
                setConfirmationName(e.target.value);
                setError(''); // Limpiar error cuando el usuario escribe
              }}
              className={error ? 'border-red-500' : ''}
              disabled={isDeleting}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Información adicional */}
          {organization && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm space-y-1">
              <div><strong>ID:</strong> {organization.id}</div>
              <div><strong>Email:</strong> {organization.email}</div>
              <div><strong>Estado:</strong> {organization.status}</div>
              <div><strong>Creada:</strong> {new Date(organization.createdAt).toLocaleDateString('es-ES')}</div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isDeleting}
            className="min-w-[120px]"
          >
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteOrganizationModal;