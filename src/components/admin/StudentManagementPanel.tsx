import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  Eye, 
  Users, 
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  CheckCircle
} from 'lucide-react';
import { StudentDetailsModal } from './StudentDetailsModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../hooks/use-auth';
import { StudentService } from '../../services/studentService';
import { Student } from '../../types/user';
import { useDebounce } from '../../hooks/use-debounce';

enum StudentAction {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate', 
  SUSPEND = 'suspend',
  APPROVE = 'approve'
}

export const StudentManagementPanel: React.FC = (): JSX.Element => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estados para manejar los datos
  const [students, setStudents] = useState<Student[]>([]);
  //const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [updatingStudents, setUpdatingStudents] = useState<Set<string>>(new Set());
  
  // Estado unificado para las acciones (siguiendo el patrón de OrganizationManagementPanel)
  const [currentAction, setCurrentAction] = useState<{
    student: Student;
    action: StudentAction;
    newStatus: string;
  } | null>(null);
  
  // Estados para filtros y paginación
  const [filters, setFilters] = useState({
    status: 'all',
    university: '',
    career: '',
    search: ''
  });
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.search || '');
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0
  });

  // Calcular páginas totales
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // Funciones para cargar datos
  const loadStudents = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await StudentService.getStudents(filters, pagination.page, pagination.limit);
      console.log('📊 Respuesta del servicio de estudiantes:', response);
      console.log('👥 Cantidad de estudiantes recibidos:', response.students?.length || 0);
      setStudents(response.students || []);
      setPagination(prev => ({ ...prev, total: response.total || 0 }));
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes",
        variant: "destructive"
      });
      console.error('❌ Error loading students:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, toast]);

 /*const loadStats = React.useCallback(async () => {
    try {
      const statsData = await StudentService.getStudentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);*/

  // Cargar datos al montar el componente
  useEffect(() => {
    loadStudents();
    //loadStats();
  }, [loadStudents /*, loadStats*/]);

  // Efecto para manejar búsqueda con debounce
  useEffect(() => {
    if (debouncedSearchTerm !== filters.search) {
      setFilters(prev => ({ ...prev, search: debouncedSearchTerm }));
    }
  }, [debouncedSearchTerm, filters.search]);

  // Funciones auxiliares (siguiendo el patrón de OrganizationManagementPanel)
  const getActionDescription = (action: StudentAction): string => {
    const descriptions = {
      [StudentAction.ACTIVATE]: 'activado',
      [StudentAction.DEACTIVATE]: 'desactivado',
      [StudentAction.SUSPEND]: 'suspendido',
      [StudentAction.APPROVE]: 'aprobado'
    };
    return descriptions[action];
  };

  const getActionVerb = (action: StudentAction): string => {
    const verbs = {
      [StudentAction.ACTIVATE]: 'activar',
      [StudentAction.DEACTIVATE]: 'desactivar',
      [StudentAction.SUSPEND]: 'suspender',
      [StudentAction.APPROVE]: 'aprobar'
    };
    return verbs[action];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { label: 'Activo', variant: 'default' as const },
      'inactive': { label: 'Inactivo', variant: 'secondary' as const },
      'suspended': { label: 'Suspendido', variant: 'destructive' as const },
      'pending': { label: 'Pendiente', variant: 'outline' as const },
      'rejected': { label: 'Rechazado', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Funciones para manejar acciones
  const handleStatusChange = (student: Student, status: string) => {
    let action: StudentAction;
    
    switch (status) {
      case 'active':
        // Determinar si es una aprobación o una reactivación
        action = student.status === 'pending' ? StudentAction.APPROVE : StudentAction.ACTIVATE;
        break;
      case 'inactive':
        action = StudentAction.DEACTIVATE;
        break;
      case 'suspended':
        action = StudentAction.SUSPEND;
        break;
      default:
        return; // No hacer nada si el status no es válido
    }

    setCurrentAction({
      student,
      action,
      newStatus: status
    });
    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    if (!currentAction) return;
    
    const adminId = user?.id;
    if (!adminId) {
      toast({
        title: "Error",
        description: "No se pudo obtener el ID del administrador",
        variant: "destructive"
      });
      return;
    }
    
    const studentId = currentAction.student.id;
    
    // Agregar estudiante a la lista de actualizaciones
    setUpdatingStudents(prev => new Set(prev).add(studentId));
    
    try {
      await StudentService.updateStudentStatus(currentAction.student.id, currentAction.newStatus, adminId);
      await loadStudents(); // Recargar lista
      //await loadStats(); // Actualizar estadísticas
      
      toast({
        title: "Éxito",
        description: `El estudiante ha sido ${getActionDescription(currentAction.action)} correctamente`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    } finally {
      // Remover estudiante de la lista de actualizaciones
      setUpdatingStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
      setShowConfirmModal(false);
      setCurrentAction(null);
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  // Funciones de navegación y filtros
  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: string) => {
    setPagination(prev => ({ ...prev, page: 1, limit: parseInt(newSize) }));
  };

  // Filtrar estudiantes del lado del cliente basado en el filtro seleccionado y búsqueda
  const filteredStudents = React.useMemo(() => {
    let result = students;

    // Filtrar por estado
    if (filters.status !== 'all') {
      result = result.filter(student => student.status === filters.status);
    }

    // Filtrar por búsqueda (nombre, legajo, email)
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase().trim();
      result = result.filter(student => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        const legajo = student.legajo?.toLowerCase() || '';
        const email = student.email.toLowerCase();
        
        return fullName.includes(searchTerm) || 
               legajo.includes(searchTerm) || 
               email.includes(searchTerm);
      });
    }

    return result;
  }, [students, filters.status, filters.search]);

  const getAvailableActions = (student: Student) => {
    const actions = [];
    const isUpdating = updatingStudents.has(student.id);

    // Si está pendiente, mostrar botón de aprobar (CheckCircle)
    if (student.status === 'pending') {
      actions.push({
        action: StudentAction.APPROVE,
        newStatus: 'active',
        label: 'Aprobar',
        icon: CheckCircle,
        variant: 'default' as const
      });
    }
    // Si está suspendido, mostrar botón de reactivar (Play)
    else if (student.status === 'suspended') {
      actions.push({
        action: StudentAction.ACTIVATE,
        newStatus: 'active',
        label: 'Reactivar',
        icon: Play,
        variant: 'default' as const
      });
    } else if (student.status === 'active') {
      // Si está activo, mostrar botón de suspender (Pause)
      actions.push({
        action: StudentAction.SUSPEND,
        newStatus: 'suspended',
        label: 'Suspender',
        icon: Pause,
        variant: 'outline' as const
      });
    }

    return { actions, isUpdating };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Título */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Gestión de Estudiantes</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Administra las cuentas de estudiantes registrados en la plataforma
            </p>
          </div>

          {/* Tarjetas de estadísticas */}
          {/*
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Estudiantes</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats?.active || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">En sistema</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Inactivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">{stats?.inactive || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Deshabilitados</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Suspendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats?.suspended || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Bloqueados</p>
              </CardContent>
            </Card>
          </div> /*}
        
          {/* Filtros y búsqueda */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Búsqueda y Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar estudiante</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="search"
                      placeholder="Nombre, legajo o email..."
                      value={localSearchTerm}
                      onChange={(e) => setLocalSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-64">
                  <Label htmlFor="status">Filtrar por estado</Label>
                  <Select value={filters.status} onValueChange={handleStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="suspended">Suspendidos</SelectItem>
                      <SelectItem value="rejected">Rechazados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de estudiantes */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Estudiantes ({pagination.total})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-lg">Cargando estudiantes...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No hay estudiantes</h3>
                  <p className="text-muted-foreground">
                    No se encontraron estudiantes con los filtros aplicados.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Estudiante</TableHead>
                          <TableHead className="font-semibold">Legajo</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold text-center">Estado</TableHead>
                          <TableHead className="font-semibold text-center w-48">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => {
                          const { actions, isUpdating } = getAvailableActions(student);
                          
                          return (
                            <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell>
                                <div className="font-medium text-foreground">
                                  {student.firstName} {student.lastName}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">
                                  {student.legajo}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {student.email}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {getStatusBadge(student.status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center gap-1 flex-wrap">
                                  {/* Botón de ver detalles */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleViewDetails(student)}
                                    className="text-xs px-2"
                                    title="Ver detalles"
                                  >
                                    👁️
                                  </Button>
                                  
                                  {/* Acciones de estado disponibles */}
                                  {actions.map((action, index) => {
                                    const Icon = action.icon;
                                    return (
                                      <Button
                                        key={index}
                                        size="sm"
                                        variant={action.variant}
                                        onClick={() => handleStatusChange(student, action.newStatus)}
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
                                  })}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación */}
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
                        <span>de {pagination.total} resultados</span>
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

          {/* Modales */}
          <StudentDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            student={selectedStudent}
          />

          <ConfirmationModal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={confirmStatusChange}
            title="Confirmar cambio de estado"
            description={
              currentAction
                ? `¿Estás seguro de que deseas ${getActionVerb(currentAction.action)} la cuenta de ${currentAction.student.firstName} ${currentAction.student.lastName}? Esta acción se registrará en el historial.`
                : ""
            }
            confirmText="Confirmar"
            cancelText="Cancelar"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentManagementPanel;