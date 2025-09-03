import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  File, 
  Trash2, 
  Download, 
  AlertCircle, 
  CheckCircle2,
  X,
  FileText,
  Image,
  Video,
  Music
} from 'lucide-react';

/**
 * Información de un archivo subido
 */
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string; // Para imágenes
}

/**
 * Configuración de validación de archivos
 */
export interface FileValidation {
  maxSize?: number; // en bytes
  maxFiles?: number;
  acceptedTypes?: string[]; // MIME types
  acceptedExtensions?: string[]; // extensiones de archivo
}

/**
 * Props del componente FileUploadManager
 */
export interface FileUploadManagerProps {
  onUpload: (files: File[]) => Promise<UploadedFile[]>;
  validation?: FileValidation;
  uploadedFiles?: UploadedFile[];
  onRemove?: (fileId: string) => void;
  onDownload?: (file: UploadedFile) => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
  description?: string;
  showPreview?: boolean;
}

/**
 * Convierte bytes a formato legible
 * @param bytes - Cantidad de bytes
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Obtiene el icono apropiado según el tipo de archivo
 * @param fileType - Tipo MIME del archivo
 */
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <Image className="h-8 w-8 text-blue-500" />;
  } else if (fileType.startsWith('video/')) {
    return <Video className="h-8 w-8 text-purple-500" />;
  } else if (fileType.startsWith('audio/')) {
    return <Music className="h-8 w-8 text-green-500" />;
  } else if (fileType === 'application/pdf') {
    return <FileText className="h-8 w-8 text-red-500" />;
  } else {
    return <File className="h-8 w-8 text-gray-500" />;
  }
};

/**
 * Valida un archivo según las reglas especificadas
 * @param file - Archivo a validar
 * @param validation - Reglas de validación
 */
const validateFile = (file: File, validation?: FileValidation): string | null => {
  if (!validation) return null;

  // Validar tamaño
  if (validation.maxSize && file.size > validation.maxSize) {
    return `El archivo es demasiado grande. Máximo: ${formatFileSize(validation.maxSize)}`;
  }

  // Validar tipo MIME
  if (validation.acceptedTypes && !validation.acceptedTypes.includes(file.type)) {
    return `Tipo de archivo no permitido. Permitidos: ${validation.acceptedTypes.join(', ')}`;
  }

  // Validar extensión
  if (validation.acceptedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !validation.acceptedExtensions.includes(`.${extension}`)) {
      return `Extensión no permitida. Permitidas: ${validation.acceptedExtensions.join(', ')}`;
    }
  }

  return null;
};

/**
 * Componente individual para mostrar un archivo subido
 * @param file - Información del archivo
 * @param onRemove - Función para eliminar el archivo
 * @param onDownload - Función para descargar el archivo
 * @param showPreview - Si mostrar vista previa para imágenes
 */
interface FileItemProps {
  file: UploadedFile;
  onRemove?: (fileId: string) => void;
  onDownload?: (file: UploadedFile) => void;
  showPreview?: boolean;
}

