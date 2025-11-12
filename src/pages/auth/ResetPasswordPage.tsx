import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HeroButton } from "@/components/ui/button-variants";
import { authService } from "@/services/authService";

const ResetPasswordPage = () => {
  // Estados del componente
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    // Verificar que existe el token
    if (!token) {
      setError("Token de reseteo no válido o expirado");
    }
  }, [token]);

  // Validaciones del frontend según la documentación del backend
  const validateForm = () => {
    const errors: string[] = [];

    // Validar password según especificaciones del backend (8-16 caracteres)
    if (!password) {
      errors.push('La contraseña es requerida');
    } else if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    } else if (password.length > 16) {
      errors.push('La contraseña no debe exceder 16 caracteres');
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }

    // Validación adicional de complejidad
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      errors.push('La contraseña debe contener al menos una mayúscula, una minúscula y un número');
    }

    return errors;
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Limpiar errores previos
    setError("");
    setValidationErrors([]);
    
    // Validar token
    if (!token) {
      setError("Token de reseteo no válido o expirado");
      return;
    }
    
    // Validar formulario
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await authService.resetPassword(token, password);
      
      if (result.success) {
        setSuccess(true);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/auth/login', { 
            state: { message: 'Contraseña actualizada exitosamente. Por favor, inicia sesión.' } 
          });
        }, 3000);
      } else {
        setError(result.message || "Error al resetear la contraseña");
      }
    } catch (err: any) {
      setError(err.message || "Error de conexión. Por favor, intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Si el reseteo fue exitoso, mostrar mensaje de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡Contraseña Actualizada!</CardTitle>
            <CardDescription>
              Tu contraseña ha sido actualizada exitosamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Serás redirigido al inicio de sesión en unos momentos...
            </p>
            <Button
              variant="default"
              className="w-full"
              onClick={() => navigate('/auth/login')}
            >
              Ir al inicio de sesión
            </Button>
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
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Restablecer Contraseña
            </CardTitle>
            <CardDescription className="text-base">
              Ingresa tu nueva contraseña
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Campo de nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Campo de confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Requisitos de contraseña */}
              <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
                <p className="font-semibold text-muted-foreground">Requisitos de la contraseña:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                  <li>Entre 8 y 16 caracteres</li>
                  <li>Al menos una letra mayúscula</li>
                  <li>Al menos una letra minúscula</li>
                  <li>Al menos un número</li>
                </ul>
              </div>

              {/* Mostrar errores de validación */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Mostrar errores del servidor */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Botón de resetear contraseña */}
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
                    <span>Actualizando contraseña...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Restablecer Contraseña
                  </>
                )}
              </HeroButton>

              {/* Enlace de regreso al login */}
              <div className="text-center pt-4">
                <Link
                  to="/auth/login"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            Sistema seguro con autenticación JWT
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
