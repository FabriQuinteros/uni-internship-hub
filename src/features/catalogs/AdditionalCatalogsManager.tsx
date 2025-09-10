import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CatalogType, CatalogItem, CatalogItemForm, catalogConfigs } from './types';
import { useCatalog } from './CatalogContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export const AdditionalCatalogsManager: React.FC = () => {
  const { state, dispatch } = useCatalog();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CatalogItemForm>();

  const currentConfig = catalogConfigs[state.activeCatalog];

  // Filtrar items basado en los criterios de búsqueda
  const filteredItems = useMemo(() => {
    return state.items[state.activeCatalog].filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && item.isActive) ||
        (statusFilter === 'inactive' && !item.isActive);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [state.items, state.activeCatalog, searchTerm, categoryFilter, statusFilter]);

  // Categorías únicas para el filtro
  const categories = useMemo(() => {
    if (!currentConfig.hasCategories) return [];
    return Array.from(new Set(
      state.items[state.activeCatalog]
        .map(item => item.category)
        .filter((category): category is string => category !== undefined)
    ));
  }, [state.items, state.activeCatalog, currentConfig.hasCategories]);

  const onSubmit = async (data: CatalogItemForm) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newItem: CatalogItem = {
        id: selectedItem?.id ?? Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: selectedItem?.createdAt ?? new Date(),
        updatedAt: new Date(),
      };

      if (selectedItem) {
        dispatch({
          type: 'UPDATE_ITEM',
          payload: { type: state.activeCatalog, item: newItem }
        });
      } else {
        dispatch({
          type: 'ADD_ITEM',
          payload: { type: state.activeCatalog, item: newItem }
        });
      }

      setIsFormOpen(false);
      reset();
      setSelectedItem(null);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al guardar el item' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleEdit = (item: CatalogItem) => {
    setSelectedItem(item);
    reset({
      name: item.name,
      description: item.description,
      category: item.category,
      isActive: item.isActive,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este item?')) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({
        type: 'DELETE_ITEM',
        payload: { type: state.activeCatalog, itemId }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al eliminar el item' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleToggleStatus = async (itemId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({
        type: 'TOGGLE_ITEM_STATUS',
        payload: { type: state.activeCatalog, itemId }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al cambiar el estado del item' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className="p-6">
      <Tabs
        defaultValue={state.activeCatalog}
        onValueChange={(value) => 
          dispatch({ type: 'SET_ACTIVE_CATALOG', payload: value as CatalogType })
        }
      >
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            {Object.values(CatalogType).map((type) => (
              <TabsTrigger key={type} value={type} className="min-w-[120px]">
                {catalogConfigs[type].displayName}
                <Badge variant="secondary" className="ml-2">
                  {state.items[type].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          <Button onClick={() => {
            setSelectedItem(null);
            reset({});
            setIsFormOpen(true);
          }}>
            Agregar Nuevo
          </Button>
        </div>

        {Object.values(CatalogType).map((type) => (
          <TabsContent key={type} value={type}>
            <div className="space-y-4">
              {state.error && (
                <Alert variant="destructive">
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />

                {currentConfig.hasCategories && (
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select
                  value={statusFilter}
                  onValueChange={(value: 'all' | 'active' | 'inactive') => 
                    setStatusFilter(value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    {currentConfig.allowDescription && (
                      <TableHead>Descripción</TableHead>
                    )}
                    {currentConfig.hasCategories && (
                      <TableHead>Categoría</TableHead>
                    )}
                    <TableHead>Estado</TableHead>
                    <TableHead>Última actualización</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      {currentConfig.allowDescription && (
                        <TableCell>{item.description}</TableCell>
                      )}
                      {currentConfig.hasCategories && (
                        <TableCell>{item.category}</TableCell>
                      )}
                      <TableCell>
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(item.id)}
                          >
                            {item.isActive ? "Desactivar" : "Activar"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Editar" : "Crear"} {currentConfig.displayName}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "El nombre es requerido",
                  minLength: {
                    value: currentConfig.validationRules.minLength,
                    message: `Mínimo ${currentConfig.validationRules.minLength} caracteres`
                  },
                  maxLength: {
                    value: currentConfig.validationRules.maxLength,
                    message: `Máximo ${currentConfig.validationRules.maxLength} caracteres`
                  },
                  pattern: currentConfig.validationRules.allowSpecialChars
                    ? undefined
                    : {
                        value: /^[a-zA-Z0-9\s]+$/,
                        message: "No se permiten caracteres especiales"
                      }
                })}
              />
              {errors.name && (
                <span className="text-sm text-red-500">
                  {errors.name.message}
                </span>
              )}
            </div>

            {currentConfig.allowDescription && (
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                />
              </div>
            )}

            {currentConfig.hasCategories && (
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  {...register("category", {
                    required: currentConfig.hasCategories
                      ? "La categoría es requerida"
                      : false
                  })}
                />
                {errors.category && (
                  <span className="text-sm text-red-500">
                    {errors.category.message}
                  </span>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="isActive">Estado</Label>
              <Select
                defaultValue={selectedItem?.isActive ? "true" : "false"}
                onValueChange={(value) => {
                  const form = document.querySelector('form');
                  if (form) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'isActive';
                    input.value = value;
                    form.appendChild(input);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  reset();
                  setSelectedItem(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {selectedItem ? "Guardar cambios" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
