import React, { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Download, 
  RefreshCw,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

/**
 * Definición de una columna de la tabla
 */
export interface DataGridColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: Array<{ label: string; value: any }>;
}

/**
 * Opciones de filtro activo
 */
export interface ActiveFilter {
  column: string;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
}

/**
 * Configuración de ordenamiento
 */
export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * Props del componente SmartDataGrid
 */
export interface SmartDataGridProps<T = any> {
  data: T[];
  columns: DataGridColumn<T>[];
  loading?: boolean;
  pageSize?: number;
  showPagination?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showExport?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onRowClick?: (record: T, index: number) => void;
  onExport?: (data: T[]) => void;
  className?: string;
  rowKey?: keyof T | ((record: T) => string | number);
  selectable?: boolean;
  onSelectionChange?: (selectedKeys: (string | number)[], selectedRows: T[]) => void;
}

/**
 * Hook personalizado para manejar la paginación
 * @param data - Datos a paginar
 * @param pageSize - Tamaño de página
 */
const usePagination = <T,>(data: T[], pageSize: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const firstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const lastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, data.length),
    totalItems: data.length,
  };
};

/**
 * Componente de filtros avanzados
 * @param columns - Columnas filtrables
 * @param filters - Filtros activos
 * @param onFilterChange - Callback para cambios en filtros
 */
interface FilterPanelProps<T> {
  columns: DataGridColumn<T>[];
  filters: ActiveFilter[];
  onFilterChange: (filters: ActiveFilter[]) => void;
}

