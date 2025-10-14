import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, User, Phone, Mail, MapPin, GraduationCap, Briefcase, Clock, AlertCircle } from 'lucide-react';
import { useStudentProfile } from '@/store/studentProfileStore';
import { catalogService, availabilityService } from '@/services/catalogService';
import { Location, Availability } from '@/types/catalog';
import { UpdateStudentProfileRequest } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

// Schema de validación con Zod
const studentProfileSchema = z.object({
  legajo: z.string()
    .min(1, 'El legajo es requerido')
    .max(20, 'El legajo no puede exceder 20 caracteres'),
  first_name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  last_name: z.string()
    .min(1, 'El apellido es requerido')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  phone: z.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  preferred_contact: z.enum(['email', 'phone'], {
    required_error: 'Debe seleccionar un método de contacto preferido'
  }),
  location_id: z.number({
    required_error: 'La ubicación es requerida'
  }),
  academic_formation: z.string()
    .min(1, 'La formación académica es requerida'),
  previous_experience: z.string()
    .optional()
    .or(z.literal('')),
  availability_id: z.number({
    required_error: 'La disponibilidad es requerida'
  })
});

type StudentProfileFormData = z.infer<typeof studentProfileSchema>;

interface StudentProfileFormProps {
  onSave?: (data: UpdateStudentProfileRequest) => void;
  onCancel?: () => void;
  showActions?: boolean;
  className?: string;
}

