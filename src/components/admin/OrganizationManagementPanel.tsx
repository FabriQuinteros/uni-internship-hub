import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play,
  Eye,
  MessageSquare,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useAdminPermissions } from '../../hooks/use-admin-permissions';
import { useOrganizationStore } from '../../store/organizationStore';
import { 
  Organization, 
  OrganizationStatus, 
  OrganizationAction,
  OrganizationFilters 
} from '../../types/user';

const OrganizationManagementPanel: React.FC = (): JSX.Element => {
  const { toast } = useToast();
  
  const userId = 'current-admin-id';
  const { permissions, loading: permissionsLoading } = useAdminPermissions(userId);

  const isDevelopment = true;
  const hasPermissions = isDevelopment ? true : permissions.canManageOrganizations;

  const {
    organizations,
    loading,
    error,
    filters,
    pagination,
    totalPages,
    totalOrganizations,
    selectedOrganization,
    observations,
    stats,
    setFilters,
    setPagination,
    fetchOrganizations,
    selectOrganization,
    updateOrganizationStatus,
    fetchStats,
    clearError
  } = useOrganizationStore();

  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showObservations, setShowObservations] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    organization: Organization;
    action: OrganizationAction;
    newStatus: OrganizationStatus;
  } | null>(null);
  const [observation, setObservation] = useState('');

  useEffect(() => {
    if (hasPermissions) {
      fetchOrganizations();
      fetchStats();
    }
  }, [hasPermissions]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error]);

  const handleStatusFilter = (status: string) => {
    const newFilters: OrganizationFilters = { ...filters };
    
    if (status === 'all') {
      delete newFilters.status;
    } else {
      newFilters.status = [status as OrganizationStatus];
    }
    
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ page: newPage });
  };

  const handlePageSizeChange = (newSize: string) => {
    setPagination({ page: 1, limit: parseInt(newSize) });
  };

  const initiateAction = (organization: Organization, action: OrganizationAction, newStatus: OrganizationStatus) => {
    setCurrentAction({ organization, action, newStatus });
    setObservation('');
    setShowActionDialog(true);
  };

  const confirmAction = () => {
    setShowActionDialog(false);
    setShowConfirmation(true);
  };

  const executeAction = async () => {
    if (!currentAction) return;

    try {
      await updateOrganizationStatus({
        organizationId: currentAction.organization.id,
        newStatus: currentAction.newStatus,
        observation,
        adminId: userId
      });

      toast({
        title: "Acción completada",
        description: `La organización ha sido ${getActionDescription(currentAction.action)} exitosamente.`,
      });

      setShowConfirmation(false);
      setCurrentAction(null);
      setObservation('');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la acción. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const getActionDescription = (action: OrganizationAction): string => {
    const descriptions = {
      [OrganizationAction.APPROVE]: 'aprobada',
      [OrganizationAction.REJECT]: 'rechazada',
      [OrganizationAction.SUSPEND]: 'suspendida',
      [OrganizationAction.REACTIVATE]: 'reactivada',
      [OrganizationAction.DISABLE]: 'deshabilitada',
      [OrganizationAction.UPDATE_PROFILE]: 'actualizada'
    };
    return descriptions[action];
  };

  const showOrganizationObservations = (organization: Organization) => {
    selectOrganization(organization);
    setShowObservations(true);
  };

  const getStatusBadge = (status: OrganizationStatus) => {
    const statusConfig = {
      [OrganizationStatus.PENDING]: { label: 'Pendiente', variant: 'secondary' as const },
      [OrganizationStatus.APPROVED]: { label: 'Aprobada', variant: 'default' as const },
      [OrganizationStatus.REJECTED]: { label: 'Rechazada', variant: 'destructive' as const },
      [OrganizationStatus.SUSPENDED]: { label: 'Suspendida', variant: 'outline' as const },
      [OrganizationStatus.DISABLED]: { label: 'Deshabilitada', variant: 'outline' as const }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAvailableActions = (organization: Organization) => {
    const actions = [];

    switch (organization.status) {
      case OrganizationStatus.PENDING:
        actions.push(
          { action: OrganizationAction.APPROVE, newStatus: OrganizationStatus.APPROVED, label: 'Aprobar', icon: CheckCircle, variant: 'default' as const },
          { action: OrganizationAction.REJECT, newStatus: OrganizationStatus.REJECTED, label: 'Rechazar', icon: XCircle, variant: 'destructive' as const }
        );
        break;
      case OrganizationStatus.APPROVED:
        actions.push(
          { action: OrganizationAction.SUSPEND, newStatus: OrganizationStatus.SUSPENDED, label: 'Suspender', icon: Pause, variant: 'outline' as const }
        );
        break;
      case OrganizationStatus.SUSPENDED:
        actions.push(
          { action: OrganizationAction.REACTIVATE, newStatus: OrganizationStatus.APPROVED, label: 'Reactivar', icon: Play, variant: 'default' as const }
        );
        break;
      case OrganizationStatus.REJECTED:
        actions.push(
          { action: OrganizationAction.REACTIVATE, newStatus: OrganizationStatus.PENDING, label: 'Revisar', icon: Play, variant: 'secondary' as const }
        );
        break;
    }

    return actions;
  };

  // Early returns para estados de carga y sin permisos
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Validando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  if (!hasPermissions && !isDevelopment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-3">Acceso Denegado</h2>
          <p className="text-muted-foreground text-lg">
            No tienes permisos para gestionar organizaciones.
          </p>
        </div>
      </div>
    );
  }

  // Contenido principal (solo se renderiza una vez)
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Gestión de Organizaciones</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Administra el estado y permisos de las organizaciones registradas en la plataforma
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-5">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Organizaciones</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground mt-1">Por revisar</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aprobadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-xs text-muted-foreground mt-1">Activas</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rechazadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground mt-1">Denegadas</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Suspendidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">{stats.suspended}</div>
                <p className="text-xs text-muted-foreground mt-1">Bloqueadas</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Búsqueda y Filtros
              </CardTitle>
              <CardDescription>
                Busca y filtra las organizaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar organización</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="search"
                      placeholder="Nombre, email o descripción..."
                      value={filters.searchTerm || ''}
                      onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-64">
                  <Label htmlFor="status">Filtrar por estado</Label>
                  <Select value={filters.status?.[0] || 'all'} onValueChange={handleStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value={OrganizationStatus.PENDING}>Pendientes</SelectItem>
                      <SelectItem value={OrganizationStatus.APPROVED}>Aprobadas</SelectItem>
                      <SelectItem value={OrganizationStatus.REJECTED}>Rechazadas</SelectItem>
                      <SelectItem value={OrganizationStatus.SUSPENDED}>Suspendidas</SelectItem>
                      <SelectItem value={OrganizationStatus.DISABLED}>Deshabilitadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Organizaciones ({totalOrganizations})
              </CardTitle>
              <CardDescription className="text-base">
                Lista completa de todas las organizaciones registradas en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-lg">Cargando organizaciones...</p>
                </div>
              ) : organizations.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No hay organizaciones</h3>
                  <p className="text-muted-foreground">
                    No se encontraron organizaciones con los filtros aplicados.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Organización</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold text-center">Estado</TableHead>
                          <TableHead className="font-semibold text-center">Perfil</TableHead>
                          <TableHead className="font-semibold text-center">Fecha Registro</TableHead>
                          <TableHead className="font-semibold text-center">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {organizations.map((org) => (
                          <TableRow key={org.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-foreground">{org.name}</div>
                                <div className="text-sm text-muted-foreground font-mono">
                                  ID: {org.id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">{org.email}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(org.status)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={org.profileComplete ? "default" : "secondary"}>
                                {org.profileComplete ? "Completo" : "Incompleto"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm">
                                {new Date(org.createdAt).toLocaleDateString('es-ES')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2 flex-wrap">
                                {getAvailableActions(org).map((actionConfig) => {
                                  const Icon = actionConfig.icon;
                                  return (
                                    <Button
                                      key={actionConfig.action}
                                      size="sm"
                                      variant={actionConfig.variant}
                                      onClick={() => initiateAction(org, actionConfig.action, actionConfig.newStatus)}
                                      className="text-xs"
                                    >
                                      <Icon className="h-3 w-3 mr-1" />
                                      {actionConfig.label}
                                    </Button>
                                  );
                                })}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => showOrganizationObservations(org)}
                                  className="text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t mt-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Mostrando</span>
                        <Select 
                          value={pagination.limit.toString()} 
                          onValueChange={handlePageSizeChange}
                        >
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                        <span>de {totalOrganizations} resultados</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.page === 1}
                          onClick={() => handlePageChange(pagination.page - 1)}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
                            if (page > totalPages) return null;
                            
                            return (
                              <Button
                                key={page}
                                variant={page === pagination.page ? "default" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.page === totalPages}
                          onClick={() => handlePageChange(pagination.page + 1)}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentAction && `${getActionDescription(currentAction.action).charAt(0).toUpperCase() + getActionDescription(currentAction.action).slice(1)} Organización`}
                </DialogTitle>
                <DialogDescription>
                  {currentAction && `Estás a punto de ${getActionDescription(currentAction.action)} la organización "${currentAction.organization.name}". Por favor agrega una observación explicando el motivo de esta decisión.`}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="observation">Observación *</Label>
                  <Textarea
                    id="observation"
                    placeholder="Explica el motivo de esta acción..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={confirmAction}
                  disabled={!observation.trim()}
                >
                  Continuar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <ConfirmationModal
            isOpen={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onConfirm={executeAction}
            title="Confirmar Acción"
            description={
              currentAction 
                ? `¿Estás seguro de que quieres ${getActionDescription(currentAction.action)} la organización "${currentAction.organization.name}"? Esta acción se registrará en el historial.`
                : ""
            }
            confirmText="Confirmar"
            cancelText="Cancelar"
          />

          <Dialog open={showObservations} onOpenChange={setShowObservations}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Historial de Observaciones
                </DialogTitle>
                <DialogDescription>
                  {selectedOrganization && `Historial completo de acciones para "${selectedOrganization.name}"`}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {observations.length > 0 ? (
                  observations.map((obs) => (
                    <div key={obs.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                          <Badge variant="outline">{obs.action}</Badge>
                          {obs.previousStatus && (
                            <span className="text-sm text-muted-foreground">
                              {obs.previousStatus} → {obs.newStatus}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(obs.createdAt).toLocaleString('es-ES')}
                        </span>
                      </div>
                      <p className="text-sm">{obs.observation}</p>
                      <p className="text-xs text-muted-foreground">Por: {obs.adminName}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No hay observaciones registradas para esta organización.
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowObservations(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default OrganizationManagementPanel;