import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { OrganizationProfileForm } from '@/components/forms/OrganizationProfileForm';
import type { UploadedFile } from '@/components/upload/FileUploadManager';

/**
 * Datos de ejemplo para el perfil (en producción vendría de la API)
 */
const MOCK_PROFILE_DATA = {
  companyName: 'TechCorp Solutions',
  industry: 'technology',
  website: 'https://www.techcorp.com',
  address: 'Av. Corrientes 1234, CABA, Buenos Aires',
  contactName: 'María García',
  contactEmail: 'maria.garcia@techcorp.com',
  contactPhone: '+54 11 4567-8900',
  description: 'Somos una empresa líder en soluciones tecnológicas, especializada en desarrollo de software y consultoría digital. Nuestra misión es transformar la forma en que las empresas operan a través de la innovación tecnológica.',
  logo: {
    id: 'logo-1',
    name: 'techcorp-logo.png',
    size: 45678,
    type: 'image/png',
    status: 'success' as const,
    url: '/api/placeholder/200/200',
    preview: '/api/placeholder/200/200',
  } as UploadedFile,
};

/**
 * Página de perfil de organización
 * Permite a las organizaciones ver y editar su información de perfil
 */
const OrganizationProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(MOCK_PROFILE_DATA);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Maneja el guardado del perfil
   */
  const handleSaveProfile = async (data: any) => {
    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Actualizar los datos locales
      setProfileData(prev => ({ ...prev, ...data }));
      setIsEditing(false);
      setHasUnsavedChanges(false);
      
      console.log('Perfil guardado:', data);
    } catch (error) {
      throw new Error('Error al guardar el perfil');
    }
  };

  /**
   * Maneja la cancelación de la edición
   */
  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        '¿Estás seguro? Perderás todos los cambios no guardados.'
      );
      if (!confirmCancel) return;
    }
    
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  /**
   * Navegar de vuelta al dashboard
   */
  const handleBackToDashboard = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        '¿Estás seguro? Tienes cambios no guardados que se perderán.'
      );
      if (!confirmLeave) return;
    }
    
    navigate('/dashboard/organization');
  };

  return (
    <DashboardLayout userRole="organization">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button
                variant="outline"
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </Button>
              
              <div className="flex items-center gap-3">
                <Building className="h-6 w-6 text-primary shrink-0" />
                <h1 className="text-2xl md:text-3xl font-bold">Perfil de Organización</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <span>Editar Perfil</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Estado del perfil */}
        <Card className="border-l-4 border-l-success shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-success">Perfil Completado</p>
                <p className="text-sm text-muted-foreground">
                  Tu perfil está completo y tu organización está habilitada para publicar ofertas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información adicional para organizaciones */}
        {!isEditing && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Estado de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="bg-success/10 text-success">
                  Habilitada
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Puedes publicar ofertas de pasantías
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ofertas Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Ofertas publicadas actualmente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Postulaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  Estudiantes postulados este mes
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alertas informativas */}
        {isEditing && (
          <Alert>
            <AlertDescription>
              <strong>Modo de edición:</strong> Puedes modificar toda la información de tu organización. 
              Los cambios se reflejarán en tu perfil público una vez guardados.
            </AlertDescription>
          </Alert>
        )}

        {/* Formulario de perfil */}
        <OrganizationProfileForm
          initialData={profileData}
          onSave={handleSaveProfile}
          onCancel={isEditing ? handleCancelEdit : undefined}
          readOnly={!isEditing}
          className="max-w-none"
        />

        {/* Información adicional */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Información Importante</CardTitle>
              <CardDescription>
                Recomendaciones para mantener tu perfil actualizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Mantén tu perfil actualizado</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Revisa tu información cada 3 meses</li>
                    <li>• Actualiza tu logo si cambia la imagen corporativa</li>
                    <li>• Mantén los datos de contacto siempre vigentes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Consejos para un mejor perfil</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Usa una descripción clara y atractiva</li>
                    <li>• Incluye tu sitio web para mayor credibilidad</li>
                    <li>• Un logo profesional mejora tu imagen</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrganizationProfilePage;