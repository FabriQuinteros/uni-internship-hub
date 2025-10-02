import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganizationProfileForm, type OrganizationProfileFormProps } from '@/components/forms/OrganizationProfileForm';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { type UploadedFile } from '@/components/upload/FileUploadManager';

/**
 * Datos de ejemplo para demostración
 * En producción, estos datos vendrían de una API
 */
const MOCK_ORGANIZATION_DATA = {
  companyName: 'TechCorp Solutions S.A.',
  industry: 'technology',
  website: 'https://www.techcorp.com',
  address: 'Av. Corrientes 1234, Buenos Aires, Argentina',
  contactName: 'María García',
  contactEmail: 'maria.garcia@techcorp.com',
  contactPhone: '+54 11 4567-8900',
  description: 'Somos una empresa líder en desarrollo de software y soluciones tecnológicas innovadoras. Nos especializamos en crear aplicaciones web y móviles de alta calidad para empresas de todos los tamaños. Nuestro equipo está compuesto por profesionales experimentados en las últimas tecnologías del mercado.',
  logo: {
    id: 'logo-current',
    name: 'techcorp-logo.png',
    size: 125000,
    type: 'image/png',
    status: 'success' as const,
    preview: '/api/placeholder/200/200',
  },
};

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

  /**
   * Simula el guardado de datos del perfil
   * En producción, esto haría una llamada a la API
   */
  const handleSave: OrganizationProfileFormProps['onSave'] = async (data) => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Datos guardados:', data);
    
    // En producción, aquí se haría la llamada a la API
    // await updateOrganizationProfile(data);
    
    setIsEditing(false);
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
    navigate('/dashboard/organization');
  };

  return (
    <DashboardLayout userRole="organization">
      <div className="container mx-auto p-6 space-y-6">
        {/* Navegación */}
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

        {/* Contenido principal */}
        <div className="max-w-4xl">
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
                initialData={MOCK_ORGANIZATION_DATA}
                readOnly={true}
                className="max-w-none"
              />
            </div>
          ) : (
            /* Vista de edición */
            <OrganizationProfileForm
              initialData={MOCK_ORGANIZATION_DATA}
              onSave={handleSave}
              onCancel={handleCancel}
              readOnly={false}
              className="max-w-none"
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizationProfilePage;