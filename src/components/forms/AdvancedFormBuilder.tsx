import React from 'react';
import { useForm, Controller, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

/**
 * Tipos de campos soportados por el constructor de formularios
 */
export type FieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'date';

/**
 * Opciones para campos select y radio
 */
export interface FieldOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * Condición para mostrar un campo dinámicamente
 */
export interface FieldCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'includes' | 'not_includes';
  value: any;
}

/**
 * Configuración de un campo individual del formulario
 */
export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: FieldOption[];
  condition?: FieldCondition;
  validation?: z.ZodType<any>;
  gridCols?: number; // Para layout en grid (1-12)
}

/**
 * Configuración de una sección del formulario
 */
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

/**
 * Props del constructor de formularios avanzado
 */
export interface AdvancedFormBuilderProps<T extends FieldValues> {
  sections: FormSection[];
  schema: z.ZodType<T>;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  submitText?: string;
  isLoading?: boolean;
  showProgress?: boolean;
  className?: string;
}

/**
 * Hook para validar condiciones de campos dinámicos
 * @param condition - Condición a evaluar
 * @param watchedValues - Valores actuales del formulario
 */
const useFieldCondition = (condition: FieldCondition | undefined, watchedValues: any): boolean => {
  if (!condition) return true;

  const fieldValue = watchedValues[condition.field];

  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'not_equals':
      return fieldValue !== condition.value;
    case 'includes':
      return Array.isArray(fieldValue) 
        ? fieldValue.includes(condition.value)
        : String(fieldValue).includes(condition.value);
    case 'not_includes':
      return Array.isArray(fieldValue) 
        ? !fieldValue.includes(condition.value)
        : !String(fieldValue).includes(condition.value);
    default:
      return true;
  }
};

/**
 * Componente para renderizar un campo individual
 * @param field - Configuración del campo
 * @param form - Instancia del formulario de React Hook Form
 * @param watchedValues - Valores actuales del formulario
 */
interface FieldRendererProps<T extends FieldValues> {
  field: FormField;
  form: UseFormReturn<T>;
  watchedValues: T;
}

const FieldRenderer = <T extends FieldValues>({ 
  field, 
  form, 
  watchedValues 
}: FieldRendererProps<T>) => {
  const { control, formState: { errors } } = form;
  const fieldError = errors[field.name as Path<T>];
  const shouldShow = useFieldCondition(field.condition, watchedValues);

  if (!shouldShow) return null;

  /**
   * Renderiza el input apropiado según el tipo de campo
   */
  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'date':
        return (
          <Controller
            name={field.name as Path<T>}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                type={field.type}
                placeholder={field.placeholder}
                className={fieldError ? 'border-destructive' : ''}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.name as Path<T>}
            control={control}
            render={({ field: formField }) => (
              <Textarea
                {...formField}
                placeholder={field.placeholder}
                className={fieldError ? 'border-destructive' : ''}
                rows={4}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name as Path<T>}
            control={control}
            render={({ field: formField }) => (
              <Select value={formField.value} onValueChange={formField.onChange}>
                <SelectTrigger className={fieldError ? 'border-destructive' : ''}>
                  <SelectValue placeholder={field.placeholder || `Seleccionar ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div>{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.name as Path<T>}
            control={control}
            render={({ field: formField }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.name}
                  checked={formField.value}
                  onCheckedChange={formField.onChange}
                />
                <Label htmlFor={field.name} className="text-sm">
                  {field.label}
                </Label>
              </div>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={field.name as Path<T>}
            control={control}
            render={({ field: formField }) => (
              <RadioGroup value={formField.value} onValueChange={formField.onChange}>
                {field.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                    <Label htmlFor={`${field.name}-${option.value}`} className="text-sm">
                      {option.label}
                      {option.description && (
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-2 ${field.gridCols ? `col-span-${field.gridCols}` : ''}`}>
      {field.type !== 'checkbox' && (
        <Label htmlFor={field.name} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      {renderInput()}
      
      {field.description && (
        <p className="text-xs text-muted-foreground flex items-center space-x-1">
          <Info className="h-3 w-3" />
          <span>{field.description}</span>
        </p>
      )}
      
      {fieldError && (
        <p className="text-xs text-destructive flex items-center space-x-1">
          <AlertCircle className="h-3 w-3" />
          <span>{fieldError.message as string}</span>
        </p>
      )}
    </div>
  );
};

/**
 * Constructor de formularios avanzado con validaciones dinámicas
 * Permite crear formularios complejos con secciones, campos condicionales y validaciones
 */
export const AdvancedFormBuilder = <T extends FieldValues>({
  sections,
  schema,
  defaultValues,
  onSubmit,
  submitText = 'Enviar',
  isLoading = false,
  showProgress = false,
  className = '',
}: AdvancedFormBuilderProps<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  });

  const { handleSubmit, watch, formState: { errors, isValid, dirtyFields } } = form;
  const watchedValues = watch();

  /**
   * Calcula el progreso del formulario basado en campos completados
   */
  const calculateProgress = (): number => {
    const totalFields = sections.reduce((acc, section) => acc + section.fields.length, 0);
    const completedFields = Object.keys(dirtyFields).length;
    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  /**
   * Cuenta la cantidad de errores en el formulario
   */
  const errorCount = Object.keys(errors).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Indicador de progreso */}
      {showProgress && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progreso del formulario</span>
                <span>{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de errores */}
      {errorCount > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Hay {errorCount} error{errorCount > 1 ? 'es' : ''} en el formulario que necesita{errorCount > 1 ? 'n' : ''} ser corregido{errorCount > 1 ? 's' : ''}.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {/* Renderizar secciones */}
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{section.title}</span>
                {section.fields.some(field => errors[field.name as Path<T>]) && (
                  <Badge variant="destructive" className="text-xs">
                    Error
                  </Badge>
                )}
              </CardTitle>
              {section.description && (
                <CardDescription>{section.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.fields.map((field) => (
                  <FieldRenderer
                    key={field.name}
                    field={field}
                    form={form as any}
                    watchedValues={watchedValues}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Botón de envío */}
        <div className="flex items-center justify-end space-x-4">
          <div className="flex items-center space-x-2">
            {isValid && (
              <div className="flex items-center space-x-1 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Formulario válido</span>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !isValid}
            className="min-w-[120px]"
          >
            {isLoading ? 'Procesando...' : submitText}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedFormBuilder;