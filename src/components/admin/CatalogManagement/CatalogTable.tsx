import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { MoreHorizontal, Search, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CatalogItem, CatalogType } from '../../../types/catalog';
import { useCatalogStore } from '../../../store/catalogStore';
import { useToast } from "@/components/ui/use-toast";

// Propiedades del componente CatalogTable
interface CatalogTableProps {
  type: CatalogType;
  onEdit: (item: CatalogItem) => void;
  onDelete: (item: CatalogItem) => void;
}

// Componente de tabla para mostrar catálogos con columnas dinámicas y búsqueda
const CatalogTable: React.FC<CatalogTableProps> = ({
  type,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);

  const allItems = useCatalogStore(state => state.items);

  // Filtrar elementos según el término de búsqueda
  const items = useMemo(() => 
    allItems.filter(item => item.type === type), 
    [allItems, type]
  );

  const filteredItems = useMemo(() =>
    items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) // Añadimos una comprobación para description
    ),
    [items, searchTerm] // Se recalcula si la lista base o el término de búsqueda cambian
  );

  // Manejar clic en botón eliminar
  const handleDeleteClick = (item: CatalogItem) => {
    setItemToDelete(item);
  };

  const { toast } = useToast();
  const updateItemStatus = useCatalogStore(state => state.updateItemStatus)

  // Confirmar eliminación del elemento
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  // Manejar cambio de estado activo/inactivo
  const handleStatusChange = async (item: CatalogItem, checked: boolean) => {
    const newStatus = checked ? 'active' : 'inactive';
    console.log(`[handleStatusChange] Intentando cambiar estado para item ID: ${item.id} a '${newStatus}'`);
    try {
      await updateItemStatus(item, newStatus);
      toast({
        title: "Estado actualizado",
        description: `${item.name} ahora está ${newStatus === 'active' ? 'activo' : 'inactivo'}.`,
      });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado de ${item.name}. Inténtalo de nuevo.`,
        variant: "destructive",
      });
    }
  };

  // Obtener badge de estado según el estado del elemento
  const getStatusBadge = (status: 'active' | 'inactive') => {
    return (
      <Badge variant={status === 'active' ? 'success' : 'secondary'}>
        {status === 'active' ? 'Activo' : 'Inactivo'}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        </div>
      </div>

      {/* Tabla con columnas dinámicas según tipo de catálogo */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Columnas dinámicas según el tipo de catálogo */}
              {type !== 'duration' && type !== 'location' && type !== 'modality' && type !== 'language' && type !== 'role' && <TableHead>Nombre</TableHead>}
              {type !== 'technology' && type !== 'skill' && type !== 'duration' && type !== 'location' && type !== 'modality' && type !== 'language' && type !== 'role' && <TableHead>Descripción</TableHead>}
              {type === 'skill' && <TableHead>Nivel</TableHead>}
              {type === 'duration' && <TableHead>Meses</TableHead>}
              {type === 'location' && <TableHead>Ciudad</TableHead>}
              {type === 'location' && <TableHead>Provincia</TableHead>}
              {type === 'location' && <TableHead>País</TableHead>}
              {type === 'modality' && <TableHead>Modalidad</TableHead>}
              {type === 'language' && <TableHead>Nombre</TableHead>}
              {type === 'language' && <TableHead>Código ISO</TableHead>}
              {type === 'language' && <TableHead>Nivel</TableHead>}
              {type === 'role' && <TableHead>Nombre</TableHead>}
              {type === 'role' && <TableHead>Descripción</TableHead>}
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Renderizado de filas con datos específicos por tipo */}
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                {type !== 'duration' && type !== 'location' && type !== 'modality' && type !== 'language' && type !== 'role' && <TableCell className="font-medium">{item.name}</TableCell>}
                {type !== 'technology' && type !== 'skill' && type !== 'duration' && type !== 'location' && type !== 'modality' && type !== 'language' && type !== 'role' && <TableCell>{item.description}</TableCell>}
                {type === 'skill' && (
                  <TableCell>{(item as any).level}</TableCell>
                )}
                {type === 'duration' && (
                  <TableCell>{(item as any).months}</TableCell>
                )}
                {type === 'location' && (
                  <>
                    <TableCell>{(item as any).city}</TableCell>
                    <TableCell>{(item as any).province}</TableCell>
                    <TableCell>{(item as any).country}</TableCell>
                  </>
                )}
                {type === 'modality' && (
                  <TableCell>{(item as any).type}</TableCell>
                )}
                {type === 'language' && (
                  <>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{(item as any).isoCode}</TableCell>
                    <TableCell>{(item as any).level}</TableCell>
                  </>
                )}
                {type === 'role' && (
                  <>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                  </>
                )}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    <Switch
                      checked={item.status === 'active'}
                      onCheckedChange={(checked) => handleStatusChange(item, checked)}
                      aria-label="Toggle status"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente {itemToDelete?.name} del catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CatalogTable;
