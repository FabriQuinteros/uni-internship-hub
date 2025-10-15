import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganizationProfileForm, type OrganizationProfileFormProps } from '@/components/forms/OrganizationProfileForm';
import { type UploadedFile } from '@/components/upload/FileUploadManager';
import { organizationService } from '@/services/organizationService';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { OrganizationProfile } from '@/types/user';

/**
 * Página del perfil de organización
 * 
 * Esta página permite a las organizaciones:
 * - Ver su perfil actual
 * - Editar la información de su perfil
 * - Subir/cambiar su logo
 * - Guardar los cambios realizados
 */
export const OrganizationProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [organizationData, setOrganizationData] = useState<OrganizationProfile | null>(null);
  const { toast } = useToast();
  const auth = useAuth();

  /**
   * Carga los datos del perfil de la organización
   */
  useEffect(() => {
    const loadOrganizationProfile = async () => {
      try {
        setLoading(true);
        const userId = auth.user?.id ? Number(auth.user.id) : undefined;
        const profile = await organizationService.getProfile(userId);
        setOrganizationData(profile);
      } catch (error: any) {
        toast({
          title: 'Error al cargar perfil',
          description: error.message || 'No se pudo cargar la información del perfil',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationProfile();
  }, [auth.user, toast]);

  /**
   * Transforma los datos del backend al formato del formulario
   */
  const transformToFormData = (profile: OrganizationProfile) => {
    return {
      companyName: profile.businessName || '',
      industry: profile.industry || '',
      website: profile.website || '',
      address: profile.address || '',
      contactName: profile.mainContact || '',
      contactEmail: '', // Este campo no está en el backend, mantenemos vacío por ahora
      contactPhone: '', // Este campo no está en el backend, mantenemos vacío por ahora
      description: profile.description || '',
      logo: profile.logoUrl ? {
        id: 'current-logo',
        name: 'logo.png',
        size: 0,
        type: 'image/png',
        status: 'success' as const,
        url: profile.logoUrl,
        preview: profile.logoUrl,
      } : undefined,
    };
  };

  /**
   * Guarda los cambios del perfil
   */
  const handleSave: OrganizationProfileFormProps['onSave'] = async (data) => {
    try {
      const userId = auth.user?.id ? Number(auth.user.id) : undefined;
      
      // Transformar datos del formulario al formato del backend
      const updatePayload = {
        businessName: data.companyName,
        industry: data.industry,
        website: data.website,
        address: data.address,
        mainContact: data.contactName,
        description: data.description,
        logoUrl: data.logo?.url || data.logo?.preview || '',
      };

      const updatedProfile = await organizationService.update(userId, updatePayload);
      setOrganizationData(updatedProfile);
      setIsEditing(false);
      
      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios se han guardado correctamente'
      });
    } catch (error: any) {
      toast({
        title: 'Error al guardar',
        description: error.message || 'No se pudieron guardar los cambios',
        variant: 'destructive'
      });
      throw error; // Re-throw para que el componente maneje el estado de loading
    }
  };

  /**
   * Maneja la cancelación de la edición
   */
  const handleCancel = () => {
    setIsEditing(false);
  };

  /**
   * Maneja la navegación de vuelta al dashboard
   */
  const handleBackToDashboard = () => {
    navigate('/organization/dashboard');
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando perfil de la organización...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pudieron cargar los datos
  if (!organizationData) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">No se pudo cargar el perfil de la organización</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  const formData = transformToFormData(organizationData);

  return (
    <div className="container mx-auto p-6 space-y-6 flex flex-col items-center">
      {/* Navegación */}
      <div className="w-full max-w-4xl">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <button
            onClick={handleBackToDashboard}
            className="hover:text-primary transition-colors"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="text-foreground font-medium">Perfil de Organización</span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="w-full max-w-4xl">
        {!isEditing ? (
          /* Vista de solo lectura con opción de editar */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Perfil de Organización</h1>
                <p className="text-muted-foreground">
                  Información actual de tu organización
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Editar Perfil
              </button>
            </div>

            <OrganizationProfileForm
              initialData={formData}
              readOnly={true}
              className="max-w-none"
            />
          </div>
        ) : (
          /* Vista de edición */
          <OrganizationProfileForm
            initialData={formData}
            onSave={handleSave}
            onCancel={handleCancel}
            readOnly={false}
            className="max-w-none"
          />
        )}
      </div>
    </div>
  );
};

export default OrganizationProfilePage;