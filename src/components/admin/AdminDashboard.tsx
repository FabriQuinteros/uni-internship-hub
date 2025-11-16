import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Settings, BarChart3, Building2, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrganizationStore } from '../../store/organizationStore';
import { useAdminStudentsStats } from '@/hooks/use-admin-students-stats';
import { useAdminOffersStats } from '@/hooks/use-admin-offers-stats';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminDashboard: React.FC = () => {
  // Estados del store de organizaciones
  const organizationStats = useOrganizationStore(state => state.stats);
  const fetchOrgStats = useOrganizationStore(state => state.fetchStats);
  const orgStatsLoading = useOrganizationStore(state => state.loading);

  // Hook para estadísticas de estudiantes
  const {
    stats: studentStats,
    loading: studentStatsLoading,
    error: studentStatsError,
    fetchStats: fetchStudentStats
  } = useAdminStudentsStats();

  // Hook para estadísticas de ofertas
  const {
    stats: offerStats,
    loading: offerStatsLoading,
    error: offerStatsError,
    fetchStats: fetchOfferStats
  } = useAdminOffersStats();

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchOrgStats();
    fetchStudentStats();
    fetchOfferStats();
  }, [fetchOrgStats, fetchStudentStats, fetchOfferStats]);

  // Si está cargando, mostramos una UI de carga
  const isLoading = orgStatsLoading || studentStatsLoading || offerStatsLoading;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-hero rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Panel de Control - Administrador</h1>
          <p className="text-white/80">Cargando estadísticas...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[125px] w-full" />
          <Skeleton className="h-[125px] w-full" />
          <Skeleton className="h-[125px] w-full" />
          <Skeleton className="h-[125px] w-full" />
        </div>
      </div>
    );
  }

  // Estadísticas usando los datos reales
  const stats = [
    {
      title: "Organizaciones Totales",
      value: (organizationStats?.total || 0).toString(),
      description: `${organizationStats?.pending || 0} pendientes de aprobación`,
      icon: Building2,
      color: "text-primary",
      link: "/admin/organizations"
    },
    {
      title: "Estudiantes Activos",
      value: (studentStats?.active || 0).toString(),
      description: `${studentStats?.total || 0} registrados en total`,
      icon: Users,
      color: "text-success",
      link: "/admin/students"
    },
    {
      title: "Ofertas Pendientes",
      value: (offerStats?.pending || 0).toString(),
      description: `${offerStats?.active || 0} ofertas activas`,
      icon: FileText,
      color: "text-warning",
      link: "/admin/offers"
    },
    {
      title: "Ofertas Aprobadas",
      value: (offerStats?.approved || 0).toString(),
      description: `${offerStats?.total || 0} ofertas en total`,
      icon: CheckCircle,
      color: "text-success",
      link: "/admin/offers"
    }
  ];

  const quickActions = [
    {
      title: "Gestionar Estudiantes",
      description: "Administrar estudiantes registrados",
      icon: Users,
      href: "/admin/students"
    },
    {
      title: "Gestionar Organizaciones",
      description: "Aprobar, rechazar y gestionar organizaciones",
      icon: Building2,
      href: "/admin/organizations"
    },
    {
      title: "Gestionar Ofertas",
      description: "Supervisar y aprobar todas las ofertas",
      icon: BarChart3,
      href: "/admin/offers"
    },
    {
      title: "Configuración",
      description: "Gestionar catálogos del sistema",
      icon: Settings,
      href: "/admin/catalogs"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-hero rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Panel de Control - Administrador</h1>
            <p className="text-white/80">
              Gestiona organizaciones, estudiantes y ofertas del sistema
            </p>
          </div>
          <div className="hidden md:block">
            <Shield className="h-16 w-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Error Alerts si hay errores en alguna estadística */}
      {(studentStatsError || offerStatsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {studentStatsError && <div>• {studentStatsError}</div>}
            {offerStatsError && <div>• {offerStatsError}</div>}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link}>
              <Card className="shadow-card hover:shadow-floating transition-all duration-300 h-full">
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
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="shadow-card hover:shadow-floating transition-all duration-300 flex flex-col">
              <CardHeader className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{action.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full" asChild>
                  <Link to={action.href}>Acceder</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
