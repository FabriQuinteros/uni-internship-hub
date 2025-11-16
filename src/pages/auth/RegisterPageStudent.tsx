import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, BookOpen, ArrowLeft, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { HeroButton } from '@/components/ui/button-variants';
import StudentService from '@/services/studentService';
import { StudentRegisterData } from '@/types/user';

/**
 * Esquema de validación para el formulario de registro de estudiantes
 * Basado en los requerimientos de la API del backend
 */
const registerSchema = z.object({
  email: z.string()
    .email('El formato del email no es válido')
    .min(1, 'El email es requerido'),
  legajo: z.string()
    .min(1, 'El legajo es requerido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z.string()
    .min(1, 'Por favor confirma tu contraseña'),
  first_name: z.string()
    .min(1, 'El nombre es requerido'),
  last_name: z.string()
    .min(1, 'El apellido es requerido'),
  phone: z.string()
    .min(1, 'El teléfono es requerido')
    .regex(/^[+]?[(]?[0-9\s\-()]{8,}$/, 'El formato del teléfono no es válido'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPageStudent = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      legajo: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      phone: '',
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      // Preparar datos para enviar a la API (sin confirmPassword)
      const studentData: StudentRegisterData = {
        email: data.email,
        password: data.password,
        legajo: data.legajo,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
      };

      const result = await StudentService.register(studentData);
      
      if (result.available) {
        // Registro exitoso
        toast({
          title: "Registro exitoso",
          description: result.message,
        });
        navigate('/auth/login');
      } else {
        // Error de registro (duplicados o validaciones)
        // Mostrar el error específico según el mensaje del backend
        if (result.message.toLowerCase().includes('email')) {
          setError('email', { message: result.message });
        } else if (result.message.toLowerCase().includes('legajo')) {
          setError('legajo', { message: result.message });
        } else if (result.message.toLowerCase().includes('phone') || result.message.toLowerCase().includes('teléfono')) {
          setError('phone', { message: result.message });
        } else {
          toast({
            title: "Error en el registro",
            description: result.message,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('Error en el registro:', error);
      toast({
        title: "Error en el registro",
        description: "Ha ocurrido un error. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">PasantíasUNI</span>
          </Link>
          <Link to="/auth/login">
            <HeroButton variant="secondary" className="text-secondary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al login
            </HeroButton>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <GraduationCap className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Registro de Estudiante
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Únete a nuestra plataforma y encuentra las mejores oportunidades de pasantías
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="relative overflow-hidden shadow-hero">
              <div className="absolute inset-0 bg-gradient-card opacity-50" />
              <CardHeader className="relative">
                <CardTitle className="text-2xl text-foreground">
                  Información del Estudiante
                </CardTitle>
                <CardDescription className="text-base">
                  Complete el formulario con tus datos académicos
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-foreground">
                        Nombre <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        {...register('first_name')}
                        className={`bg-background/50 border-muted-foreground/20 ${errors.first_name ? 'border-destructive' : ''}`}
                        placeholder="Tu nombre"
                      />
                      {errors.first_name && (
                        <p className="text-sm text-red-500">{errors.first_name.message}</p>
                      )}
                    </div>

                    {/* Apellido */}
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-foreground">
                        Apellido <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="last_name"
                        {...register('last_name')}
                        className={`bg-background/50 border-muted-foreground/20 ${errors.last_name ? 'border-destructive' : ''}`}
                        placeholder="Tu apellido"
                      />
                      {errors.last_name && (
                        <p className="text-sm text-red-500">{errors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        className={`bg-background/50 border-muted-foreground/20 ${errors.email ? 'border-destructive' : ''}`}
                        placeholder="estudiante@universidad.edu"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Legajo */}
                    <div className="space-y-2">
                      <Label htmlFor="legajo" className="text-foreground">
                        Legajo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="legajo"
                        {...register('legajo')}
                        className={`bg-background/50 border-muted-foreground/20 ${errors.legajo ? 'border-destructive' : ''}`}
                        placeholder="Número de legajo"
                      />
                      {errors.legajo && (
                        <p className="text-sm text-red-500">{errors.legajo.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">
                      Teléfono <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      className={`bg-background/50 border-muted-foreground/20 ${errors.phone ? 'border-destructive' : ''}`}
                      placeholder="+54 11 1234-5678"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Contraseña */}
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

                    {/* Confirmar Contraseña */}
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
                  </div>

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

                <div className="text-center pt-6">
                  <p className="text-sm text-muted-foreground">
                    ¿Ya tienes cuenta?{" "}
                    <Link
                      to="/auth/login"
                      className="text-primary hover:underline font-medium"
                    >
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
};

export default RegisterPageStudent;