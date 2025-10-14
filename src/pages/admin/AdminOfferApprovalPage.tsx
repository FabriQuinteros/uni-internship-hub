/**
 * Página principal para la aprobación de ofertas por parte de administradores
 * Reemplaza el placeholder en /admin/approval
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAdminOffers } from '@/hooks/use-admin-offers';
import { withAdminPermission } from '@/hooks/use-admin-permissions';
import PendingOffersList from './PendingOffersList';

/**
 * Componente principal de la página de aprobación de ofertas
 */
const AdminOfferApprovalPage: React.FC = () => {
  const {
    pendingOffers,
    totalOffers,
    loading,
    error,
    filters,
    refreshOffers,
    clearError
  } = useAdminOffers();

  // Calcular estadísticas rápidas
  const pendingCount = pendingOffers.filter(offer => offer.status === 'pending').length;
  const rejectedCount = pendingOffers.filter(offer => offer.status === 'rejected').length;

  // Loading state
  if (loading && pendingOffers.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        {/* Stats skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        
        {/* Content skeleton */}
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Aprobación de Ofertas
          </h1>
          <p className="text-muted-foreground">
            Revisa y aprueba las ofertas enviadas por las organizaciones
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={clearError}
              className="text-destructive-foreground hover:text-destructive-foreground/80 ml-2 underline"
            >
              Cerrar
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card hover:shadow-floating transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ofertas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalOffers}</div>
            <p className="text-xs text-muted-foreground">
              Todas las ofertas en revisión
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-floating transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Esperando tu decisión
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-floating transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Requieren corrección
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-floating transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado del Filtro</CardTitle>
            <Badge 
              variant={filters.status ? "default" : "secondary"}
              className="h-4 text-xs"
            >
              {filters.status ? filters.status : 'Todas'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {filters.search ? (
                <span className="text-primary">Búsqueda activa</span>
              ) : (
                <span className="text-muted-foreground">Sin filtros</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {filters.search ? `"${filters.search}"` : 'Mostrando todas las ofertas'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Ofertas
          </CardTitle>
          <CardDescription>
            Revisa los detalles y toma decisiones sobre las ofertas enviadas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <PendingOffersList />
        </CardContent>
      </Card>

      {/* Empty State */}
      {!loading && pendingOffers.length === 0 && !error && (
        <Card className="shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-success mb-4" />
            <h3 className="text-lg font-semibold mb-2">¡Todas las ofertas están revisadas!</h3>
            <p className="text-muted-foreground text-center mb-4">
              No hay ofertas pendientes de aprobación en este momento.
            </p>
            <button 
              onClick={refreshOffers}
              className="text-primary hover:text-primary/80 underline"
            >
              Actualizar lista
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Proteger la página con permisos de administrador
export default withAdminPermission(AdminOfferApprovalPage, 'canApproveOffers');