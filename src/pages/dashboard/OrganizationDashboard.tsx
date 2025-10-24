import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, BriefcaseIcon, FileEdit, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    {
      title: "Crear Nueva Oferta",
      description: "Publica una nueva pasantía",
      icon: BriefcaseIcon,
      action: () => navigate('/organization/offers/new'),
      variant: "default" as const
    },
    {
      title: "Mis Ofertas",
      description: "Ver y gestionar ofertas publicadas",
      icon: FileEdit,
      action: () => navigate('/organization/offers'),
      variant: "outline" as const
    },
    {
      title: "Actualizar Perfil",
      description: "Editar información de la organización",
      icon: UserCog,
      action: () => navigate('/organization/profile'),
      variant: "outline" as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-hero rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Panel de Control - Organización</h1>
            <p className="text-white/80">
              Gestiona tus ofertas de pasantías y conecta con talento estudiantil
            </p>
          </div>
          <div className="hidden md:block">
            <Building2 className="h-16 w-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="shadow-card hover:shadow-floating transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription className="text-sm">{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  variant={action.variant} 
                  className="w-full"
                  onClick={action.action}
                >
                  Acceder
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="shadow-card bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>Información</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            • Las ofertas nuevas deben ser aprobadas por el administrador antes de ser publicadas
          </p>
          <p>
            • Puedes crear borradores y enviarlos a aprobación cuando estén listos
          </p>
          <p>
            • Mantén tu perfil actualizado para generar mayor confianza en los estudiantes
          </p>
          <p>
            • La gestión de postulaciones estará disponible próximamente
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationDashboard;
