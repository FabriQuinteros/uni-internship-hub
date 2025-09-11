import React, { useEffect } from 'react';
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
import { CatalogType, Technology, Skill, Duration, Location, Modality, Language, Role } from '../../../types/catalog';
import { TECHNOLOGY_CATEGORIES, SKILL_LEVELS, DURATION_MONTHS, MODALITY_TYPES, LANGUAGE_LEVELS } from '../../../data/mockCatalogData';

// Propiedades del componente CatalogModal
interface CatalogModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  type: CatalogType;
  item?: Technology | Skill | Duration | Location | Modality | Language | Role;
}

// Componente modal para crear/editar elementos de catálogo con validación dinámica
const CatalogModal: React.FC<CatalogModalProps> = ({
  open,
  onClose,
  onSubmit,
  type,
  item,
}) => {
  // Esquema de validación dinámico según el tipo de catálogo
  const schema = yup.object().shape({
    name: yup.string().when([], {
      is: () => type === 'technology' || type === 'skill' || type === 'language' || type === 'role',
      then: (schema) => schema.required('El nombre es requerido'),
    }),
    description: yup.string().when([], {
      is: () => type === 'technology' || type === 'skill' || type === 'role',
      then: (schema) => schema.required('La descripción es requerida'),
    }),
    category: yup.string().when([], {
      is: () => type === 'technology',
      then: (schema) => schema.required('La categoría es requerida'),
    }),
    level: yup.string().when([], {
      is: () => type === 'skill' || type === 'language',
      then: (schema) => schema.required('El nivel es requerido'),
    }),
    months: yup.number().when([], {
      is: () => type === 'duration',
      then: (schema) => schema.required('Los meses son requeridos').min(1, 'Debe ser al menos 1 mes'),
    }),
    city: yup.string().when([], {
      is: () => type === 'location',
      then: (schema) => schema.required('La ciudad es requerida'),
    }),
    province: yup.string().when([], {
      is: () => type === 'location',
      then: (schema) => schema.required('La provincia es requerida'),
    }),
    country: yup.string().when([], {
      is: () => type === 'location',
      then: (schema) => schema.required('El país es requerido'),
    }),
    modalityType: yup.string().when([], {
      is: () => type === 'modality',
      then: (schema) => schema.required('La modalidad es requerida'),
    }),
    isoCode: yup.string().when([], {
      is: () => type === 'language',
      then: (schema) => schema.required('El código ISO es requerido').length(2, 'Debe ser de 2 caracteres'),
    }),
  });

  // Configuración del formulario con valores por defecto según el elemento a editar
  const getDefaultValues = () => {
    const baseValues = {
      name: item?.name || '',
      description: item?.description || '',
    };

    switch (type) {
      case 'technology':
        return {
          ...baseValues,
          category: (item as Technology)?.category || '',
        };
      case 'skill':
        return {
          ...baseValues,
          level: (item as Skill)?.level || '',
        };
      case 'duration':
        return {
          months: (item as Duration)?.months || 1,
        };
      case 'location':
        return {
          city: (item as Location)?.city || '',
          province: (item as Location)?.province || '',
          country: (item as Location)?.country || '',
        };
      case 'modality':
        return {
          modalityType: (item as Modality)?.type || '',
        };
      case 'language':
        return {
          name: item?.name || '',
          isoCode: (item as Language)?.isoCode || '',
          level: (item as Language)?.level || '',
        };
      case 'role':
        return baseValues;
      default:
        return baseValues;
    }
  };

  const form = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues());
    }
  }, [open, type]);

  // Manejar envío del formulario con generación automática de datos según tipo
  const handleFormSubmit = (data: any) => {
    let formData = { ...data };
    
    // Para duración, auto-generar nombre y descripción basados en los meses
    if (type === 'duration') {
      formData.name = `${data.months} ${data.months === 1 ? 'Mes' : 'Meses'}`;
      formData.description = `Duración de ${data.months} ${data.months === 1 ? 'mes' : 'meses'} para pasantías`;
    }
    
    // Para localidad, auto-generar nombre y descripción
    if (type === 'location') {
      formData.name = `${data.city}, ${data.province}`;
      formData.description = `Ubicación en ${data.city}, ${data.province}, ${data.country}`;
    }
    
    // Para modalidad, auto-generar nombre y descripción
    if (type === 'modality') {
      formData.name = data.modalityType;
      formData.description = `Modalidad de trabajo ${data.modalityType.toLowerCase()}`;
      formData.type = data.modalityType;
    }
    
    // Para idioma, generar descripción
    if (type === 'language') {
      formData.description = `Idioma ${data.name}`;
      // El level ya viene en data.level, no necesitamos reasignarlo
    }
    
    onSubmit({
      ...formData,
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
            {item ? 'Editar' : 'Agregar'} {
              type === 'technology' ? 'Tecnología' : 
              type === 'skill' ? 'Habilidad' : 
              type === 'duration' ? 'Duración' :
              type === 'location' ? 'Localidad' :
              type === 'modality' ? 'Modalidad' :
              type === 'language' ? 'Idioma' :
              'Rol'
            }
          </DialogTitle>
          <DialogDescription>
            Complete los detalles de la {
              type === 'technology' ? 'tecnología' : 
              type === 'skill' ? 'habilidad' : 
              type === 'duration' ? 'duración' :
              type === 'location' ? 'localidad' :
              type === 'modality' ? 'modalidad' :
              type === 'language' ? 'idioma' :
              'rol'
            } a continuación.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit, (errors) => {
            // Handle validation errors silently
          })} className="space-y-4">
            {(type === 'technology' || type === 'skill' || type === 'language' || type === 'role') && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder={
                        type === 'technology' ? 'Ej: React, Node.js' :
                        type === 'skill' ? 'Ej: Trabajo en equipo' :
                        type === 'language' ? 'Ej: Español, Inglés' :
                        'Ingrese el nombre'
                      } {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(type === 'technology' || type === 'skill' || type === 'role') && (
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
            )}

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

            {type === 'duration' && (
              <FormField
                control={form.control}
                name="months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meses</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la duración en meses" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DURATION_MONTHS.map((months) => (
                          <SelectItem key={months} value={months.toString()}>
                            {months} {months === 1 ? 'mes' : 'meses'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type === 'location' && (
              <>
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese la ciudad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provincia</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese la provincia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese el país" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {type === 'modality' && (
              <FormField
                control={form.control}
                name="modalityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una modalidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MODALITY_TYPES.map((modality) => (
                          <SelectItem key={modality} value={modality}>
                            {modality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type === 'language' && (
              <>
                <FormField
                  control={form.control}
                  name="isoCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código ISO</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: ES, EN, FR" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          {LANGUAGE_LEVELS.map((level) => (
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
              </>
            )}

            {type === 'role' && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Rol</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Desarrollador Frontend, Analista" {...field} />
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
                          placeholder="Describa las responsabilidades del rol"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit"
              >
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
