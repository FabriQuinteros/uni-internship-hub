import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HeroButton } from "@/components/ui/button-variants";
import { StudentService } from "@/services/studentService";

const ForgotPasswordPage = () => {
  // Estados del componente
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Validación del email
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return 'El email es requerido';
    }
    
    if (!emailRegex.test(email)) {
      return 'Formato de email inválido';
    }
    
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Limpiar errores previos
    setError("");
    
    // Validar email
    const validationError = validateEmail();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Llamar al servicio para solicitar el reseteo de contraseña
      await StudentService.forcePasswordReset(email);
      
      // Mostrar pantalla de éxito
      setSuccess(true);
    } catch (err: any) {
      // Mostrar error genérico por seguridad (no revelar si el email existe o no)
      setError("Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  // Si el envío fue exitoso, mostrar mensaje de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡Correo Enviado!</CardTitle>
            <CardDescription>
              Revisa tu bandeja de entrada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="mb-2">
                Si el correo <strong className="text-foreground">{email}</strong> está registrado en nuestro sistema,
                recibirás un enlace para restablecer tu contraseña.
              </p>
              <p className="text-xs">
                El enlace expirará en 1 hora por seguridad.
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">¿No recibiste el correo?</p>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                <li>Revisa tu carpeta de spam o correo no deseado</li>
                <li>Verifica que el correo esté escrito correctamente</li>
                <li>Espera unos minutos, puede tardar en llegar</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button
                variant="default"
                className="w-full"
                onClick={() => navigate('/auth/login')}
              >
                Volver al inicio de sesión
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
              >
                Enviar a otro correo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Card principal */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-2 pb-8">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ¿Olvidaste tu Contraseña?
            </CardTitle>
            <CardDescription className="text-base">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu-email@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                    required
                    autoFocus
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Información de seguridad */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <p className="font-semibold mb-1">🔒 Proceso seguro</p>
                <p>
                  Te enviaremos un enlace de un solo uso a tu correo. 
                  El enlace expirará en 1 hora por seguridad.
                </p>
              </div>

              {/* Mostrar error si existe */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Botón de enviar */}
              <HeroButton
                type="submit"
                variant="primary"
                size="default"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enviando enlace...</span>
                  </div>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Enlace de Restablecimiento
                  </>
                )}
              </HeroButton>

              {/* Enlace de regreso al login */}
              <div className="text-center pt-4">
                <Link
                  to="/auth/login"
                  className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            ¿No tienes una cuenta?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/auth/register/student"
              className="text-primary hover:underline font-medium text-sm"
            >
              Registrarse como Estudiante
            </Link>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Link
              to="/auth/register-organization"
              className="text-primary hover:underline font-medium text-sm"
            >
              Registrar Organización
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