export const StudentProfileForm: React.FC<StudentProfileFormProps> = ({
  onSave,
  onCancel,
  showActions = true,
  className = ''
}) => {
  const { toast } = useToast();
  const {
    profile,
    loading,
    error,
    updateProfile,
    clearError,
    setUnsavedChanges,
    hasUnsavedChanges
  } = useStudentProfile();

  // Estado para catálogos
  const [locations, setLocations] = useState<Location[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  // Configurar formulario
  const form = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      legajo: '',
      first_name: '',
      last_name: '',
      phone: '',
      preferred_contact: 'email',
      location_id: undefined,
      academic_formation: '',
      previous_experience: '',
      availability_id: undefined
    }
  });

  const { handleSubmit, reset, formState: { isDirty, isSubmitting }, watch } = form;

  // Cargar catálogos al montar
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setLoadingCatalogs(true);
        
        // Cargar catálogos en paralelo
        const [locationsData, availabilitiesData] = await Promise.all([
          catalogService.list<Location>('locations'),
          availabilityService.list()
        ]);
        
        setLocations(locationsData.filter(loc => loc.is_active));
        setAvailabilities(availabilitiesData.filter(avail => avail.is_active));
      } catch (error) {
        console.error('Error cargando catálogos:', error);
        toast({
          title: 'Advertencia',
          description: 'No se pudieron cargar algunos catálogos.',
          variant: 'default'
        });
      } finally {
        setLoadingCatalogs(false);
      }
    };

    loadCatalogs();
  }, [toast]);

  // Llenar formulario cuando se carga el perfil
  useEffect(() => {
    if (profile) {
      reset({
        legajo: profile.legajo || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        preferred_contact: profile.preferred_contact || 'email',
        location_id: profile.location_id || undefined,
        academic_formation: profile.academic_formation || '',
        previous_experience: profile.previous_experience || '',
        availability_id: profile.availability_id || undefined
      });
    }
  }, [profile, reset]);

  // Detectar cambios no guardados
  useEffect(() => {
    setUnsavedChanges(isDirty);
  }, [isDirty, setUnsavedChanges]);

  // Limpiar errores cuando el usuario empiece a escribir
  useEffect(() => {
    const subscription = watch(() => {
      if (error) {
        clearError();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, error, clearError]);

  // Manejar envío del formulario
  const onSubmit = async (data: StudentProfileFormData) => {
    try {
      // Preparar datos para envío
      const cleanData: UpdateStudentProfileRequest = {
        legajo: data.legajo,
        first_name: data.first_name,
        last_name: data.last_name,
        preferred_contact: data.preferred_contact,
        phone: data.phone || undefined,
        location_id: data.location_id!,  // Requerido
        academic_formation: data.academic_formation,  // Requerido
        previous_experience: data.previous_experience || undefined,
        availability_id: data.availability_id!  // Requerido
      };

      await updateProfile(cleanData);
      
      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil se ha actualizado correctamente.',
        variant: 'default'
      });

      if (onSave) {
        onSave(cleanData);
      }
    } catch (error: any) {
      console.error('Error al guardar perfil:', error);
      
      // El error ya se maneja en el store, aquí solo mostramos toast
      toast({
        title: 'Error al guardar',
        description: error.message || 'Ocurrió un error al actualizar el perfil.',
        variant: 'destructive'
      });
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    if (profile) {
      reset({
        legajo: profile.legajo || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        preferred_contact: profile.preferred_contact || 'email',
        location_id: profile.location_id || undefined,
        academic_formation: profile.academic_formation || '',
        previous_experience: profile.previous_experience || '',
        availability_id: profile.availability_id || undefined
      });
    }
    
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Datos básicos de identificación. Los campos marcados con * son obligatorios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Legajo */}
              <FormField
                control={form.control}
                name="legajo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Legajo *
                      <Badge variant="secondary" className="ml-2">Único</Badge>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: EST001" 
                        {...field}
                        disabled={loading || isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Identificación única del estudiante (máximo 20 caracteres)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Juan" 
                          {...field}
                          disabled={loading || isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Pérez" 
                          {...field}
                          disabled={loading || isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
              <CardDescription>
                Datos de contacto y preferencias de comunicación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Teléfono */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: +5491112345678" 
                        {...field}
                        disabled={loading || isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Incluir código de país. Máximo 20 caracteres.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Método de contacto preferido */}
              <FormField
                control={form.control}
                name="preferred_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de contacto preferido *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex items-center space-x-6"
                        disabled={loading || isSubmitting}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="email" />
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="phone" />
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Teléfono
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      {loadingCatalogs ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          <span className="text-sm text-gray-500">Cargando ubicaciones disponibles...</span>
                        </div>
                      ) : locations.length > 0 ? (
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value ? parseInt(value) : null);
                          }} 
                          value={field.value?.toString() || ''}
                          disabled={loading || isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar ubicación" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location.id} value={location.id.toString()}>
                                <div>
                                  {location.name}, {location.province}
                                  <div className="text-xs text-gray-500">{location.country}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No se pudieron cargar las ubicaciones disponibles. Contacte al administrador.
                          </AlertDescription>
                        </Alert>
                      )}
                    </FormControl>
                    <FormDescription>
                      {locations.length > 0 
                        ? 'Selecciona tu ubicación del catálogo disponible.'
                        : 'Las ubicaciones no están disponibles en este momento.'
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Información Académica y Profesional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Formación y Experiencia
              </CardTitle>
              <CardDescription>
                Información sobre tu formación académica y experiencia laboral.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formación académica */}
              <FormField
                control={form.control}
                name="academic_formation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Formación Académica
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ej: Ingeniería en Sistemas - Universidad Nacional de Córdoba"
                        className="min-h-[80px]"
                        {...field}
                        disabled={loading || isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe tu formación académica (carrera, universidad, estado).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experiencia previa */}
              <FormField
                control={form.control}
                name="previous_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Experiencia Laboral Previa
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ej: Desarrollador Frontend Junior en Empresa XYZ (6 meses)"
                        className="min-h-[80px]"
                        {...field}
                        disabled={loading || isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe tu experiencia laboral relevante (opcional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="availability_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidad de Disponibilidad</FormLabel>
                    <FormControl>
                      {loadingCatalogs ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          <span className="text-sm text-gray-500">Cargando modalidades disponibles...</span>
                        </div>
                      ) : availabilities.length > 0 ? (
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value ? parseInt(value) : null);
                          }} 
                          value={field.value?.toString() || ''}
                          disabled={loading || isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar modalidad de disponibilidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {availabilities.map((availability) => (
                              <SelectItem key={availability.id} value={availability.id.toString()}>
                                <div>
                                  {availability.name}
                                  {availability.description && (
                                    <div className="text-xs text-gray-500 mt-1">{availability.description}</div>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No se pudieron cargar las modalidades de disponibilidad. Contacte al administrador.
                          </AlertDescription>
                        </Alert>
                      )}
                    </FormControl>
                    <FormDescription>
                      {availabilities.length > 0 
                        ? 'Selecciona tu modalidad de disponibilidad del catálogo.'
                        : 'Las modalidades no están disponibles en este momento.'
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Mostrar errores */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Acciones */}
          {showActions && (
            <>
              <Separator />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading || isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || isSubmitting || !isDirty}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  );
};