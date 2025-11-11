/**
 * Panel de filtros simplificado para la gestión de ofertas del administrador
 * Solo incluye: estado, búsqueda, fecha desde y fecha hasta
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Filter, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { AllOffersFilters, OfferStatus, OFFER_STATUS_CONFIG } from '@/types/admin-offers';

interface AllOffersFilterPanelProps {
  filters: AllOffersFilters;
  onFiltersChange: (filters: AllOffersFilters) => void;
  onClearFilters: () => void;
}

export const AllOffersFilterPanel: React.FC<AllOffersFilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Estados locales para los filtros
  const [localFilters, setLocalFilters] = useState<AllOffersFilters>(() => ({
    ...filters,
    // Asegurar que tenemos valores válidos para el Select
  }));

  // Sincronizar filtros locales cuando cambien los filtros externos
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  /**
   * Actualiza un filtro específico
   */
  const updateFilter = (key: keyof AllOffersFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  /**
   * Aplica los filtros
   */
  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  /**
   * Limpia todos los filtros
   */
  const clearAllFilters = () => {
    const clearedFilters = {
      page: 1,
      limit: filters.limit || 10
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
    setIsOpen(false);
  };

  /**
   * Cuenta la cantidad de filtros activos
   */
  const activeFiltersCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.date_from) count++;
    if (filters.date_to) count++;
    return count;
  };

  const activeCount = activeFiltersCount();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros avanzados
            {activeCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                {activeCount}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 pt-4">
        <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Filtro por Estado */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Estado</Label>
              <Select
                value={localFilters.status || 'all'}
                onValueChange={(value) => 
                  updateFilter('status', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(OFFER_STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            config.variant === 'secondary' ? 'bg-gray-500' :
                            config.variant === 'destructive' ? 'bg-red-500' :
                            config.variant === 'outline' ? 'bg-green-500' :
                            config.variant === 'success' ? 'bg-green-500' :
                            config.variant === 'warning' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`} 
                        />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Placeholder para mantener el grid */}
            <div></div>
          </div>

          {/* Filtros de Fecha */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date-from">Fecha desde</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date-from"
                  type="date"
                  value={localFilters.date_from || ''}
                  onChange={(e) => updateFilter('date_from', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to">Fecha hasta</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date-to"
                  type="date"
                  value={localFilters.date_to || ''}
                  onChange={(e) => updateFilter('date_to', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
            
            <Button onClick={applyFilters}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AllOffersFilterPanel;