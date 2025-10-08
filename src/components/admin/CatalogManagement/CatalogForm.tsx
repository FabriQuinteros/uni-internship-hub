import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { CatalogType, CatalogItem, CreateCatalogRequest, UpdateCatalogRequest } from '@/types/catalog';
import { getCatalogConfig } from '@/utils/catalogConfig';

interface CatalogFormProps {
  type: CatalogType;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCatalogRequest | UpdateCatalogRequest) => Promise<void>;
  editItem?: CatalogItem | null;
  isLoading?: boolean;
}

// Dynamic schema creation based on catalog type
const createFormSchema = (type: CatalogType) => {
  const config = getCatalogConfig(type);
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  config.fields.forEach(field => {
    switch (field.type) {
      case 'text':
      case 'textarea':
        schemaFields[field.name] = field.required
          ? z.string().min(1, `${field.label} es obligatorio`).max(255, `${field.label} debe tener menos de 255 caracteres`)
          : z.string().max(255, `${field.label} debe tener menos de 255 caracteres`).optional();
        break;
      case 'number':
        schemaFields[field.name] = field.required
          ? z.number().min(1, `${field.label} debe ser mayor que 0`)
          : z.number().min(1, `${field.label} debe ser mayor que 0`).optional();
        break;
      case 'select':
        if (field.options) {
          const validValues = field.options.map(opt => opt.value);
          schemaFields[field.name] = field.required
            ? z.enum(validValues as [string, ...string[]])
            : z.enum(validValues as [string, ...string[]]).optional();
        }
        break;
    }
  });

  return z.object(schemaFields);
};

const CatalogForm: React.FC<CatalogFormProps> = ({
  type,
  isOpen,
  onClose,
  onSubmit,
  editItem,
  isLoading = false,
}) => {
  const config = getCatalogConfig(type);
  const isEdit = !!editItem;
  
  const formSchema = createFormSchema(type);
  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: editItem ? {
      name: editItem.name,
      ...(editItem as any), // Type assertion for additional fields
    } : {},
  });

  React.useEffect(() => {
    if (editItem) {
      // Reset form with edit item data
      const formData: Record<string, any> = { name: editItem.name };
      
      // Map additional fields based on catalog type
      config.fields.forEach(field => {
        if (field.name !== 'name' && field.name in editItem) {
          formData[field.name] = (editItem as any)[field.name];
        }
      });
      
      form.reset(formData);
    } else {
      form.reset({});
    }
  }, [editItem, form, config.fields]);

  const handleSubmit = async (data: FormData) => {
    try {
      // Transform form data for API
      const apiData: Record<string, any> = { ...data };
      
      // Convert string numbers to actual numbers
      config.fields.forEach(field => {
        if (field.type === 'number' && typeof data[field.name as keyof FormData] === 'string') {
          apiData[field.name] = parseInt(data[field.name as keyof FormData] as string, 10);
        }
      });

      await onSubmit(apiData as CreateCatalogRequest | UpdateCatalogRequest);
      form.reset();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Form submission error:', error);
    }
  };

  const renderField = (field: typeof config.fields[0]) => {
    switch (field.type) {
      case 'text':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as keyof FormData}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={field.placeholder}
                    {...formField}
                    value={formField.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'textarea':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as keyof FormData}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder}
                    {...formField}
                    value={formField.value || ''}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'number':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as keyof FormData}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={field.placeholder}
                    {...formField}
                    value={formField.value || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                      formField.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as keyof FormData}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  value={formField.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Seleccionar ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Editar ${config.singularLabel}` : `Crear Nuevo ${config.singularLabel}`}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-4">
              {config.fields.map(renderField)}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogForm;