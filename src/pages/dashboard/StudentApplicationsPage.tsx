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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OfferDetailModal } from "@/components/student/OfferDetailModal";
import { studentOfferService } from "@/services/studentOfferService";
import { StudentOfferDetail } from "@/types/student-offers";

const StudentApplicationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'accepted' | 'rejected'>('all');
  
  // Estado para el modal de detalle de oferta
  const [selectedOffer, setSelectedOffer] = useState<StudentOfferDetail | null>(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [loadingOffer, setLoadingOffer] = useState(false);
  
  // Estado para el diálogo de confirmación de cancelación
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [applicationToCancel, setApplicationToCancel] = useState<number | null>(null);

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

  const openCancelDialog = (applicationId: number) => {
    setApplicationToCancel(applicationId);
    setCancelDialogOpen(true);
  };

  const confirmCancelApplication = async () => {
    if (applicationToCancel) {
      await handleCancelApplication(applicationToCancel);
      setCancelDialogOpen(false);
      setApplicationToCancel(null);
    }
  };

  const handleViewOfferDetail = async (offerId: number, applicationStatus?: string) => {
    setLoadingOffer(true);
    setOfferModalOpen(true);
    
    try {
      const offer = await studentOfferService.getOfferDetail(offerId);
      // Marcar como ya aplicado y agregar el estado de la aplicación
      setSelectedOffer({
        ...offer,
        has_applied: true,
        application_status: applicationStatus as any
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar el detalle de la oferta",
        variant: "destructive"
      });
      setOfferModalOpen(false);
    } finally {
      setLoadingOffer(false);
    }
  };

  const handleCloseOfferModal = () => {
    setOfferModalOpen(false);
    setSelectedOffer(null);
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'accepted' | 'rejected' | 'finalized') => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            En Revisión
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-info/10 text-info border-info/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobada por la Facultad
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
              {pagination?.total > 0 
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
                <SelectItem value="pending">En Revisión</SelectItem>
                <SelectItem value="approved">Aprobadas por la Facultad</SelectItem>
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

              {/* Mensaje de felicitaciones para postulaciones aceptadas */}
              {application.status === 'accepted' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900">
                    <strong className="block mb-1">¡Felicitaciones! 🎉</strong>
                    <span className="text-sm">
                      Tu postulación ha sido aceptada. La Facultad se pondrá en contacto contigo 
                      a la brevedad para coordinar los próximos pasos y formalizar tu incorporación 
                      a la pasantía. Mantente atento a tu correo electrónico.
                    </span>
                  </AlertDescription>
                </Alert>
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
                  onClick={() => handleViewOfferDetail(application.offer_id, application.status)}
                  className="flex-1"
                >
                  Ver detalle
                </Button>
                
                {/* Permitir cancelar solo en estados pending y approved */}
                {(application.status === 'pending' || application.status === 'approved') && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => openCancelDialog(application.id)}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
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

      {/* Modal de detalle de oferta */}
      <OfferDetailModal
        offer={selectedOffer}
        open={offerModalOpen}
        onClose={handleCloseOfferModal}
        loading={loadingOffer}
        onApply={undefined} // No permitir aplicar desde aquí (ya aplicó)
      />

      {/* Diálogo de confirmación para cancelar postulación */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar postulación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Tu postulación será eliminada y no podrás recuperarla. 
              Tendrás que volver a postularte si cambias de opinión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener postulación</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelApplication}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, cancelar postulación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentApplicationsPage;
