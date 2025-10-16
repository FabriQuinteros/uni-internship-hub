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
  Shield,
  Calendar,
  Trash2
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
import { useToast } from "@/hooks/use-toast";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useAdminPermissions } from '../../hooks/use-admin-permissions';
import { useOrganizationStore } from '../../store/organizationStore';
import { useDebounce } from '../../hooks/use-debounce';
import OrganizationDetailsModal from './OrganizationDetailsModal';
import AgreementExpiryDatePicker from './AgreementExpiryDatePicker';
import DeleteOrganizationModal from './DeleteOrganizationModal';
import { 
  getAgreementStatusInfo, 
  getDaysUntilExpiry, 
  canOrganizationOperate 
} from '../../utils/organizationValidation';
import { 
  OrganizationListItem as Organization, 
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
    stats,
    setFilters,
    setPagination,
    fetchOrganizations,
    updateOrganizationStatus,
    deleteOrganization,
    fetchStats,
    clearError
  } = useOrganizationStore();

  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    organization: Organization;
    action: OrganizationAction;
    newStatus: OrganizationStatus;
  } | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.search || '');
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  const [updatingOrganizations, setUpdatingOrganizations] = useState<Set<string>>(new Set());
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [pendingActivation, setPendingActivation] = useState<{
    organization: Organization;
    action: OrganizationAction;
    newStatus: OrganizationStatus;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Efecto inicial para cargar datos
  useEffect(() => {
    if (hasPermissions) {
      fetchOrganizations();
      fetchStats();
    }
  }, [hasPermissions]);

  // Efecto para manejar búsqueda con debounce
  useEffect(() => {
    if (debouncedSearchTerm !== filters.search) {
      setFilters({ ...filters, search: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm]);

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
      newFilters.status = status as OrganizationStatus;
    }
    
    setFilters(newFilters);
  };

  const handleAgreementFilter = (agreementStatus: string) => {
    const newFilters: OrganizationFilters = { ...filters };
    
    if (agreementStatus === 'all') {
      delete newFilters.agreementStatus;
    } else {
      newFilters.agreementStatus = agreementStatus as 'valid' | 'expired' | 'no_expiry';
    }
    
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const handlePageSizeChange = (newSize: string) => {
    setFilters({ ...filters, page: 1, limit: parseInt(newSize) });
  };

  const initiateAction = (organization: Organization, action: OrganizationAction, newStatus: OrganizationStatus) => {
    // Si la acción es activar (aprobar o reactivar), mostrar el selector de fecha
    if (newStatus === OrganizationStatus.ACTIVE) {
      setPendingActivation({ organization, action, newStatus });
      setShowExpiryDatePicker(true);
    } else {
      // Para otras acciones, seguir el flujo normal
      setCurrentAction({ organization, action, newStatus });
      setShowActionDialog(true);
    }
  };

  const confirmAction = () => {
    setShowActionDialog(false);
    setShowConfirmation(true);
  };

  const executeAction = async (agreementExpiry?: string, actionData?: typeof currentAction) => {
    console.log('🎯 executeAction called with expiry:', agreementExpiry);
    
    const actionToUse = actionData || currentAction;
    
    if (!actionToUse) {
      console.log('❌ No action data found in executeAction');
      return;
    }

    console.log('✅ Action found:', actionToUse);
    const orgId = actionToUse.organization.id;
    
    // Agregar organización a la lista de actualizaciones
    setUpdatingOrganizations(prev => new Set(prev).add(orgId));
    
    try {
      const requestData = {
        organizationId: orgId,
        newStatus: actionToUse.newStatus,
        adminId: userId,
        agreementExpiry: agreementExpiry
      };
      
      console.log('📤 Sending request to updateOrganizationStatus:', requestData);
      
      await updateOrganizationStatus(requestData);

      console.log('✅ updateOrganizationStatus completed successfully');

      toast({
        title: "Acción completada",
        description: `La organización ha sido ${getActionDescription(actionToUse.action)} exitosamente.`,
      });

      setShowConfirmation(false);
      setCurrentAction(null);
    } catch (error) {
      console.error('❌ Error in executeAction:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la acción. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      // Remover organización de la lista de actualizaciones
      setUpdatingOrganizations(prev => {
        const newSet = new Set(prev);
        newSet.delete(orgId);
        return newSet;
      });
    }
  };

  const handleExpiryDateConfirm = async (expiryDate: string) => {
    console.log('🔄 handleExpiryDateConfirm called with date:', expiryDate);
    if (!pendingActivation) {
      console.log('❌ No pendingActivation found');
      return;
    }

    console.log('✅ pendingActivation found:', pendingActivation);
    
    // Ejecutar la acción directamente con los datos pendientes
    console.log('🚀 About to execute action...');
    await executeAction(expiryDate, pendingActivation);
    
    // Limpiar estados
    setPendingActivation(null);
    setShowExpiryDatePicker(false);
    console.log('✨ Cleanup completed');
  };

  const handleExpiryDateCancel = () => {
    setPendingActivation(null);
    setShowExpiryDatePicker(false);
  };

  const handleDeleteOrganization = (organization: Organization) => {
    setOrganizationToDelete(organization);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!organizationToDelete) return;

    setIsDeleting(true);
    try {
      // Llamada simple al backend (solo ID)
      await deleteOrganization(organizationToDelete.id);

      toast({
        title: "Organización eliminada",
        description: `La organización "${organizationToDelete.name}" ha sido eliminada exitosamente.`,
      });

      setShowDeleteModal(false);
      setOrganizationToDelete(null);
      
      // Refrescar estadísticas después de eliminar
      await fetchStats();
      
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la organización. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setOrganizationToDelete(null);
  };

  const handleViewDetails = (organizationId: string) => {
    setSelectedOrganizationId(organizationId);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrganizationId(null);
  };

  const getActionDescription = (action: OrganizationAction): string => {
    const descriptions = {
      [OrganizationAction.APPROVE]: 'aprobada',
      [OrganizationAction.REJECT]: 'rechazada',
      [OrganizationAction.SUSPEND]: 'suspendida',
      [OrganizationAction.REACTIVATE]: 'reactivada'
    };
    return descriptions[action];
  };

  const getStatusBadge = (status: OrganizationStatus) => {
    const statusConfig = {
      [OrganizationStatus.PENDING]: { label: 'Pendiente', variant: 'secondary' as const },
      [OrganizationStatus.ACTIVE]: { label: 'Activa', variant: 'default' as const },
      [OrganizationStatus.REJECTED]: { label: 'Rechazada', variant: 'destructive' as const },
      [OrganizationStatus.SUSPENDED]: { label: 'Suspendida', variant: 'outline' as const }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getConvenioInfo = (org: Organization) => {
    // Si la organización no está activa, mostrar N/A
    if (org.status !== OrganizationStatus.ACTIVE) {
      return (
        <div className="text-center text-muted-foreground">
          <span className="text-xs">N/A</span>
        </div>
      );
    }

    const agreementInfo = getAgreementStatusInfo(org);
    const daysUntilExpiry = getDaysUntilExpiry(org);
    const canOperate = canOrganizationOperate(org);

    return (
      <div className="text-center space-y-1">
        {/* Fecha de expiración */}
        <div className="flex items-center justify-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="text-xs font-mono">
            {org.agreementExpiry 
              ? new Date(org.agreementExpiry).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: '2-digit', 
                  day: '2-digit'
                })
              : 'Sin fecha'
            }
          </span>
        </div>
        
        {/* Estado del convenio */}
        <div>
          <Badge 
            variant={
              agreementInfo.status === 'expired' ? 'destructive' :
              agreementInfo.status === 'valid' ? 'default' : 'outline'
            }
            className={`text-xs ${
              agreementInfo.status === 'valid' ? 'bg-green-600' :
              agreementInfo.status === 'expired' ? '' :
              daysUntilExpiry && daysUntilExpiry <= 30 && daysUntilExpiry > 0 ? 'text-orange-600 border-orange-600' : ''
            }`}
          >
            {agreementInfo.status === 'expired' ? 'Vencido' :
             agreementInfo.status === 'valid' && daysUntilExpiry && daysUntilExpiry <= 30 && daysUntilExpiry > 0 ? 
               `${daysUntilExpiry}d restantes` :
             agreementInfo.label
            }
          </Badge>
        </div>

        {/* Indicador de si puede operar */}
        {!canOperate && (
          <div className="text-xs text-red-600 font-medium">
            No puede operar
          </div>
        )}
      </div>
    );
  };

  const getAvailableActions = (organization: Organization) => {
    const actions = [];

      switch (organization.status) {
      case OrganizationStatus.PENDING:
        actions.push(
          { action: OrganizationAction.APPROVE, newStatus: OrganizationStatus.ACTIVE, label: 'Aprobar', icon: CheckCircle, variant: 'default' as const },
          { action: OrganizationAction.REJECT, newStatus: OrganizationStatus.REJECTED, label: 'Rechazar', icon: XCircle, variant: 'destructive' as const }
        );
        break;
      case OrganizationStatus.ACTIVE:
        actions.push(
          { action: OrganizationAction.SUSPEND, newStatus: OrganizationStatus.SUSPENDED, label: 'Suspender', icon: Pause, variant: 'outline' as const }
        );
        break;
      case OrganizationStatus.SUSPENDED:
        actions.push(
          { action: OrganizationAction.REACTIVATE, newStatus: OrganizationStatus.ACTIVE, label: 'Reactivar', icon: Play, variant: 'default' as const }
        );
        break;
      case OrganizationStatus.REJECTED:
        actions.push(
          { action: OrganizationAction.REACTIVATE, newStatus: OrganizationStatus.PENDING, label: 'Revisar', icon: Play, variant: 'secondary' as const }
        );
        break;
    }    return actions;
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
                <div className="text-3xl font-bold text-foreground">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Organizaciones</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats?.pending || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Por revisar</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aprobadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats?.approved || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Activas</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rechazadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats?.rejected || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Denegadas</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Suspendidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">{stats?.suspended || 0}</div>
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
                      value={localSearchTerm}
                      onChange={(e) => setLocalSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="status">Estado de Cuenta</Label>
                  <Select value={filters.status || 'all'} onValueChange={handleStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value={OrganizationStatus.PENDING}>Pendientes</SelectItem>
                      <SelectItem value={OrganizationStatus.ACTIVE}>Activas</SelectItem>
                      <SelectItem value={OrganizationStatus.REJECTED}>Rechazadas</SelectItem>
                      <SelectItem value={OrganizationStatus.SUSPENDED}>Suspendidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="agreement">Estado de Convenio</Label>
                  <Select value={filters.agreementStatus || 'all'} onValueChange={handleAgreementFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="valid">Vigente</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                      <SelectItem value="no_expiry">Sin vencimiento</SelectItem>
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
              ) : (organizations?.length || 0) === 0 ? (
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
                          <TableHead className="font-semibold text-center">Estado</TableHead>
                          <TableHead className="font-semibold text-center">Convenio</TableHead>
                          <TableHead className="font-semibold text-center w-48">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(organizations || []).map((org) => (
                          <TableRow key={org.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-foreground">{org.name}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {org.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(org.status)}
                            </TableCell>
                            <TableCell className="text-center">
                              {getConvenioInfo(org)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-1 flex-wrap">
                                {/* Botón de ver detalles */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewDetails(org.id)}
                                  className="text-xs px-2"
                                  title="Ver detalles"
                                >
                                  👁️
                                </Button>
                                
                                {/* Acciones de estado disponibles */}
                                {(() => {
                                  const actions = getAvailableActions(org);
                                  const isUpdating = updatingOrganizations.has(org.id);
                                  
                                  return actions.map((action, index) => {
                                    const Icon = action.icon;
                                    return (
                                      <Button
                                        key={index}
                                        size="sm"
                                        variant={action.variant}
                                        onClick={() => initiateAction(org, action.action, action.newStatus)}
                                        disabled={isUpdating}
                                        className="text-xs px-2"
                                        title={action.label}
                                      >
                                        {isUpdating ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                                        ) : (
                                          <Icon className="h-3 w-3" />
                                        )}
                                      </Button>
                                    );
                                  });
                                })()}

                                {/* Botón de eliminar - siempre disponible para admin */}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteOrganization(org)}
                                  className="text-xs px-2"
                                  title="Eliminar organización"
                                  disabled={updatingOrganizations.has(org.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
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
                          value={(filters.limit || 25).toString()} 
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
                          disabled={(filters.page || 1) === 1}
                          onClick={() => handlePageChange((filters.page || 1) - 1)}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const currentPage = filters.page || 1;
                            const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                            if (page > totalPages) return null;
                            
                            return (
                              <Button
                                key={page}
                                variant={page === currentPage ? "default" : "outline"}
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
                          disabled={(filters.page || 1) === totalPages}
                          onClick={() => handlePageChange((filters.page || 1) + 1)}
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
                  {currentAction && `¿Estás seguro de que quieres ${getActionDescription(currentAction.action)} la organización "${currentAction.organization.name}"?`}
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={confirmAction}
                >
                  Confirmar
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

          <OrganizationDetailsModal
            isOpen={showDetailsModal}
            onClose={closeDetailsModal}
            organizationId={selectedOrganizationId}
          />

          <AgreementExpiryDatePicker
            isOpen={showExpiryDatePicker}
            onClose={handleExpiryDateCancel}
            onConfirm={handleExpiryDateConfirm}
            organizationName={pendingActivation?.organization.name || ''}
          />

          <DeleteOrganizationModal
            isOpen={showDeleteModal}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            organization={organizationToDelete}
            isDeleting={isDeleting}
          />

        </div>
      </div>
    </div>
  );
};

export default OrganizationManagementPanel;