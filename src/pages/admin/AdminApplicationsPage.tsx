/**
 * Página de Gestión de Postulaciones para Administrador
 * Permite aprobar o rechazar postulaciones antes de que lleguen a las organizaciones
 */

import { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  FileCheck, 
  AlertCircle, 
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Briefcase,
  Building2,
  Calendar,
  Filter,
  Search,
  Eye
} from "lucide-react";
import { useAdminApplications } from "@/hooks/use-admin-applications";
import { useToast } from "@/hooks/use-toast";
import { AdminApplication, ADMIN_STATUS_CONFIG, ApplicationStatus } from "@/types/admin-applications";

const AdminApplicationsPage = () => {
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'accepted'>('pending');
  const [searchTerm, setSearchTerm] = useState("");
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    application: AdminApplication | null;
    action: 'approve' | 'reject' | null;
  }>({
    open: false,
    application: null,
    action: null
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    application: AdminApplication | null;
  }>({
    open: false,
    application: null
  });

  const { 
    applications, 
    loading, 
    error, 
    pagination,
    fetchApplications,
    approveApplication,
    rejectApplication
  } = useAdminApplications();

  // Cargar postulaciones al montar y cuando cambie el filtro
  useEffect(() => {
    fetchApplications({ 
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: searchTerm || undefined,
      page: 1,
      limit: 20
    });
  }, [statusFilter, fetchApplications]);

  const handleSearch = () => {
    fetchApplications({ 
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: searchTerm || undefined,
      page: 1,
      limit: 20
    });
  };

  const openActionModal = (application: AdminApplication, action: 'approve' | 'reject') => {
    setActionModal({
      open: true,
      application,
      action
    });
    setRejectionReason("");
  };

  const closeActionModal = () => {
    setActionModal({
      open: false,
      application: null,
      action: null
    });
    setRejectionReason("");
  };

  const openDetailModal = (application: AdminApplication) => {
    setDetailModal({
      open: true,
      application
    });
  };

  const closeDetailModal = () => {
    setDetailModal({
      open: false,
      application: null
    });
  };

  const handleAction = async () => {
    if (!actionModal.application || !actionModal.action) return;

    if (actionModal.action === 'reject') {
      if (!rejectionReason.trim()) {
        toast({
          title: "Campo requerido",
          description: "Debes proporcionar un motivo para rechazar la postulación",
          variant: "destructive"
        });
        return;
      }
    }

    const success = actionModal.action === 'approve'
      ? await approveApplication(actionModal.application.id)
      : await rejectApplication(actionModal.application.id, {
          rejection_reason: rejectionReason
        });

    if (success) {
      toast({
        title: actionModal.action === 'approve' ? "Postulación aprobada" : "Postulación rechazada",
        description: actionModal.action === 'approve'
          ? "La postulación ha sido enviada a la organización y el estudiante ha sido notificado"
          : "La postulación ha sido rechazada y el estudiante ha sido notificado. La organización no será informada.",
        variant: "default"
      });
      closeActionModal();
      // Recargar la lista
      fetchApplications({ 
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined,
        page: pagination.page,
        limit: pagination.limit
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo procesar la acción",
        variant: "destructive"
      });
    }
  };

  const getAdminStatusBadge = (status: ApplicationStatus) => {
    const config = ADMIN_STATUS_CONFIG[status];
    const Icon = status === 'pending' ? Clock : status === 'approved' ? CheckCircle : status === 'accepted' ? CheckCircle : XCircle;
    
    return (
      <Badge variant="secondary" className={`
        ${status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' : ''}
        ${status === 'approved' ? 'bg-info/10 text-info border-info/20' : ''}
        ${status === 'accepted' ? 'bg-success/10 text-success border-success/20' : ''}
        ${status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' : ''}
      `}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-hero rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestión de Postulaciones</h1>
            <p className="text-white/80">
              {pagination?.total > 0 
                ? `${pagination.total} ${pagination.total === 1 ? 'postulación' : 'postulaciones'} ${
                    statusFilter === 'all' ? 'totales' : 
                    statusFilter === 'pending' ? 'pendientes' :
                    statusFilter === 'approved' ? 'aprobadas' :
                    statusFilter === 'rejected' ? 'rechazadas' :
                    'aceptadas'
                  }`
                : 'Aprueba o rechaza las postulaciones de estudiantes'
              }
            </p>
          </div>
          <div className="hidden md:block">
            <FileCheck className="h-16 w-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="accepted">Aceptadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por estudiante u oferta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="sm">
                Buscar
              </Button>
            </div>
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
                  <div className="flex-1 space-y-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {application.student_name}
                    </CardTitle>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{application.student_email}</span>
                      </div>
                      {application.student_legajo && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Legajo: {application.student_legajo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {getAdminStatusBadge(application.status as any)}
                </div>
                
                {/* Información de la oferta */}
                <div className="mt-3 pt-3 border-t space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{application.offer_title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{application.organization_name}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Información adicional de la oferta */}
                {(application.offer_position || application.offer_location || application.offer_modality) && (
                  <div className="flex flex-wrap gap-2 text-sm">
                    {application.offer_position && <Badge variant="outline">{application.offer_position}</Badge>}
                    {application.offer_location && <Badge variant="outline">{application.offer_location}</Badge>}
                    {application.offer_modality && <Badge variant="outline">{application.offer_modality}</Badge>}
                  </div>
                )}

                {/* Mensaje del estudiante */}
                {application.message && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Mensaje del estudiante:</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{application.message}</p>
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

                {/* Motivo de rechazo si existe */}
                {application.status === 'rejected' && application.rejection_reason && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Motivo del rechazo:</strong> {application.rejection_reason}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openDetailModal(application)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                  
                  {application.status === 'pending' && (
                    <>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => openActionModal(application, 'approve')}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openActionModal(application, 'reject')}
                        className="flex-1 text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </>
                  )}
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
              <FileCheck className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">No hay postulaciones</h3>
              <p className="text-muted-foreground max-w-md">
                {statusFilter === 'all' 
                  ? 'Aún no hay postulaciones en el sistema'
                  : `No hay postulaciones con estado "${ADMIN_STATUS_CONFIG[statusFilter]?.label}"`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de acción (Aprobar/Rechazar) */}
      <Dialog open={actionModal.open} onOpenChange={closeActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionModal.action === 'approve' ? 'Aprobar Postulación' : 'Rechazar Postulación'}
            </DialogTitle>
            <DialogDescription>
              {actionModal.action === 'approve' 
                ? `¿Estás seguro de aprobar la postulación de ${actionModal.application?.student_name}? Se notificará al estudiante y a la organización.`
                : `¿Estás seguro de rechazar la postulación de ${actionModal.application?.student_name}? Solo se notificará al estudiante, la organización no verá esta postulación.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {actionModal.action === 'reject' && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Motivo del rechazo (obligatorio)
                </label>
                <Textarea
                  placeholder="Explica por qué se rechaza esta postulación..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className={!rejectionReason.trim() ? 'border-destructive' : ''}
                />
                {!rejectionReason.trim() && (
                  <p className="text-xs text-destructive mt-1">
                    * Este campo es obligatorio
                  </p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeActionModal}>
              Cancelar
            </Button>
            <Button 
              variant={actionModal.action === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
            >
              Confirmar {actionModal.action === 'approve' ? 'Aprobación' : 'Rechazo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalle */}
      <Dialog open={detailModal.open} onOpenChange={closeDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Postulación</DialogTitle>
          </DialogHeader>
          
          {detailModal.application && (
            <div className="space-y-4">
              {/* Info estudiante */}
              <div>
                <h4 className="font-semibold mb-2">Estudiante</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Nombre:</strong> {detailModal.application.student_name}</p>
                  <p><strong>Email:</strong> {detailModal.application.student_email}</p>
                  <p><strong>Legajo:</strong> {detailModal.application.student_legajo}</p>
                  {detailModal.application.student_phone && (
                    <p><strong>Teléfono:</strong> {detailModal.application.student_phone}</p>
                  )}
                  {detailModal.application.student_career && (
                    <p><strong>Carrera:</strong> {detailModal.application.student_career}</p>
                  )}
                </div>
              </div>

              {/* Info oferta */}
              <div>
                <h4 className="font-semibold mb-2">Oferta</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Título:</strong> {detailModal.application.offer_title}</p>
                  <p><strong>Organización:</strong> {detailModal.application.organization_name}</p>
                  {detailModal.application.offer_position && (
                    <p><strong>Posición:</strong> {detailModal.application.offer_position}</p>
                  )}
                  {detailModal.application.offer_location && (
                    <p><strong>Ubicación:</strong> {detailModal.application.offer_location}</p>
                  )}
                  {detailModal.application.offer_modality && (
                    <p><strong>Modalidad:</strong> {detailModal.application.offer_modality}</p>
                  )}
                </div>
              </div>

              {/* Mensaje */}
              {detailModal.application.message && (
                <div>
                  <h4 className="font-semibold mb-2">Mensaje del estudiante</h4>
                  <p className="text-sm text-muted-foreground">{detailModal.application.message}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDetailModal}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApplicationsPage;
