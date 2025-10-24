import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HeroButton } from "@/components/ui/button-variants";
import { 
  User, 
  FileText, 
  CheckCircle, 
  Clock,
  Award,
  BookOpen,
  Search,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStudentProfile } from "@/hooks/use-student-profile";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, error, fetchProfile } = useStudentProfile();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Calcular completitud del perfil basado en campos reales
  const calculateProfileCompleteness = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.first_name,
      profile.last_name,
      profile.legajo,
      profile.phone,
      profile.location_id,
      profile.academic_formation,
      profile.availability_id
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const profileCompleteness = calculateProfileCompleteness();
  
  // Determinar campos faltantes
  const getMissingFields = () => {
    if (!profile) return [];
    const missing = [];
    
    if (!profile.academic_formation) missing.push("Formación académica");
    if (!profile.location_id) missing.push("Ubicación");
    if (!profile.phone) missing.push("Teléfono");
    if (!profile.availability_id) missing.push("Disponibilidad");
    
    return missing;
  };  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-hero rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Cargando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              ¡Bienvenido/a{profile?.first_name ? `, ${profile.first_name}` : ''}!
            </h1>
            <p className="text-white/80">
              Explora las ofertas disponibles y completa tu perfil para mejorar tu visibilidad
            </p>
          </div>
          <div className="hidden md:block">
            <BookOpen className="h-16 w-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Completion */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Completar Perfil</span>
            </CardTitle>
            <CardDescription>
              Mejora tu visibilidad ante las organizaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso</span>
                <span className="font-medium">{profileCompleteness}%</span>
              </div>
              <Progress value={profileCompleteness} className="h-2" />
            </div>
            
            <div className="space-y-2">
              {/* Información básica siempre presente */}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Información básica</span>
                </span>
                <Badge variant="secondary" className="bg-success/10 text-success">Completo</Badge>
              </div>
              
              {/* Formación académica */}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-2">
                  {profile?.academic_formation ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Clock className="h-4 w-4 text-warning" />
                  )}
                  <span>Formación académica</span>
                </span>
                <Badge 
                  variant="secondary" 
                  className={profile?.academic_formation ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}
                >
                  {profile?.academic_formation ? "Completo" : "Pendiente"}
                </Badge>
              </div>
              
              {/* Ubicación */}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-2">
                  {profile?.location_id ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Clock className="h-4 w-4 text-warning" />
                  )}
                  <span>Ubicación</span>
                </span>
                <Badge 
                  variant="secondary" 
                  className={profile?.location_id ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}
                >
                  {profile?.location_id ? "Completo" : "Pendiente"}
                </Badge>
              </div>

              {/* Disponibilidad */}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-2">
                  {profile?.availability_id ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Clock className="h-4 w-4 text-warning" />
                  )}
                  <span>Disponibilidad</span>
                </span>
                <Badge 
                  variant="secondary" 
                  className={profile?.availability_id ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}
                >
                  {profile?.availability_id ? "Completo" : "Pendiente"}
                </Badge>
              </div>
            </div>

            <HeroButton 
              variant="primary" 
              size="default" 
              className="w-full"
              onClick={() => navigate('/student/profile')}
            >
              {profileCompleteness === 100 ? "Ver Perfil" : "Completar Perfil"}
            </HeroButton>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Acciones Rápidas</span>
            </CardTitle>
            <CardDescription>
              Explora ofertas y gestiona tu perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <HeroButton 
              variant="primary" 
              className="w-full h-12 flex items-center justify-center"
              onClick={() => navigate('/student/offers')}
            >
              <Search className="mr-2 h-4 w-4" />
              Explorar Ofertas
            </HeroButton>
            
            <HeroButton 
              variant="secondary" 
              className="w-full h-12 flex items-center justify-center"
              onClick={() => navigate('/student/profile')}
            >
              <User className="mr-2 h-4 w-4" />
              Editar Perfil
            </HeroButton>

            <HeroButton 
              variant="primary" 
              className="w-full h-12 flex items-center justify-center"
              onClick={() => navigate('/student/applications')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Mis Postulaciones
            </HeroButton>

            {profileCompleteness < 100 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Completa tu perfil al 100% para aumentar tus posibilidades de ser seleccionado
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;