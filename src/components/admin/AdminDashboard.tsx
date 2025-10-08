import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Code2, Brain, Users, Shield, Settings, BarChart3, Building2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCatalogStore } from '../../store/catalogStore';
import { useOrganizationStore } from '../../store/organizationStore';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  // 1. Obtenemos las funciones y el estado que realmente existen en el store
  const getItems = useCatalogStore(state => state.getItems);
  const loadItems = useCatalogStore(state => state.loadItems);
  const loading = useCatalogStore(state => state.loadingState.isLoading);
  const items = useCatalogStore(state => state.items); // Para verificar si ya se cargaron

  // 2. Estados del store de organizaciones
  const organizationStats = useOrganizationStore(state => state.stats);
  const fetchStats = useOrganizationStore(state => state.fetchStats);
  const statsLoading = useOrganizationStore(state => state.loading);

  // 3. Cargamos los datos desde la API cuando el componente se monta
  useEffect(() => {
    // Solo cargamos si el array de items está vacío, para evitar recargas innecesarias
    if (items.length === 0) {
      loadItems();
    }
    // Cargar estadísticas de organizaciones
    fetchStats();
  }, [loadItems, items.length, fetchStats]);

  // Si está cargando, mostramos una UI de carga para evitar errores
  if (loading || statsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[105px] w-full" />
          <Skeleton className="h-[105px] w-full" />
          <Skeleton className="h-[105px] w-full" />
          <Skeleton className="h-[105px] w-full" />
        </div>
        {/* Puedes agregar más skeletons para las otras secciones si quieres */}
      </div>
    );
  }

  // Estadísticas usando los datos reales de organizaciones y datos básicos de catálogos
  const stats = [
    {
      title: "Organizaciones Totales",
      value: (organizationStats?.total || 0).toString(),
      description: `${organizationStats?.pending || 0} pendientes de aprobación`,
      icon: Building2,
      color: "text-primary"
    },
    {
      title: "Organizaciones Activas",
      value: (organizationStats?.approved || 0).toString(),
      description: `${organizationStats?.suspended || 0} suspendidas`,
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Elementos de Catálogo",
      value: items.length.toString(),
      description: "Tecnologías, posiciones, modalidades",
      icon: Database,
      color: "text-secondary"
    },
    {
      title: "Organizaciones Rechazadas",
      value: (organizationStats?.rejected || 0).toString(),
      description: "Requieren revisión",
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
      title: "Gestionar Organizaciones",
      description: "Aprobar, rechazar y gestionar organizaciones",
      icon: Building2,
      href: "/admin/organizations"
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <Link to={action.href}>Acceder</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
