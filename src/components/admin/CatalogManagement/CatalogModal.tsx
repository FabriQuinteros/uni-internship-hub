import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { CatalogType, Technology, Skill } from '../../../types/catalog';
import { TECHNOLOGY_CATEGORIES, SKILL_LEVELS } from '../../../data/mockCatalogData';

interface CatalogModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  type: CatalogType;
  item?: Technology | Skill;
}

const schema = yup.object().shape({
  name: yup.string().required('El nombre es requerido'),
  description: yup.string().required('La descripción es requerida'),
  category: yup.string().when('type', {
    is: 'technology',
    then: (schema) => schema.required('La categoría es requerida'),
  }),
  level: yup.string().when('type', {
    is: 'skill',
    then: (schema) => schema.required('El nivel es requerido'),
  }),
});

const CatalogModal: React.FC<CatalogModalProps> = ({
  open,
  onClose,
  onSubmit,
  type,
  item,
}) => {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      category: (item as Technology)?.category || '',
      level: (item as Skill)?.level || '',
    },
  });

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      id: item?.id || Date.now().toString(),
      status: item?.status || 'active',
      createdAt: item?.createdAt || new Date(),
      updatedAt: new Date(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? 'Editar' : 'Agregar'} {type === 'technology' ? 'Tecnología' : 'Habilidad'}
          </DialogTitle>
          <DialogDescription>
            Complete los detalles del {type === 'technology' ? 'tecnología' : 'habilidad'} a continuación.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ingrese una descripción"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === 'technology' && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TECHNOLOGY_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type === 'skill' && (
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un nivel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SKILL_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {item ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogModal;