const FilterPanel = <T,>({ columns, filters, onFilterChange }: FilterPanelProps<T>) => {
  const filterableColumns = columns.filter(col => col.filterable);

  /**
   * Agrega un nuevo filtro
   */
  const addFilter = (column: string, value: any) => {
    const existingFilterIndex = filters.findIndex(f => f.column === column);
    
    if (existingFilterIndex !== -1) {
      // Actualizar filtro existente
      const newFilters = [...filters];
      newFilters[existingFilterIndex] = { column, value, operator: 'contains' };
      onFilterChange(newFilters);
    } else {
      // Agregar nuevo filtro
      onFilterChange([...filters, { column, value, operator: 'contains' }]);
    }
  };

  /**
   * Elimina un filtro específico
   */
  const removeFilter = (column: string) => {
    onFilterChange(filters.filter(f => f.column !== column));
  };

  /**
   * Limpia todos los filtros
   */
  const clearAllFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Filtros rápidos por columna */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filterableColumns.map((column) => {
          const currentFilter = filters.find(f => f.column === column.key);
          
          return (
            <div key={column.key} className="space-y-2">
              <label className="text-sm font-medium">{column.title}</label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder={`Filtrar por ${column.title.toLowerCase()}`}
                  value={currentFilter?.value || ''}
                  onChange={(e) => addFilter(column.key, e.target.value)}
                  className="text-sm"
                />
                {currentFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(column.key)}
                    className="p-1 h-8 w-8"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros activos */}
      {filters.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Filtros activos:</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Limpiar todos
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const column = filterableColumns.find(col => col.key === filter.column);
              return (
                <Badge
                  key={filter.column}
                  variant="secondary"
                  className="text-xs flex items-center space-x-1"
                >
                  <span>{column?.title}: {filter.value}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(filter.column)}
                    className="p-0 h-auto w-auto ml-1 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * DataGrid inteligente con funcionalidades avanzadas
 * Incluye búsqueda, filtros, ordenamiento, paginación y selección
 */
export const SmartDataGrid = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pageSize = 10,
  showPagination = true,
  showSearch = true,
  showFilters = true,
  showExport = true,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
  onExport,
  className = '',
  rowKey = 'id',
  selectable = false,
  onSelectionChange,
}: SmartDataGridProps<T>) => {
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

  /**
   * Obtiene la clave única de una fila
   */
  const getRowKey = useCallback((record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index;
  }, [rowKey]);

  /**
   * Filtra los datos basado en la búsqueda global y filtros específicos
   */
  const filteredData = useMemo(() => {
    let result = [...data];

    // Búsqueda global
    if (searchTerm) {
      result = result.filter((record) =>
        columns.some((column) => {
          const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Filtros específicos por columna
    filters.forEach((filter) => {
      result = result.filter((record) => {
        const column = columns.find(col => col.key === filter.column);
        const value = column?.dataIndex ? record[column.dataIndex] : record[filter.column];
        const stringValue = String(value).toLowerCase();
        const filterValue = String(filter.value).toLowerCase();

        switch (filter.operator) {
          case 'equals':
            return stringValue === filterValue;
          case 'startsWith':
            return stringValue.startsWith(filterValue);
          case 'endsWith':
            return stringValue.endsWith(filterValue);
          case 'contains':
          default:
            return stringValue.includes(filterValue);
        }
      });
    });

    return result;
  }, [data, searchTerm, filters, columns]);

  /**
   * Ordena los datos filtrados
   */
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.column);
      const aValue = column?.dataIndex ? a[column.dataIndex] : a[sortConfig.column];
      const bValue = column?.dataIndex ? b[column.dataIndex] : b[sortConfig.column];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  // Hook de paginación
  const pagination = usePagination(sortedData, pageSize);

  /**
   * Maneja el ordenamiento de columnas
   */
  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    setSortConfig(current => {
      if (current?.column === columnKey) {
        if (current.direction === 'asc') {
          return { column: columnKey, direction: 'desc' };
        } else {
          return null; // Quitar ordenamiento
        }
      } else {
        return { column: columnKey, direction: 'asc' };
      }
    });
  };

  /**
   * Maneja la selección de filas
   */
  const handleRowSelection = (recordKey: string | number, selected: boolean) => {
    const newSelection = new Set(selectedKeys);
    
    if (selected) {
      newSelection.add(recordKey);
    } else {
      newSelection.delete(recordKey);
    }
    
    setSelectedKeys(newSelection);
    
    if (onSelectionChange) {
      const selectedRows = sortedData.filter((record, index) => 
        newSelection.has(getRowKey(record, index))
      );
      onSelectionChange(Array.from(newSelection), selectedRows);
    }
  };

  /**
   * Selecciona/deselecciona todas las filas de la página actual
   */
  const handleSelectAll = (selected: boolean) => {
    const newSelection = new Set(selectedKeys);
    
    pagination.currentData.forEach((record, index) => {
      const key = getRowKey(record, pagination.startIndex - 1 + index);
      if (selected) {
        newSelection.add(key);
      } else {
        newSelection.delete(key);
      }
    });
    
    setSelectedKeys(newSelection);
    
    if (onSelectionChange) {
      const selectedRows = sortedData.filter((record, index) => 
        newSelection.has(getRowKey(record, index))
      );
      onSelectionChange(Array.from(newSelection), selectedRows);
    }
  };

  /**
   * Exporta los datos filtrados
   */
  const handleExport = () => {
    if (onExport) {
      onExport(sortedData);
    }
  };

  const isAllSelected = pagination.currentData.length > 0 && 
    pagination.currentData.every((record, index) => 
      selectedKeys.has(getRowKey(record, pagination.startIndex - 1 + index))
    );

  const isIndeterminate = pagination.currentData.some((record, index) => 
    selectedKeys.has(getRowKey(record, pagination.startIndex - 1 + index))
  ) && !isAllSelected;

  return (
    <Card className={className}>
      {/* Header con controles */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Datos</CardTitle>
            <CardDescription>
              Mostrando {pagination.startIndex}-{pagination.endIndex} de {pagination.totalItems} elementos
              {selectedKeys.size > 0 && ` (${selectedKeys.size} seleccionados)`}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            {showExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={sortedData.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
            
            {showFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={filters.length > 0 ? 'border-primary' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {filters.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.length}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Barra de búsqueda */}
        {showSearch && (
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Panel de filtros */}
        {showFilterPanel && (
          <FilterPanel
            columns={columns}
            filters={filters}
            onFilterChange={setFilters}
          />
        )}
      </CardHeader>

      {/* Tabla */}
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      // @ts-ignore
                      indeterminate={isIndeterminate}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          {sortConfig?.column === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <SortAsc className="h-3 w-3" />
                            ) : (
                              <SortDesc className="h-3 w-3" />
                            )
                          ) : (
                            <div className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (selectable ? 1 : 0)} 
                    className="text-center py-8"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Cargando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : pagination.currentData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (selectable ? 1 : 0)} 
                    className="text-center py-8 text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                pagination.currentData.map((record, index) => {
                  const actualIndex = pagination.startIndex - 1 + index;
                  const recordKey = getRowKey(record, actualIndex);
                  const isSelected = selectedKeys.has(recordKey);
                  
                  return (
                    <TableRow
                      key={recordKey}
                      className={`${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''} ${isSelected ? 'bg-muted/30' : ''}`}
                      onClick={() => onRowClick?.(record, actualIndex)}
                    >
                      {selectable && (
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleRowSelection(recordKey, checked as boolean)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => {
                        const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
                        return (
                          <TableCell key={column.key}>
                            {column.render ? column.render(value, record, actualIndex) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {showPagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Página {pagination.currentPage} de {pagination.totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.firstPage}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.prevPage}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm">
                {pagination.currentPage}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.nextPage}
                disabled={!pagination.hasNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.lastPage}
                disabled={!pagination.hasNextPage}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartDataGrid;