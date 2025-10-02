import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, MapPin, Globe, Users, FileText, Camera, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FileUploadManager, type UploadedFile } from '@/components/upload/FileUploadManager';

/**
 * Schema de validación para el formulario de perfil de organización
 * Define las reglas de validación para cada campo del perfil
 */
const profileSchema = z.object({
  companyName: z.string()
    .min(2, 'La razón social debe tener al menos 2 caracteres')
    .max(100, 'La razón social no puede exceder 100 caracteres'),
  industry: z.string()
    .min(1, 'Debe seleccionar un rubro/industria'),
  website: z.string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  contactName: z.string()
    .min(2, 'El nombre de contacto debe tener al menos 2 caracteres')
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres'),
  contactEmail: z.string()
    .email('Debe ser un email válido'),
  contactPhone: z.string()
    .min(8, 'El teléfono debe tener al menos 8 caracteres')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido'),
  description: z.string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
});

/**
 * Tipo de datos del formulario
 */
type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Opciones de industrias/rubros disponibles
 */
const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Tecnología e Informática' },
  { value: 'finance', label: 'Finanzas y Banca' },
  { value: 'healthcare', label: 'Salud y Medicina' },
  { value: 'education', label: 'Educación' },
  { value: 'manufacturing', label: 'Manufactura e Industria' },
  { value: 'retail', label: 'Comercio y Retail' },
  { value: 'consulting', label: 'Consultoría' },
  { value: 'marketing', label: 'Marketing y Publicidad' },
  { value: 'construction', label: 'Construcción' },
  { value: 'transportation', label: 'Transporte y Logística' },
  { value: 'energy', label: 'Energía y Servicios Públicos' },
  { value: 'entertainment', label: 'Entretenimiento y Medios' },
  { value: 'agriculture', label: 'Agricultura' },
  { value: 'nonprofit', label: 'Organizaciones sin fines de lucro' },
  { value: 'government', label: 'Sector Público' },
  { value: 'other', label: 'Otro' },
];

/**
 * Props del componente OrganizationProfileForm
 */
