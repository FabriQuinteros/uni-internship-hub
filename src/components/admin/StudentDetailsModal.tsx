import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { CalendarDays, Mail, Phone, User, Clock } from 'lucide-react';
import { Student } from '../../types/user';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  if (!student) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'suspended': return 'Suspendido';
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalles del Estudiante
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                  <p className="text-base font-medium">{student.firstName} {student.lastName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Legajo</label>
                  <p className="text-base font-medium">{student.legajo}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(student.status)}>
                      {getStatusText(student.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{student.email}</span>
                </div>
                
                {student.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{student.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información del sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
                  <p className="text-base">{formatDate(student.createdAt)}</p>
                </div>
              </div>
              
              {student.updatedAt && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Última Actualización</label>
                    <p className="text-base">{formatDate(student.updatedAt)}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">ID del Sistema</label>
                <p className="text-sm text-gray-600 font-mono">{student.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};