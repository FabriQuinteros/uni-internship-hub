/**
 * Modal para visualizar el perfil completo de un estudiante
 * Usado por organizaciones al revisar postulaciones
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Award,
} from "lucide-react";

interface StudentProfileModalProps {
  open: boolean;
  onClose: () => void;
  student: {
    name: string;
    legajo: string;
    email: string;
    phone?: string;
    location?: string;
    academic_formation?: string;
    availability?: string;
    previous_experience?: string;
    career?: string;
    university?: string;
    applied_at?: string;
  } | null;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  open,
  onClose,
  student,
}) => {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                {student.name}
              </DialogTitle>
              <DialogDescription className="text-base mt-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Legajo: {student.legajo}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="shrink-0">
              Estudiante
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Información de Contacto */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Información de Contacto
              </h4>
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="text-sm font-medium">{student.email}</div>
                  </div>
                </div>
                
                {student.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Teléfono</div>
                      <div className="text-sm font-medium">{student.phone}</div>
                    </div>
                  </div>
                )}
                
                {student.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Ubicación</div>
                      <div className="text-sm font-medium">{student.location}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Formación Académica */}
            {(student.academic_formation || student.career || student.university) && (
              <>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Formación Académica
                  </h4>
                  <div className="space-y-3">
                    {student.university && (
                      <div className="p-3 rounded-lg border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Universidad</div>
                        <div className="text-sm font-medium">{student.university}</div>
                      </div>
                    )}
                    
                    {student.career && (
                      <div className="p-3 rounded-lg border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Carrera</div>
                        <div className="text-sm font-medium">{student.career}</div>
                      </div>
                    )}
                    
                    {student.academic_formation && (
                      <div className="p-3 rounded-lg border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Detalles de Formación</div>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {student.academic_formation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Disponibilidad */}
            {student.availability && (
              <>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Disponibilidad
                  </h4>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <Badge variant="secondary" className="text-sm">
                      {student.availability}
                    </Badge>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Experiencia Previa */}
            {student.previous_experience && (
              <>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Experiencia Previa
                  </h4>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {student.previous_experience}
                    </p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Fecha de Postulación */}
            {student.applied_at && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="font-medium">Fecha de postulación: </span>
                    <span className="text-muted-foreground">
                      {new Date(student.applied_at).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Información adicional */}
        <div className="pt-4 border-t">
          <p className="text-xs text-center text-muted-foreground">
            Esta información ha sido proporcionada por el estudiante en su perfil
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