export interface OrganizationProfileFormProps {
  /** Datos iniciales del perfil para modo edición */
  initialData?: Partial<ProfileFormData & { logo?: UploadedFile }>;
  /** Función que se ejecuta al guardar el perfil */
  onSave?: (data: ProfileFormData & { logo?: UploadedFile }) => Promise<void>;
  /** Función que se ejecuta al cancelar */
  onCancel?: () => void;
  /** Si el formulario está en modo solo lectura */
  readOnly?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente de formulario para editar el perfil de una organización
 * 
 * Características:
 * - Validación en tiempo real con Zod
 * - Upload de logo con preview
 * - Campos organizados en secciones lógicas
 * - Estados de carga y feedback visual
 * - Modo edición y solo lectura
 */
export const OrganizationProfileForm: React.FC<OrganizationProfileFormProps> = ({
  initialData,
  onSave,
  onCancel,
  readOnly = false,
  className = '',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFiles, setLogoFiles] = useState<UploadedFile[]>(
    initialData?.logo ? [initialData.logo] : []
  );
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      companyName: initialData?.companyName || '',
      industry: initialData?.industry || '',
      website: initialData?.website || '',
      address: initialData?.address || '',
      contactName: initialData?.contactName || '',
      contactEmail: initialData?.contactEmail || '',
      contactPhone: initialData?.contactPhone || '',
      description: initialData?.description || '',
    },
  });

  /**
   * Maneja la subida del logo
   */
  const handleLogoUpload = async (files: File[]): Promise<UploadedFile[]> => {
    const file = files[0]; // Solo permitimos un logo
    
    // Simular upload (en producción sería una llamada a la API)
    return new Promise((resolve) => {
      setTimeout(() => {
        const uploadedFile: UploadedFile = {
          id: `logo-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'success',
          preview: URL.createObjectURL(file),
        };
        
        setLogoFiles([uploadedFile]);
        resolve([uploadedFile]);
      }, 1000);
    });
  };

  /**
   * Maneja la eliminación del logo
   */
  const handleLogoRemove = (fileId: string) => {
    setLogoFiles([]);
  };

  /**
   * Maneja el envío del formulario
   */
  const handleFormSubmit = async (data: ProfileFormData) => {
    if (!onSave) return;

    setIsSubmitting(true);
    try {
      const formData = {
        ...data,
        logo: logoFiles[0] || undefined,
      };

      await onSave(formData);
      
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfil de Organización</h1>
          <p className="text-muted-foreground">
            Gestiona la información de tu organización y mantén tu perfil actualizado
          </p>
        </div>
        {readOnly && (
          <Badge variant="secondary" className="bg-muted">
            Solo lectura
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Sección: Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Información Básica</span>
            </CardTitle>
            <CardDescription>
              Datos principales de identificación de tu organización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Razón Social */}
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Razón Social <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  {...register('companyName')}
                  placeholder="Nombre oficial de la organización"
                  className={errors.companyName ? 'border-destructive' : ''}
                  disabled={readOnly}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName.message}</p>
                )}
              </div>

              {/* Rubro/Industria */}
              <div className="space-y-2">
                <Label htmlFor="industry">
                  Rubro/Industria <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch('industry')}
                  onValueChange={(value) => setValue('industry', value, { shouldValidate: true })}
                  disabled={readOnly}
                >
                  <SelectTrigger className={errors.industry ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Seleccionar rubro" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-destructive">{errors.industry.message}</p>
                )}
              </div>

              {/* Sitio Web */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website" className="flex items-center space-x-1">
                  <Globe className="h-4 w-4" />
                  <span>Sitio Web</span>
                </Label>
                <Input
                  id="website"
                  type="url"
                  {...register('website')}
                  placeholder="https://www.ejemplo.com"
                  className={errors.website ? 'border-destructive' : ''}
                  disabled={readOnly}
                />
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección: Ubicación y Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Ubicación y Contacto</span>
            </CardTitle>
            <CardDescription>
              Información de contacto y ubicación física
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="address">
                Dirección <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Dirección completa de la organización"
                className={errors.address ? 'border-destructive' : ''}
                disabled={readOnly}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Contacto Principal */}
              <div className="space-y-2">
                <Label htmlFor="contactName">
                  Contacto Principal <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactName"
                  {...register('contactName')}
                  placeholder="Nombre completo"
                  className={errors.contactName ? 'border-destructive' : ''}
                  disabled={readOnly}
                />
                {errors.contactName && (
                  <p className="text-sm text-destructive">{errors.contactName.message}</p>
                )}
              </div>

              {/* Email de Contacto */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  Email de Contacto <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register('contactEmail')}
                  placeholder="contacto@empresa.com"
                  className={errors.contactEmail ? 'border-destructive' : ''}
                  disabled={readOnly}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="contactPhone">
                  Teléfono <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  {...register('contactPhone')}
                  placeholder="+54 11 1234-5678"
                  className={errors.contactPhone ? 'border-destructive' : ''}
                  disabled={readOnly}
                />
                {errors.contactPhone && (
                  <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección: Descripción y Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Descripción y Logo</span>
            </CardTitle>
            <CardDescription>
              Información adicional y elementos visuales de tu organización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe tu organización, su misión, valores y actividades principales..."
                className={errors.description ? 'border-destructive' : ''}
                rows={5}
                disabled={readOnly}
              />
              <p className="text-xs text-muted-foreground">
                {watch('description')?.length || 0}/1000 caracteres
              </p>
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Logo de la Organización</span>
              </Label>
              {!readOnly ? (
                <FileUploadManager
                  onUpload={handleLogoUpload}
                  uploadedFiles={logoFiles}
                  onRemove={handleLogoRemove}
                  multiple={false}
                  validation={{
                    maxFiles: 1,
                    maxSize: 5 * 1024 * 1024, // 5MB
                    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
                    acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
                  }}
                  title="Subir Logo"
                  description="Arrastra una imagen aquí o haz clic para seleccionar"
                  className="max-w-md"
                />
              ) : (
                logoFiles.length > 0 && (
                  <div className="flex items-center space-x-2 p-2 border rounded-md max-w-md">
                    <img
                      src={logoFiles[0].preview || logoFiles[0].url}
                      alt="Logo de la organización"
                      className="h-16 w-16 object-cover rounded"
                    />
                    <div>
                      <p className="text-sm font-medium">{logoFiles[0].name}</p>
                      <p className="text-xs text-muted-foreground">
                        {logoFiles[0].size && (logoFiles[0].size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        {!readOnly && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-end space-x-4">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="min-w-[140px]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>

              {isDirty && (
                <Alert className="mt-4">
                  <AlertDescription>
                    Tienes cambios sin guardar. Asegúrate de guardar antes de salir.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};

export default OrganizationProfileForm;