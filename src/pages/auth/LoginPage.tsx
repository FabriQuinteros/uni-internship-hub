import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, BookOpen, GraduationCap, Building, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroButton } from "@/components/ui/button-variants";

interface LocationState {
  from?: string;
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const locationState = location.state as LocationState;

  useEffect(() => {
    if (isAuthenticated && user) {
      // Verificar si hay una ruta anterior guardada
      const from = locationState?.from || getDashboardRoute(user.role);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Función auxiliar para obtener la ruta del dashboard según el rol
  const getDashboardRoute = (role: string) => {
    const dashboardRoutes: Record<string, string> = {
      student: '/student/dashboard',
      organization: '/organization/dashboard',
      admin: '/admin/dashboard'
    };
    return dashboardRoutes[role] || '/student/dashboard';
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (err) {
      setError("Credenciales inválidas");
    } finally {
      setIsLoading(false);
    }
  };

  const roleInfo = {
    student: {
      icon: GraduationCap,
      title: "Estudiantes",
      description: "Accede a tu perfil académico y explora oportunidades de pasantías",
      features: ["Gestionar perfil", "Buscar pasantías", "Seguir postulaciones"]
    },
    organization: {
      icon: Building,
      title: "Organizaciones",
      description: "Publica ofertas y conecta con talento universitario",
      features: ["Crear ofertas", "Gestionar candidatos", "Ver estadísticas"]
    },
    admin: {
      icon: Users,
      title: "Administradores",
      description: "Gestiona el ecosistema universitario de pasantías",
      features: ["Aprobar ofertas", "Gestionar usuarios", "Ver métricas"]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-white hover:text-white/80 transition-colors">
            <BookOpen className="h-8 w-8" />
            <span className="text-2xl font-bold">PasantíasUNI</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-white/80">
            Selecciona tu tipo de usuario para acceder al sistema
          </p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          {/* Role Selector */}
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border-white/20">
            {Object.entries(roleInfo).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="data-[state=active]:bg-white data-[state=active]:text-primary text-white/80"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {info.title}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Login Forms */}
          {Object.entries(roleInfo).map(([key, info]) => {
            const Icon = info.icon;
            return (
              <TabsContent key={key} value={key} className="mt-6">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Role Info Card */}
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 rounded-full bg-white/20">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{info.title}</CardTitle>
                          <CardDescription className="text-white/70">
                            {info.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {info.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-secondary" />
                            <span className="text-white/90">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Login Form */}
                  <Card className="bg-white shadow-hero">
                    <CardHeader>
                      <CardTitle className="text-2xl text-center">Bienvenido</CardTitle>
                      <CardDescription className="text-center">
                        Ingresa tus credenciales para continuar
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Correo electrónico</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="estudiante@universidad.edu"
                            required
                            className="bg-background"
                          />
                        </div>
                        
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
                              className="bg-background pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
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

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="remember"
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

                        <HeroButton
                          type="submit"
                          variant="primary"
                          size="default"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                        </HeroButton>

                        {key === 'student' && (
                          <div className="text-center pt-4">
                            <p className="text-sm text-muted-foreground">
                              ¿No tienes cuenta?{" "}
                              <Link
                                to="/auth/register/student"
                                className="text-primary hover:underline font-medium"
                              >
                                Regístrate aquí
                              </Link>
                            </p>
                          </div>
                        )}

                        {key === 'organization' && (
                          <div className="text-center pt-4">
                            <p className="text-sm text-muted-foreground">
                              ¿Primera vez?{" "}
                              <Link
                                to="/auth/register/organization"
                                className="text-primary hover:underline font-medium"
                              >
                                Registrar organización
                              </Link>
                            </p>
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default LoginPage;