const FileItem: React.FC<FileItemProps> = ({ 
  file, 
  onRemove, 
  onDownload, 
  showPreview = true 
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        {/* Icono o preview del archivo */}
        <div className="flex-shrink-0">
          {showPreview && file.type.startsWith('image/') && file.preview ? (
            <img
              src={file.preview}
              alt={file.name}
              className="h-12 w-12 object-cover rounded-md border"
            />
          ) : (
            getFileIcon(file.type)
          )}
        </div>

        {/* Información del archivo */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground truncate">
            {file.name}
          </h4>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
          
          {/* Barra de progreso para archivos en subida */}
          {file.status === 'uploading' && typeof file.progress === 'number' && (
            <Progress value={file.progress} className="mt-2 h-1" />
          )}
          
          {/* Mensaje de error */}
          {file.status === 'error' && file.error && (
            <p className="text-xs text-destructive mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {file.error}
            </p>
          )}
        </div>

        {/* Estado del archivo */}
        <div className="flex items-center space-x-2">
          {file.status === 'success' && (
            <Badge variant="secondary" className="bg-success/10 text-success">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Subido
            </Badge>
          )}
          
          {file.status === 'uploading' && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Upload className="h-3 w-3 mr-1" />
              Subiendo...
            </Badge>
          )}
          
          {file.status === 'error' && (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Error
            </Badge>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-1">
          {file.status === 'success' && onDownload && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onDownload(file)}
              title="Descargar archivo"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(file.id)}
              title="Eliminar archivo"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

/**
 * Gestor avanzado de subida de archivos con drag & drop
 * Incluye validación, preview, progreso y gestión de errores
 */
export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  onUpload,
  validation,
  uploadedFiles = [],
  onRemove,
  onDownload,
  multiple = true,
  disabled = false,
  className = '',
  title = 'Subir Archivos',
  description = 'Arrastra archivos aquí o haz clic para seleccionar',
  showPreview = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * Maneja la subida de archivos seleccionados
   */
  const handleUpload = useCallback(async (files: File[]) => {
    if (disabled || isUploading) return;

    setIsUploading(true);
    setErrors([]);

    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    // Validar cada archivo
    files.forEach((file, index) => {
      const error = validateFile(file, validation);
      if (error) {
        validationErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    // Validar número máximo de archivos
    if (validation?.maxFiles) {
      const totalFiles = uploadedFiles.length + validFiles.length;
      if (totalFiles > validation.maxFiles) {
        validationErrors.push(
          `Máximo ${validation.maxFiles} archivo(s) permitido(s). Actualmente tienes ${uploadedFiles.length}.`
        );
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsUploading(false);
      return;
    }

    try {
      await onUpload(validFiles);
    } catch (error) {
      setErrors(['Error al subir los archivos. Inténtalo de nuevo.']);
    } finally {
      setIsUploading(false);
    }
  }, [disabled, isUploading, validation, uploadedFiles.length, onUpload]);

  /**
   * Configuración de react-dropzone
   */
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop: handleUpload,
    multiple,
    disabled: disabled || isUploading,
    accept: validation?.acceptedTypes ? {
      ...validation.acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
    } : undefined,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false),
  });

  /**
   * Genera el texto de ayuda para tipos de archivo permitidos
   */
  const getAcceptedTypesText = (): string => {
    if (validation?.acceptedExtensions) {
      return `Formatos soportados: ${validation.acceptedExtensions.join(', ')}`;
    }
    if (validation?.acceptedTypes) {
      const types = validation.acceptedTypes.map(type => {
        switch (type) {
          case 'application/pdf': return 'PDF';
          case 'image/*': return 'Imágenes';
          case 'video/*': return 'Videos';
          case 'audio/*': return 'Audio';
          default: return type;
        }
      });
      return `Tipos permitidos: ${types.join(', ')}`;
    }
    return 'Todos los tipos de archivo son permitidos';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zona de drop */}
      <Card 
        {...getRootProps()} 
        className={`
          border-2 border-dashed transition-colors cursor-pointer
          ${isDragActive && !isDragReject ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
        `}
      >
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>
            {isDragActive ? 
              (isDragReject ? 'Algunos archivos no son válidos' : 'Suelta los archivos aquí') : 
              description
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <input {...getInputProps()} />
          
          <Button 
            variant="outline" 
            disabled={disabled || isUploading}
            className="mt-4"
          >
            {isUploading ? 'Subiendo...' : 'Seleccionar Archivos'}
          </Button>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{getAcceptedTypesText()}</p>
            {validation?.maxSize && (
              <p>Tamaño máximo: {formatFileSize(validation.maxSize)}</p>
            )}
            {validation?.maxFiles && (
              <p>Máximo {validation.maxFiles} archivo(s)</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Errores de validación */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de archivos subidos */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Archivos ({uploadedFiles.length})
            </h4>
            {uploadedFiles.filter(f => f.status === 'success').length > 0 && onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  uploadedFiles.forEach(file => {
                    if (file.status === 'success') {
                      onRemove(file.id);
                    }
                  });
                }}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Eliminar todos
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onRemove={onRemove}
                onDownload={onDownload}
                showPreview={showPreview}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadManager;