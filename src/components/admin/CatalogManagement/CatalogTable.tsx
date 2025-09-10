import React, { useState } from 'react';
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

interface CatalogTableProps {
  type: CatalogType;
  onEdit: (item: CatalogItem) => void;
  onDelete: (item: CatalogItem) => void;
}

const CatalogTable: React.FC<CatalogTableProps> = ({
  type,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
  const items = useCatalogStore(state => state.getItems(type));

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (item: CatalogItem) => {
    setItemToDelete(item);
  };

  const { toast } = useToast();
  const { updateItem } = useCatalogStore();

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleStatusChange = (item: CatalogItem, checked: boolean) => {
    const newStatus = checked ? 'active' : 'inactive';
    updateItem(type, item.id, { ...item, status: newStatus });
    toast({
      title: "Estado actualizado",
      description: `${item.name} ahora está ${newStatus === 'active' ? 'activo' : 'inactivo'}.`,
    });
  };

  const getStatusBadge = (status: 'active' | 'inactive') => {
    return (
      <Badge variant={status === 'active' ? 'success' : 'secondary'}>
        {status === 'active' ? 'Activo' : 'Inactivo'}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              {type === 'technology' && <TableHead>Categoría</TableHead>}
              {type === 'skill' && <TableHead>Nivel</TableHead>}
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                {type === 'technology' && (
                  <TableCell>{(item as any).category}</TableCell>
                )}
                {type === 'skill' && (
                  <TableCell>{(item as any).level}</TableCell>
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
