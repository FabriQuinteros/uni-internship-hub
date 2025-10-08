import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, BookOpen, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HeroButton } from "@/components/ui/button-variants";

interface LocationState {
  from?: string;
}

const UnifiedLoginPage = () => {
  // Estados del componente
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, isAuthenticated, user, isLoading, error, clearError } = useAuth();
  const locationState = location.state as LocationState;

  useEffect(() => {
    // Limpiar errores previos al montar el componente
    clearError();
    
    // Si ya está autenticado, redirigir al dashboard correspondiente
    if (isAuthenticated && user) {
      const from = locationState?.from || getDashboardRoute(user.role);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, clearError]);

  // Función auxiliar para obtener la ruta del dashboard según el rol
  const getDashboardRoute = (role: string) => {
    const dashboardRoutes: Record<string, string> = {
      student: '/student/dashboard',
      organization: '/organization/dashboard',
      admin: '/admin/dashboard'
    };
    
    console.log('🎯 Determining dashboard route for role:', role);
    const route = dashboardRoutes[role] || '/student/dashboard'; // Default a estudiante
    console.log('📍 Redirecting to:', route);
    
    return route;
  };

  // Validaciones del frontend según la documentación del backend
  const validateForm = () => {
    const errors: string[] = [];

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.push('El email es requerido');
    } else if (!emailRegex.test(email)) {
      errors.push('Formato de email inválido');
    }

    // Validar password según especificaciones del backend
    if (!password) {
      errors.push('La contraseña es requerida');
    } else if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    } else if (password.length > 16) {
      errors.push('La contraseña no debe exceder 16 caracteres');
    }

    return errors;
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Limpiar errores previos
    clearError();
    
    // Validar formulario
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      // Aquí podrías mostrar los errores de validación
      console.error('Errores de validación:', validationErrors);
      return;
    }
    
    try {
      const result = await login(email, password);
      
      if (result.success && result.user) {
        // El login fue exitoso, la redirección se maneja automáticamente en el useEffect
        console.log('✅ Login exitoso para usuario:', {
          role: result.user.role,
          email: result.user.email,
          id: result.user.id
        });
        
        // Forzar redirección inmediata si no se maneja en useEffect
        const targetRoute = getDashboardRoute(result.user.role);
        console.log('🔄 Forzando redirección a:', targetRoute);
        navigate(targetRoute, { replace: true });
      }
      // Si hay error, se muestra automáticamente desde el estado del hook
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      // Los errores se manejan automáticamente en el hook useAuth
    }
  };

  // Función para obtener el mensaje de bienvenida basado en la URL
  const getWelcomeMessage = () => {
    const path = location.pathname;
    if (path.includes('organization')) {
      return {
        title: 'Portal de Organizaciones',
        subtitle: 'Accede a tu panel de gestión empresarial'
      };
    }
    return {
      title: 'Portal de Acceso',
      subtitle: 'Ingresa tus credenciales para continuar'
    };
  };

  const welcomeMessage = getWelcomeMessage();

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-white hover:text-white/80 transition-colors">
            <BookOpen className="h-8 w-8" />
            <span className="text-2xl font-bold">PasantíasUNI</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">
            {welcomeMessage.title}
          </h1>
          <p className="text-white/80">
            {welcomeMessage.subtitle}
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-white shadow-hero">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              El sistema determinará automáticamente tu tipo de acceso
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.email@dominio.com"
                  required
                  disabled={isLoading}
                  className="bg-background"
                />
              </div>
              
              {/* Campo Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="bg-background pr-10"
                    minLength={8}
                    maxLength={16}
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

              {/* Mostrar errores si existen */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Recordar sesión y olvido de contraseña */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    disabled={isLoading}
                    className="rounded border-border"
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Recordarme
                  </Label>
                </div>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de login */}
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
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </HeroButton>

              {/* Enlaces de registro */}
              <div className="text-center pt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  ¿No tienes cuenta?
                </p>
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/auth/register/student"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    Registrarse como Estudiante
                  </Link>
                  <Link
                    to="/auth/register-organization"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    Registrar Organización
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="text-center mt-6">
          <p className="text-white/70 text-sm">
            Sistema seguro con autenticación JWT
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoginPage;