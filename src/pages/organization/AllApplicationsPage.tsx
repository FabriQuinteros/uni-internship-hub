/**
 * Página de Todas las Postulaciones de la Organización
 * Muestra un resumen de todas las postulaciones recibidas en todas las ofertas
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  AlertCircle, 
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  FileText,
  Calendar,
  Filter,
  Info,
  ArrowRight
} from "lucide-react";
import { useOrganizationAllApplications } from "@/hooks/use-organization-all-applications";

const AllApplicationsPage = () => {
  const navigate = useNavigate();
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'accepted' | 'rejected'>('all');

  const { 
    applications, 
    loading, 
    error, 
    pagination,
    stats,
    fetchAllApplications
  } = useOrganizationAllApplications();

  // Cargar postulaciones al montar y cuando cambie el filtro
  useEffect(() => {
    const filters = statusFilter === 'all' ? {} : { status: statusFilter };
    fetchAllApplications(filters);
  }, [statusFilter, fetchAllApplications]);

  const getStatusBadge = (status: 'pending' | 'approved' | 'accepted' | 'rejected' | 'finalized') => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pre-aprobada
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aceptada
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazada
          </Badge>
        );
      case 'finalized':
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground border-muted">
            <CheckCircle className="w-3 h-3 mr-1" />
            Finalizada
          </Badge>
        );
    }
  };

  const handleViewOfferApplications = (offerId: number) => {
    navigate(`/organization/offers/${offerId}/applications`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-hero rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Todas las Postulaciones</h1>
            <p className="text-white/80">
              {pagination.total > 0 
                ? `${pagination.total} ${pagination.total === 1 ? 'postulación recibida' : 'postulaciones recibidas'} en total`
                : 'Vista general de postulaciones en todas tus ofertas'
              }
            </p>
          </div>
          <div className="hidden md:block">
            <Users className="h-16 w-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Banner Informativo */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Vista General:</strong> Aquí puedes ver todas las postulaciones recibidas en todas tus ofertas. 
          Para gestionar las postulaciones de una oferta específica, haz clic en "Ver en Oferta".
        </AlertDescription>
      </Alert>

      {/* Estadísticas */}
      {!loading && pagination.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pre-aprobadas</p>
                  <h3 className="text-2xl font-bold text-blue-600">
                    {stats.approvedCount}
                  </h3>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aceptadas</p>
                  <h3 className="text-2xl font-bold text-success">
                    {stats.acceptedCount}
                  </h3>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rechazadas</p>
                  <h3 className="text-2xl font-bold text-destructive">
                    {stats.rejectedCount}
                  </h3>
                </div>
                <div className="p-3 bg-destructive/10 rounded-full">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="approved">Pre-aprobadas</SelectItem>
                <SelectItem value="accepted">Aceptadas</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lista de postulaciones */}
      {!loading && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="shadow-card hover:shadow-floating transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">
                        {application.offer_title}
                      </CardTitle>
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{application.student_name}</span>
                        <span className="text-muted-foreground">• Legajo: {application.student_legajo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{application.student_email}</span>
                      </div>
                    </CardDescription>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mensaje de la postulación */}
                {application.message && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Mensaje del estudiante:</p>
                    <p className="text-sm text-muted-foreground">{application.message}</p>
                  </div>
                )}

                {/* Fecha de postulación */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Postulado el {new Date(application.applied_at).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewOfferApplications(application.offer_id)}
                  >
                    Ver en Oferta
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && applications.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">No hay postulaciones</h3>
              <p className="text-muted-foreground max-w-md">
                {statusFilter === 'all' 
                  ? 'Aún no has recibido postulaciones en ninguna de tus ofertas'
                  : `No hay postulaciones con estado "${statusFilter}"`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AllApplicationsPage;
