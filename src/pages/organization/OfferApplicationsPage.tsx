/**
 * Página de Postulaciones Recibidas para Organización
 * Muestra las postulaciones de estudiantes a una oferta específica
 * Permite aceptar o rechazar postulaciones
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  Filter,
  ArrowLeft,
  Info
} from "lucide-react";
import { useOrganizationApplications, type OfferApplication } from "@/hooks/use-organization-applications";
import { useToast } from "@/hooks/use-toast";
import { StudentProfileModal } from "@/components/organization/StudentProfileModal";

const OfferApplicationsPage = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'accepted' | 'rejected'>('all');
  const [evaluationModal, setEvaluationModal] = useState<{
    open: boolean;
    application: OfferApplication | null;
    decision: 'accepted' | 'rejected' | null;
  }>({
    open: false,
    application: null,
    decision: null
  });
  const [evaluationMessage, setEvaluationMessage] = useState("");
  const [profileModal, setProfileModal] = useState<{
    open: boolean;
    studentId: number | null;
    studentName: string;
    studentLegajo: string;
  }>({
    open: false,
    studentId: null,
    studentName: "",
    studentLegajo: ""
  });

  const { 
    applications, 
    loading, 
    error, 
    pagination,
    fetchApplications,
    evaluateApplication 
  } = useOrganizationApplications();

  // Cargar postulaciones al montar y cuando cambie el filtro
  useEffect(() => {
    if (offerId) {
      const filters = statusFilter === 'all' ? {} : { status: statusFilter };
      fetchApplications(parseInt(offerId), filters);
    }
  }, [offerId, statusFilter, fetchApplications]);

  const openEvaluationModal = (application: OfferApplication, decision: 'accepted' | 'rejected') => {
    setEvaluationModal({
      open: true,
      application,
      decision
    });
    setEvaluationMessage("");
  };

  const closeEvaluationModal = () => {
    setEvaluationModal({
      open: false,
      application: null,
      decision: null
    });
    setEvaluationMessage("");
  };

  const openProfileModal = (application: OfferApplication) => {
    setProfileModal({
      open: true,
      studentId: application.student_id,
      studentName: application.student_name,
      studentLegajo: application.student_legajo
    });
  };

  const closeProfileModal = () => {
    setProfileModal({
      open: false,
      studentId: null,
      studentName: "",
      studentLegajo: ""
    });
  };

  const handleEvaluate = async () => {
    if (!evaluationModal.application || !evaluationModal.decision) return;

    // Validar que si es rejected, tenga mensaje
    if (evaluationModal.decision === 'rejected' && !evaluationMessage.trim()) {
      toast({
        title: "Campo requerido",
        description: "Debes proporcionar un motivo para rechazar la postulación",
        variant: "destructive"
      });
      return;
    }

    const success = await evaluateApplication(evaluationModal.application.id, {
      status: evaluationModal.decision,
      reason: evaluationModal.decision === 'rejected' ? evaluationMessage : undefined
    });

    if (success) {
      toast({
        title: evaluationModal.decision === 'accepted' ? "Postulación aceptada" : "Postulación rechazada",
        description: "La decisión ha sido enviada al estudiante",
        variant: "default"
      });
      closeEvaluationModal();
      // Recargar la lista
      if (offerId) {
        const filters = statusFilter === 'all' ? {} : { status: statusFilter };
        fetchApplications(parseInt(offerId), filters);
      }
    } else {
      toast({
        title: "Error",
        description: "No se pudo procesar la evaluación",
        variant: "destructive"
      });
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-hero rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/organization/offers')}
              className="text-white hover:bg-white/10 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Mis Ofertas
            </Button>
            <h1 className="text-2xl font-bold mb-2">Postulaciones Recibidas</h1>
            <p className="text-white/80">
              {pagination.total > 0 
                ? `${pagination.total} ${pagination.total === 1 ? 'postulación recibida' : 'postulaciones recibidas'}`
                : 'Gestiona las postulaciones de los estudiantes'
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
          <strong>Flujo de Aprobación:</strong> Solo verás postulaciones <strong>pre-aprobadas por la administración</strong>. 
          Estas han sido revisadas y cumplen con los requisitos básicos. Ahora puedes <strong>aceptarlas</strong> para confirmar al estudiante 
          o <strong>rechazarlas</strong> indicando el motivo.
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
                    {applications.filter(app => app.status === 'approved').length}
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
                    {applications.filter(app => app.status === 'accepted').length}
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
                    {applications.filter(app => app.status === 'rejected').length}
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
                    <CardTitle className="text-lg mb-1 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {application.student_name}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Legajo: {application.student_legajo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{application.student_email}</span>
                      </div>
                    </CardDescription>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProfileModal(application)}
                        className="text-primary hover:bg-primary/10"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Ver Perfil Completo
                      </Button>
                    </div>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Información del perfil del estudiante */}
                {application.student_profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {application.student_profile.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{application.student_profile.phone}</span>
                      </div>
                    )}
                    {application.student_profile.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{application.student_profile.location}</span>
                      </div>
                    )}
                    {application.student_profile.academic_formation && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium mb-1">Formación Académica:</p>
                        <p className="text-sm text-muted-foreground">{application.student_profile.academic_formation}</p>
                      </div>
                    )}
                    {application.student_profile.availability && (
                      <div>
                        <p className="text-sm font-medium mb-1">Disponibilidad:</p>
                        <Badge variant="outline">{application.student_profile.availability}</Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Mensaje de la postulación */}
                {application.message && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Mensaje del estudiante:</p>
                    <p className="text-sm text-muted-foreground">{application.message}</p>
                  </div>
                )}

                {/* Fecha de postulación */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

                {/* Acciones */}
                {application.status === 'approved' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => openEvaluationModal(application, 'accepted')}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aceptar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEvaluationModal(application, 'rejected')}
                      className="flex-1 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>
                )}
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
                  ? 'Aún no has recibido postulaciones para esta oferta'
                  : `No hay postulaciones con estado "${statusFilter}"`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Evaluación */}
      <Dialog open={evaluationModal.open} onOpenChange={closeEvaluationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {evaluationModal.decision === 'accepted' ? 'Aceptar Postulación' : 'Rechazar Postulación'}
            </DialogTitle>
            <DialogDescription>
              {evaluationModal.decision === 'accepted' 
                ? `¿Estás seguro de aceptar la postulación de ${evaluationModal.application?.student_name}?`
                : `¿Estás seguro de rechazar la postulación de ${evaluationModal.application?.student_name}?`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {evaluationModal.decision === 'rejected' 
                  ? 'Motivo del rechazo (obligatorio)' 
                  : 'Mensaje para el estudiante (opcional)'
                }
              </label>
              <Textarea
                placeholder={
                  evaluationModal.decision === 'accepted'
                    ? "¡Felicitaciones! Nos pondremos en contacto contigo..."
                    : "Explica brevemente el motivo del rechazo..."
                }
                value={evaluationMessage}
                onChange={(e) => setEvaluationMessage(e.target.value)}
                rows={4}
                className={evaluationModal.decision === 'rejected' && !evaluationMessage.trim() 
                  ? 'border-destructive' 
                  : ''
                }
              />
              {evaluationModal.decision === 'rejected' && !evaluationMessage.trim() && (
                <p className="text-xs text-destructive mt-1">
                  * Este campo es obligatorio al rechazar una postulación
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEvaluationModal}>
              Cancelar
            </Button>
            <Button 
              variant={evaluationModal.decision === 'accepted' ? 'default' : 'destructive'}
              onClick={handleEvaluate}
            >
              Confirmar {evaluationModal.decision === 'accepted' ? 'Aceptación' : 'Rechazo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Perfil del Estudiante */}
      <StudentProfileModal
        open={profileModal.open}
        onClose={closeProfileModal}
        studentId={profileModal.studentId}
        studentName={profileModal.studentName}
        studentLegajo={profileModal.studentLegajo}
      />
    </div>
  );
};

export default OfferApplicationsPage;
