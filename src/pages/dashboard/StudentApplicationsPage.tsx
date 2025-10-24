/**
 * Página de Postulaciones del Estudiante
 * Muestra el historial de postulaciones realizadas
 * 
 * Endpoint: GET /api/students/applications
 * 
 * Funcionalidades:
 * - Listar todas las postulaciones del estudiante
 * - Filtrar por estado (pendiente, aceptada, rechazada)
 * - Ver detalles de cada postulación
 * - Cancelar postulaciones pendientes
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  AlertCircle, 
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStudentApplications, type StudentApplication } from "@/hooks/use-student-applications";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StudentApplicationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const { 
    applications, 
    loading, 
    error, 
    pagination,
    fetchApplications,
    cancelApplication 
  } = useStudentApplications();

  // Cargar postulaciones al montar y cuando cambie el filtro
  useEffect(() => {
    const filters = statusFilter === 'all' ? {} : { status: statusFilter };
    fetchApplications(filters);
  }, [fetchApplications, statusFilter]);

  const handleCancelApplication = async (applicationId: number) => {
    const success = await cancelApplication(applicationId);
    if (success) {
      toast({
        title: "Postulación cancelada",
        description: "Tu postulación ha sido cancelada exitosamente",
        variant: "default"
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo cancelar la postulación",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: 'pending' | 'accepted' | 'rejected' | 'finalized') => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-hero rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Mis Postulaciones</h1>
            <p className="text-white/80">
              {pagination.total > 0 
                ? `Tienes ${pagination.total} ${pagination.total === 1 ? 'postulación' : 'postulaciones'}`
                : 'Historial de tus postulaciones a ofertas de pasantías'
              }
            </p>
          </div>
          <div className="hidden md:block">
            <FileText className="h-16 w-16 text-white/20" />
          </div>
        </div>
      </div>

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
                <SelectItem value="pending">Pendientes</SelectItem>
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
                  <CardTitle className="text-lg mb-1">{application.offer_title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {application.organization_name}
                  </CardDescription>
                </div>
                {getStatusBadge(application.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Detalles de la oferta */}
              {application.offer_details && (
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{application.offer_details.position}</Badge>
                  <Badge variant="outline">{application.offer_details.modality}</Badge>
                  <Badge variant="outline">{application.offer_details.location}</Badge>
                </div>
              )}

              {/* Fecha de postulación */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Postulado el {new Date(application.applied_at).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {/* Mensaje de rechazo */}
              {application.status === 'rejected' && application.rejectionReason && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Motivo:</strong> {application.rejectionReason}
                  </AlertDescription>
                </Alert>
              )}

              {/* Acciones */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/student/offers`)}
                >
                  Ver oferta
                </Button>
                {application.status === 'pending' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleCancelApplication(application.id)}
                  >
                    Cancelar postulación
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Empty state cuando no haya postulaciones */}
      {!loading && applications.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">No tienes postulaciones</h3>
              <p className="text-muted-foreground max-w-md">
                Explora las ofertas disponibles y postúlate a las que más te interesen
              </p>
              <Button 
                onClick={() => navigate('/student/offers')}
                className="mt-4"
              >
                Explorar Ofertas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentApplicationsPage;
