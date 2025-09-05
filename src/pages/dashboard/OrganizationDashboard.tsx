import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, BriefcaseIcon, TrendingUp, ClockIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const statsCards = [
  {
    title: "Total de Pasantías",
    value: "12",
    description: "Publicadas en el último mes",
    icon: BriefcaseIcon,
    trend: "+3",
  },
  {
    title: "Postulaciones",
    value: "48",
    description: "Recibidas este mes",
    icon: Users,
    trend: "+15",
  },
  {
    title: "Tasa de Contratación",
    value: "75%",
    description: "Pasantes contratados",
    icon: TrendingUp,
    trend: "+5%",
  },
];

const recentInternships = [
  {
    title: "Desarrollador Frontend React",
    applicants: 12,
    status: "active",
    progress: 65,
  },
  {
    title: "Ingeniero DevOps Junior",
    applicants: 8,
    status: "active",
    progress: 45,
  },
  {
    title: "Analista de Datos",
    applicants: 15,
    status: "closed",
    progress: 100,
  },
];

const OrganizationDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">
          Bienvenido al portal de gestión de pasantías
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <span className="text-sm text-green-500">
                    {stat.trend}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Internships */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Positions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Pasantías Activas</CardTitle>
            <CardDescription>
              Estado actual de las posiciones abiertas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentInternships.map((internship, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">
                        {internship.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {internship.applicants} postulantes
                      </div>
                    </div>
                    {internship.status === "active" ? (
                      <ClockIcon className="h-4 w-4 text-blue-500" />
                    ) : (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <Progress value={internship.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Gestiona tus pasantías y postulaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <BriefcaseIcon className="mr-2 h-4 w-4" />
              Nueva Pasantía
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Ver Postulaciones
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Building2 className="mr-2 h-4 w-4" />
              Actualizar Perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
