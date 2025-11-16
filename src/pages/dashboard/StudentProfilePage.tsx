import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Clock,
  Edit,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { StudentProfileForm } from '@/components/forms/StudentProfileForm';
import { useStudentProfile } from '@/store/studentProfileStore';
import { useToast } from '@/hooks/use-toast';

export const StudentProfilePage: React.FC = () => {
  const { toast } = useToast();
  const {
    profile,
    loading,
    error,
    fetchProfile,
    clearError,
    isEditing,
    setEditing,
    hasUnsavedChanges,
    isProfileComplete,
    missingRequiredFields,
    getFieldDisplayName,
    getLocationDisplay,
    getAvailabilityDisplay
  } = useStudentProfile();

  // Cargar perfil al montar el componente
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Manejar errores de carga inicial
  useEffect(() => {
    if (error && !isEditing) {
      toast({
        title: 'Error al cargar el perfil',
        description: error,
        variant: 'destructive'
      });
    }
  }, [error, isEditing, toast]);

  const handleEdit = () => {
    clearError();
    setEditing(true);
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres cancelar?'
      );
      if (!confirmCancel) return;
    }
    setEditing(false);
  };

  const handleSaveSuccess = () => {
    setEditing(false);
    toast({
      title: 'Perfil actualizado',
      description: 'Tu perfil se ha guardado correctamente.',
      variant: 'default'
    });
  };

  const handleRefresh = () => {
    fetchProfile();
  };

  // Renderizado de loading inicial
  if (loading && !profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Renderizado de error crítico
  if (error && !profile && !loading) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Renderizado del formulario en modo edición
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Editar Mi Perfil</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Actualiza tu información personal y profesional
          </p>
        </div>

        <StudentProfileForm
          onSave={handleSaveSuccess}
          onCancel={handleCancelEdit}
          showActions={true}
        />
      </div>
    );
  }

  // Renderizado de vista del perfil
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Mi Perfil</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gestiona tu información personal y profesional
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {profile && (
              <Badge 
                variant={isProfileComplete ? "default" : "secondary"}
                className="h-fit"
              >
                {isProfileComplete ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completo
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Incompleto
                  </>
                )}
              </Badge>
            )}
            <Button onClick={handleEdit} disabled={loading} className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </div>
        </div>
      </div>

      {/* Alerta de perfil incompleto */}
      {profile && !isProfileComplete && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Tu perfil está incompleto. Por favor completa los siguientes campos obligatorios: {' '}
            <strong>{missingRequiredFields.map(field => getFieldDisplayName(field)).join(', ')}</strong>
          </AlertDescription>
        </Alert>
      )}

      {profile && (
        <div className="grid gap-4 md:gap-6">
          {/* Información Personal */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <User className="h-5 w-5 text-primary" />
                Información Personal
              </CardTitle>
              <CardDescription className="text-sm">
                Datos básicos de identificación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Legajo</Label>
                  <p className="text-base md:text-lg font-medium mt-1">{profile.legajo || 'No especificado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                  <p className="text-base md:text-lg font-medium mt-1">{profile.first_name || 'No especificado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Apellido</Label>
                  <p className="text-base md:text-lg font-medium mt-1">{profile.last_name || 'No especificado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Mail className="h-5 w-5 text-primary" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-base mt-1">{profile.user?.email || 'No disponible'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                  <p className="text-base mt-1">{profile.phone || 'No especificado'}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Método de contacto preferido</Label>
                <div className="flex items-center gap-2 mt-2">
                  {profile.preferred_contact === 'email' ? (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      <span>Teléfono</span>
                    </>
                  )}
                  <Badge variant="outline" className="ml-2">
                    {profile.preferred_contact}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <MapPin className="h-5 w-5 text-primary" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Ubicación</Label>
                {(() => {
                  const locationDisplay = getLocationDisplay();
                  return locationDisplay ? (
                    <div className="mt-2">
                      <p className="text-base">{locationDisplay.name}, {locationDisplay.province}</p>
                      <p className="text-sm text-muted-foreground mt-1">{locationDisplay.country}</p>
                    </div>
                  ) : (
                    <p className="text-base mt-2 text-muted-foreground">No especificada</p>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Formación y Experiencia */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <GraduationCap className="h-5 w-5 text-primary" />
                Formación y Experiencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Formación Académica</Label>
                <p className="text-base mt-2 whitespace-pre-wrap leading-relaxed">
                  {profile.academic_formation || 'No especificada'}
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experiencia Laboral Previa
                </Label>
                <p className="text-base mt-2 whitespace-pre-wrap leading-relaxed">
                  {profile.previous_experience || 'Sin experiencia previa especificada'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disponibilidad */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Clock className="h-5 w-5 text-primary" />
                Disponibilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Modalidad de Disponibilidad</Label>
                {(() => {
                  const availabilityDisplay = getAvailabilityDisplay();
                  return availabilityDisplay ? (
                    <div className="mt-2">
                      <p className="text-base">{availabilityDisplay.name}</p>
                      {availabilityDisplay.description && (
                        <p className="text-sm text-muted-foreground mt-1">{availabilityDisplay.description}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-base mt-2 text-muted-foreground">No especificada</p>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Información del Sistema */}
          <Card className="bg-muted/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <strong>Perfil creado:</strong> {' '}
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES') : 'No disponible'}
                </div>
                <div>
                  <strong>Última actualización:</strong> {' '}
                  {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('es-ES') : 'No disponible'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Re-export para compatibilidad
export default StudentProfilePage;

// Componente Label simple para usar en la vista
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <label className={className}>{children}</label>
);