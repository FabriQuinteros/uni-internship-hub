import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Code2, Brain, Users, Shield, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCatalogStore } from '../../store/catalogStore';

const AdminDashboard: React.FC = () => {
  const { technologies, skills } = useCatalogStore();
  
  const stats = [
    {
      title: "Tecnologías",
      value: technologies.length.toString(),
      description: `${technologies.filter(t => t.status === 'active').length} activas`,
      icon: Code2,
      color: "text-primary"
    },
    {
      title: "Habilidades",
      value: skills.length.toString(),
      description: `${skills.filter(s => s.status === 'active').length} activas`,
      icon: Brain,
      color: "text-secondary"
    },
    {
      title: "Usuarios",
      value: "124",
      description: "Estudiantes y organizaciones",
      icon: Users,
      color: "text-success"
    },
    {
      title: "Ofertas Pendientes",
      value: "8",
      description: "Por aprobar",
      icon: Shield,
      color: "text-warning"
    }
  ];

  const quickActions = [
    {
      title: "Gestionar Usuarios",
      description: "Administrar estudiantes y organizaciones",
      icon: Users,
      href: "/admin/users"
    },
    {
      title: "Aprobar Ofertas",
      description: "Revisar y aprobar nuevas ofertas",
      icon: Shield,
      href: "/admin/approval"
    },
    {
      title: "Configuración",
      description: "Ajustes del sistema",
      icon: Settings,
      href: "/admin/settings"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">
          Bienvenido al dashboard administrativo
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action, index) => (
          <Card key={index} className="shadow-card hover:shadow-floating transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <action.icon className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href={action.href}>Acceder</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
