import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HeroButton } from "@/components/ui/button-variants";
import { 
  User, 
  FileText, 
  Send, 
  Heart, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Award,
  BookOpen,
  WifiOff
} from "lucide-react";

const StudentDashboard = () => {
  const profileCompleteness = 85;
  
  const stats = [
    {
      title: "Postulaciones Activas",
      value: "5",
      description: "En proceso de revisión",
      icon: Send,
      color: "text-primary"
    },
    {
      title: "Ofertas Favoritas",
      value: "12",
      description: "Guardadas para postular",
      icon: Heart,
      color: "text-destructive"
    },
    {
      title: "Perfil Completado",
      value: `${profileCompleteness}%`,
      description: "Faltan algunos datos",
      icon: User,
      color: "text-secondary"
    },
    {
      title: "Ofertas Nuevas",
      value: "8",
      description: "Esta semana",
      icon: TrendingUp,
      color: "text-warning"
    }
  ];

  const recentApplications = [
    {
      id: 1,
      company: "TechSolutions Inc.",
      position: "Desarrollador Frontend",
      status: "pending",
      appliedDate: "2024-01-15",
      type: "Remoto"
    },
    {
      id: 2,
      company: "InnovaCorp",
      position: "Analista de Sistemas",
      status: "accepted",
      appliedDate: "2024-01-12",
      type: "Presencial"
    },
    {
      id: 3,
      company: "DataTech Solutions",
      position: "Data Science Intern",
      status: "rejected",
      appliedDate: "2024-01-10",
      type: "Híbrido"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
          <Clock className="w-3 h-3 mr-1" />
          Pendiente
        </Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aceptada
        </Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
          <XCircle className="w-3 h-3 mr-1" />
          Rechazada
        </Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">¡Bienvenida, María!</h1>
            <p className="text-white/80">
              Tienes 3 nuevas ofertas que podrían interesarte
            </p>
          </div>
          <div className="hidden md:block">
            <BookOpen className="h-16 w-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-card hover:shadow-floating transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
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
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Información básica</span>
                </span>
                <Badge variant="secondary" className="bg-success/10 text-success">Completo</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>CV actualizado</span>
                </span>
                <Badge variant="secondary" className="bg-success/10 text-success">Completo</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span>Habilidades técnicas</span>
                </span>
                <Badge variant="secondary" className="bg-warning/10 text-warning">Pendiente</Badge>
              </div>
            </div>

            <HeroButton variant="primary" size="default" className="w-full">
              Completar Perfil
            </HeroButton>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Postulaciones Recientes</span>
            </CardTitle>
            <CardDescription>
              Estado de tus últimas aplicaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gradient-card"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{application.position}</h4>
                    <p className="text-sm text-muted-foreground">{application.company}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {application.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Aplicado: {new Date(application.appliedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(application.status)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <HeroButton variant="secondary" size="default" className="w-full">
                Ver Todas las Postulaciones
              </HeroButton>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Herramientas frecuentemente utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HeroButton variant="primary" className="h-12 flex items-center justify-center">
              <FileText className="mr-2 h-4 w-4" />
              Buscar Ofertas
            </HeroButton>
            <HeroButton variant="secondary" className="h-12 flex items-center justify-center">
              <User className="mr-2 h-4 w-4" />
              Editar Perfil
            </HeroButton>
            <HeroButton variant="primary" className="h-12 flex items-center justify-center">
              <Heart className="mr-2 h-4 w-4" />
              Mis Favoritos
            </HeroButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;