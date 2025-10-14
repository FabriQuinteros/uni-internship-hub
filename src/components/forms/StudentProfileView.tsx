import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Clock,
  AlertCircle,
  CheckCircle,
  Edit
} from 'lucide-react';
import { StudentProfile } from '@/types/user';

interface StudentProfileViewProps {
  profile: StudentProfile;
  onEdit?: () => void;
  showEditButton?: boolean;
  isComplete?: boolean;
  missingFields?: string[];
  className?: string;
}

/**
 * Componente de solo lectura para mostrar el perfil de estudiante
 * Reutilizable para diferentes contextos (perfil propio, vista de organización, etc.)
 */
export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  profile,
  onEdit,
  showEditButton = false,
  isComplete = true,
  missingFields = [],
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estado del perfil */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">
            {profile.first_name} {profile.last_name}
          </h2>
          <Badge variant={isComplete ? "default" : "secondary"}>
            {isComplete ? (
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
        </div>
        {showEditButton && onEdit && (
          <Button onClick={onEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {/* Alerta de campos faltantes */}
      {!isComplete && missingFields.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Faltan completar los siguientes campos: <strong>{missingFields.join(', ')}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Legajo</label>
              <p className="text-lg font-medium">{profile.legajo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre</label>
              <p className="text-lg font-medium">{profile.first_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Apellido</label>
              <p className="text-lg font-medium">{profile.last_name}</p>
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
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{profile.user?.email || 'No disponible'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Teléfono</label>
              <p className="text-lg">{profile.phone || 'No especificado'}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <label className="text-sm font-medium text-gray-500">Método de contacto preferido</label>
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
      {profile.location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{profile.location.name}, {profile.location.province}</p>
            <p className="text-sm text-gray-500">{profile.location.country}</p>
          </CardContent>
        </Card>
      )}

      {/* Formación y Experiencia */}
      {(profile.academic_formation || profile.previous_experience) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Formación y Experiencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.academic_formation && (
              <div>
                <label className="text-sm font-medium text-gray-500">Formación Académica</label>
                <p className="text-lg mt-1 whitespace-pre-wrap">{profile.academic_formation}</p>
              </div>
            )}
            
            {profile.academic_formation && profile.previous_experience && <Separator />}
            
            {profile.previous_experience && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experiencia Laboral Previa
                </label>
                <p className="text-lg mt-1 whitespace-pre-wrap">{profile.previous_experience}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disponibilidad */}
      {profile.availability && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Disponibilidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{profile.availability.name}</p>
            {profile.availability.description && (
              <p className="text-sm text-gray-500 mt-1">{profile.availability.description}</p>
            )}
            <Badge variant="outline" className="mt-2">
              <Clock className="h-3 w-3 mr-1" />
              Disponibilidad
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Información del Sistema (opcional) */}
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
  );
};