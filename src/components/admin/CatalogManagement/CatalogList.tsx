import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Search, Edit, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { CatalogItem, CatalogType } from '@/types/catalog';
import { useCatalogStore } from '@/store/unifiedCatalogStore';
import { getCatalogConfig, formatFieldValue, getBadgeVariant } from '@/utils/catalogConfig';

interface CatalogListProps {
  type: CatalogType;
  onEdit: (item: CatalogItem) => void;
  onCreateNew: () => void;
}

const CatalogList: React.FC<CatalogListProps> = ({
  type,
  onEdit,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const config = getCatalogConfig(type);
  const { toast } = useToast();

  // Store hooks
  const items = useCatalogStore(state => state.getItems(type));
  const loadingState = useCatalogStore(state => state.loadingState);
  const deleteItem = useCatalogStore(state => state.deleteItem);
  const toggleItemStatus = useCatalogStore(state => state.toggleItemStatus);

  // Filter items based on search term and status
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(item => item.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(item => !item.is_active);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        // Search in name
        if (item.name.toLowerCase().includes(searchLower)) return true;
        
        // Search in additional fields based on catalog type
        const itemData = item as any;
        return config.listFields.some(field => {
          const value = itemData[field.key];
          return value && String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    return filtered;
  }, [items, searchTerm, statusFilter, config.listFields]);

  const handleDeleteClick = (item: CatalogItem) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItem(type, itemToDelete.id);
      toast({
        title: 'Éxito',
        description: `${config.singularLabel} eliminado correctamente`,
      });
      setItemToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al eliminar elemento',
        variant: 'destructive',
      });
    }
  };

  const handleStatusToggle = async (item: CatalogItem, newStatus: boolean) => {
    try {
      await toggleItemStatus(type, item.id, newStatus);
      toast({
        title: 'Estado Actualizado',
        description: `${item.name} ahora está ${newStatus ? 'activo' : 'inactivo'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar estado',
        variant: 'destructive',
      });
    }
  };

  const renderCellValue = (item: CatalogItem, field: typeof config.listFields[0]) => {
    const value = (item as any)[field.key];
    
    if (field.key === 'is_active') {
      return (
        <div className="flex items-center gap-2">
          <Badge variant={getBadgeVariant(value, field.key)}>
            {value ? 'Activo' : 'Inactivo'}
          </Badge>
          <Switch
            checked={value}
            onCheckedChange={(checked) => handleStatusToggle(item, checked)}
            disabled={loadingState.isLoading}
          />
        </div>
      );
    }

    if (field.type === 'badge') {
      return (
        <Badge variant={getBadgeVariant(value, field.key)}>
          {formatFieldValue(value, field.type)}
        </Badge>
      );
    }

    return formatFieldValue(value, field.type);
  };

  if (loadingState.isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Cargando {config.label.toLowerCase()}...</div>
      </div>
    );
  }



  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Buscar ${config.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-[250px]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-8 px-3 py-1 text-sm border border-input bg-background rounded-md"
          >
            <option value="all">Todos los elementos</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>
        </div>

        <Button onClick={onCreateNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar {config.singularLabel}
        </Button>
      </div>

      {/* Results summary */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredItems.length} de {items.length} {config.label.toLowerCase()}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {config.listFields.map((field) => (
                <TableHead key={field.key}>{field.label}</TableHead>
              ))}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={config.listFields.length + 1} 
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchTerm || statusFilter !== 'all' 
                    ? `No se encontraron ${config.label.toLowerCase()} que coincidan con tus filtros.`
                    : `No hay ${config.label.toLowerCase()} disponibles. Crea uno para comenzar.`
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  {config.listFields.map((field) => (
                    <TableCell key={field.key} className={field.key === 'name' ? 'font-medium' : ''}>
                      {renderCellValue(item, field)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(item)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente "{itemToDelete?.name}" de {config.label.toLowerCase()}. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingState.isLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={loadingState.isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CatalogList;