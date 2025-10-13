import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { organizationService } from '@/services/organizationService';
import { HeroButton } from '../ui/button-variants';

/**
 * @fileoverview Componente de formulario para el registro de organizaciones
 * Este componente implementa un formulario completo con validaciones client-side
 * para el registro de nuevas organizaciones en el sistema de pasantías.
 * 
 * Características principales:
 * - Validación en tiempo real con Zod
 * - Gestión de estado del formulario con React Hook Form
 * - Feedback visual inmediato de errores
 * - Integración con el sistema de notificaciones toast
 * - Manejo de estados de carga y redirección post-registro
 */

/**
 * Esquema de validación para el formulario de registro
 * Define las reglas de validación para cada campo utilizando Zod
 * 
 * Validaciones implementadas:
 * - Email: formato válido y campo requerido
 * - Contraseña: mínimo 8 caracteres, mayúscula, minúscula y número
 * - Confirmación de contraseña: debe coincidir
 * - Campos obligatorios marcados y validados
 * - URL del sitio web opcional pero debe ser válida si se proporciona
 */
const registerSchema = z.object({
  email: z.string()
    .email('El formato del email no es válido')
    .min(1, 'El email es requerido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z.string()
    .min(1, 'Por favor confirma tu contraseña'),
  companyName: z.string()
    .min(1, 'El nombre de la empresa es requerido'),
  industry: z.string()
    .min(1, 'El rubro es requerido'),
  website: z.string()
    .url('El formato de la URL no es válido')
    .optional()
    .or(z.literal('')),
  description: z.string()
    .min(20, 'La descripción debe tener al menos 20 caracteres'),
  address: z.string()
    .min(1, 'La dirección es requerida'),
  contactName: z.string()
    .min(1, 'El nombre de contacto es requerido'),
  contactPhone: z.string()
    .min(1, 'El teléfono de contacto es requerido')
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}$/, 'El formato del teléfono no es válido'),
  termsAccepted: z.boolean()
    .refine((val) => val === true, 'Debes aceptar los términos y condiciones'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Tipos inferidos del esquema
type RegisterFormData = z.infer<typeof registerSchema>;

// Lista de industrias predefinidas
const industries = [
  'Tecnología',
  'Salud',
  'Educación',
  'Finanzas',
  'Manufactura',
  'Comercio',
  'Servicios',
  'Otro'
];

/**
 * Componente principal del formulario de registro de organizaciones
 * 
 * Este componente maneja:
 * - Estado del formulario y validaciones
 * - Visibilidad de contraseñas
 * - Estado de envío del formulario
 * - Notificaciones al usuario
 * - Redirección post-registro
 * 
 * @returns {JSX.Element} Formulario de registro con validaciones y feedback
 */
export function OrganizationRegisterForm() {
  // Estados para controlar la visibilidad de las contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Estado para el proceso de envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Hooks para notificaciones y navegación
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      industry: '',
      website: '',
      description: '',
      address: '',
      contactName: '',
      contactPhone: '',
      termsAccepted: false
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        industry: data.industry,
        website: data.website,
        description: data.description,
        address: data.address,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
      };

      const result = await organizationService.register(payload as any);

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta será revisada por un administrador",
      });

      navigate('/auth/confirmation');
    } catch (error: any) {
      console.error('Error en el registro:', error);
      toast({
        title: "Error en el registro",
        description: error.message || "Ha ocurrido un error. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={`bg-background/50 border-muted-foreground/20 ${errors.email ? 'border-destructive' : ''}`}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Contraseña <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirmar Contraseña <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">
          Nombre de la Empresa <span className="text-red-500">*</span>
        </Label>
        <Input
          id="companyName"
          {...register('companyName')}
          className={errors.companyName ? 'border-red-500' : ''}
        />
        {errors.companyName && (
          <p className="text-sm text-red-500">{errors.companyName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">
          Industria <span className="text-red-500">*</span>
        </Label>
        <Select 
          defaultValue={watch('industry')}
          onValueChange={(value) => {
            setValue('industry', value, {
              shouldValidate: true,
              shouldDirty: true
            });
          }}
        >
          <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecciona una industria" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.industry && (
          <p className="text-sm text-red-500">{errors.industry.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">
          Sitio Web
        </Label>
        <Input
          id="website"
          type="url"
          {...register('website')}
          className={errors.website ? 'border-red-500' : ''}
          placeholder="https://www.ejemplo.com"
        />
        {errors.website && (
          <p className="text-sm text-red-500">{errors.website.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Descripción <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          className={errors.description ? 'border-red-500' : ''}
          placeholder="Describe brevemente tu empresa..."
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          Dirección <span className="text-red-500">*</span>
        </Label>
        <Input
          id="address"
          {...register('address')}
          className={errors.address ? 'border-red-500' : ''}
        />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactName">
          Nombre de Contacto <span className="text-red-500">*</span>
        </Label>
        <Input
          id="contactName"
          {...register('contactName')}
          className={errors.contactName ? 'border-red-500' : ''}
        />
        {errors.contactName && (
          <p className="text-sm text-red-500">{errors.contactName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPhone">
          Teléfono de Contacto <span className="text-red-500">*</span>
        </Label>
        <Input
          id="contactPhone"
          {...register('contactPhone')}
          className={errors.contactPhone ? 'border-red-500' : ''}
          placeholder="+1234567890"
        />
        {errors.contactPhone && (
          <p className="text-sm text-red-500">{errors.contactPhone.message}</p>
        )}
      </div>
      {/* Cierre del grid container */}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="termsAccepted"
          {...register('termsAccepted')}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="termsAccepted">
          Acepto los términos y condiciones <span className="text-red-500">*</span>
        </Label>
      </div>
      {errors.termsAccepted && (
        <p className="text-sm text-red-500">{errors.termsAccepted.message}</p>
      )}

      <div className="pt-6">
        <HeroButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full text-lg shadow-floating hover:shadow-floating-hover transition-all duration-300"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Registrando...
            </>
          ) : (
            'Completar Registro'
          )}
        </HeroButton>
      </div>
    </form>
  );
}

export default OrganizationRegisterForm;
