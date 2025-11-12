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
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
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
      <div className="container mx-auto py-6">
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
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Editar Mi Perfil</h1>
          <p className="text-gray-600 mt-2">
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu información personal y profesional
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <Badge variant={isProfileComplete ? "default" : "secondary"}>
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
          <Button onClick={handleEdit} disabled={loading}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        </div>
      </div>

      {/* Alerta de perfil incompleto */}
      {profile && !isProfileComplete && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tu perfil está incompleto. Por favor completa los siguientes campos obligatorios: {' '}
            <strong>{missingRequiredFields.map(field => getFieldDisplayName(field)).join(', ')}</strong>
          </AlertDescription>
        </Alert>
      )}

      {profile && (
        <div className="grid gap-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Datos básicos de identificación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Legajo</Label>
                  <p className="text-lg font-medium">{profile.legajo || 'No especificado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nombre</Label>
                  <p className="text-lg font-medium">{profile.first_name || 'No especificado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Apellido</Label>
                  <p className="text-lg font-medium">{profile.last_name || 'No especificado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-lg">{profile.user?.email || 'No disponible'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Teléfono</Label>
                  <p className="text-lg">{profile.phone || 'No especificado'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Método de contacto preferido</Label>
                <div className="flex items-center gap-2 mt-1">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-sm font-medium text-gray-500">Ubicación</Label>
                {(() => {
                  const locationDisplay = getLocationDisplay();
                  return locationDisplay ? (
                    <div className="mt-1">
                      <p className="text-lg">{locationDisplay.name}, {locationDisplay.province}</p>
                      <p className="text-sm text-gray-500">{locationDisplay.country}</p>
                    </div>
                  ) : (
                    <p className="text-lg mt-1 text-gray-500">No especificada</p>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Formación y Experiencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Formación y Experiencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-500">Formación Académica</Label>
                <p className="text-lg mt-1 whitespace-pre-wrap">
                  {profile.academic_formation || 'No especificada'}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experiencia Laboral Previa
                </Label>
                <p className="text-lg mt-1 whitespace-pre-wrap">
                  {profile.previous_experience || 'Sin experiencia previa especificada'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disponibilidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Disponibilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-sm font-medium text-gray-500">Modalidad de Disponibilidad</Label>
                {(() => {
                  const availabilityDisplay = getAvailabilityDisplay();
                  return availabilityDisplay ? (
                    <div className="mt-1">
                      <p className="text-lg">{availabilityDisplay.name}</p>
                      {availabilityDisplay.description && (
                        <p className="text-sm text-gray-500 mt-1">{availabilityDisplay.description}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-lg mt-1 text-gray-500">No especificada</p>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Información del Sistema */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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