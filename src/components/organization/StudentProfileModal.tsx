/**
 * Modal para visualizar el perfil completo de un estudiante
 * Usado por organizaciones al revisar postulaciones
 */

import { useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  Clock,
  Award,
  Languages,
  Code,
  AlertCircle,
} from "lucide-react";
import { useStudentFullProfile } from "@/hooks/use-student-full-profile";

interface StudentProfileModalProps {
  open: boolean;
  onClose: () => void;
  studentId: number | null;
  studentName?: string;
  studentLegajo?: string;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  open,
  onClose,
  studentId,
  studentName,
  studentLegajo,
}) => {
  const { profile, loading, error, fetchStudentProfile, clearProfile } = useStudentFullProfile();

  // Cargar perfil cuando se abre el modal
  useEffect(() => {
    if (open && studentId) {
      fetchStudentProfile(studentId);
    } else if (!open) {
      clearProfile();
    }
  }, [open, studentId, fetchStudentProfile, clearProfile]);

  // Helpers para formatear niveles
  const getSkillLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado",
    };
    return labels[level] || level;
  };

  const getLanguageLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      basic: "Básico",
      intermediate: "Intermedio",
      advanced: "Avanzado",
      native: "Nativo",
    };
    return labels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-yellow-100 text-yellow-800 border-yellow-300",
      basic: "bg-yellow-100 text-yellow-800 border-yellow-300",
      intermediate: "bg-blue-100 text-blue-800 border-blue-300",
      advanced: "bg-green-100 text-green-800 border-green-300",
      native: "bg-purple-100 text-purple-800 border-purple-300",
    };
    return colors[level] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                {loading ? (
                  <Skeleton className="h-8 w-48" />
                ) : (
                  `${profile?.first_name} ${profile?.last_name}` || studentName || "Estudiante"
                )}
              </DialogTitle>
              <DialogDescription className="text-base mt-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `Legajo: ${profile?.legajo || studentLegajo || "N/A"}`
                )}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="shrink-0">
              Estudiante
            </Badge>
          </div>
        </DialogHeader>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {/* Profile Content */}
        {!loading && profile && (
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
                      <div className="text-sm font-medium">{profile.user?.email || "No especificado"}</div>
                    </div>
                  </div>
                  
                  {profile.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Teléfono</div>
                        <div className="text-sm font-medium">{profile.phone}</div>
                      </div>
                    </div>
                  )}
                  
                  {profile.location?.name && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Ubicación</div>
                        <div className="text-sm font-medium">
                          {profile.location.name}
                          {profile.location.province && `, ${profile.location.province}`}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Contacto Preferido</div>
                      <Badge variant="secondary" className="mt-1">
                        {profile.preferred_contact === 'email' ? 'Email' : 'Teléfono'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Formación Académica */}
              {profile.academic_formation && (
                <>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Formación Académica
                    </h4>
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {profile.academic_formation}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Disponibilidad */}
              {profile.availability?.name && (
                <>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Disponibilidad
                    </h4>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <Badge variant="secondary" className="text-sm">
                        {profile.availability.name}
                      </Badge>
                      {profile.availability.description && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {profile.availability.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Experiencia Previa */}
              {profile.previous_experience && (
                <>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Experiencia Previa
                    </h4>
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {profile.previous_experience}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Habilidades Técnicas */}
              {profile.skills && profile.skills.length > 0 && (
                <>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" />
                      Habilidades Técnicas
                    </h4>
                    <div className="space-y-2">
                      {profile.skills.map((skill) => (
                        <div 
                          key={skill.id} 
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {skill.technology?.name || `Tecnología ID ${skill.technology_id}`}
                            </span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={getLevelColor(skill.level)}
                          >
                            {getSkillLevelLabel(skill.level)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Idiomas */}
              {profile.languages && profile.languages.length > 0 && (
                <>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Languages className="h-4 w-4 text-primary" />
                      Idiomas
                    </h4>
                    <div className="space-y-2">
                      {profile.languages.map((language) => (
                        <div 
                          key={language.id} 
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-2">
                            <Languages className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {language.language?.name || `Idioma ID ${language.language_id}`}
                            </span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={getLevelColor(language.level)}
                          >
                            {getLanguageLevelLabel(language.level)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Información de Registro */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="font-medium">Fecha de registro: </span>
                    <span className="text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

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
