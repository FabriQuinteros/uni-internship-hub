/**
 * Panel de filtros avanzados para la gestión de ofertas del administrador
 * Permite filtrar por múltiples criterios de manera combinada
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { AllOffersFilters, OfferStatus, OFFER_STATUS_CONFIG } from '@/types/admin-offers';
import { catalogService } from '@/services/catalogService';
import { CatalogItem } from '@/types/catalog';

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
  const [modalities, setModalities] = useState<CatalogItem[]>([]);
  const [locations, setLocations] = useState<CatalogItem[]>([]);
  const [durations, setDurations] = useState<CatalogItem[]>([]);
  const [technologies, setTechnologies] = useState<CatalogItem[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);

  // Cargar catálogos al montar
  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    setLoadingCatalogs(true);
    try {
      const [modalitiesData, locationsData, durationsData, technologiesData] = await Promise.all([
        catalogService.list('modalities'),
        catalogService.list('locations'),
        catalogService.list('durations'),
        catalogService.list('technologies'),
      ]);
      
      setModalities(modalitiesData);
      setLocations(locationsData);
      setDurations(durationsData);
      setTechnologies(technologiesData);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    } finally {
      setLoadingCatalogs(false);
    }
  };

  // Contar filtros activos
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'page' || key === 'limit') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  }).length;

  const handleFilterChange = (key: keyof AllOffersFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset page when filters change
    });
  };

  const removeFilter = (key: keyof AllOffersFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange({ ...newFilters, page: 1 });
  };

  const offerStatuses: OfferStatus[] = ['draft', 'pending', 'approved', 'rejected', 'closed'];

  return (
    <div className="space-y-3">
      {/* Botón para expandir/colapsar y contador de filtros */}
      <div className="flex items-center justify-between gap-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtros Avanzados</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-3">
            <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
              {/* Grid de filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Estado */}
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => 
                      handleFilterChange('status', value === 'all' ? undefined : value as OfferStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      {offerStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {OFFER_STATUS_CONFIG[status].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Modalidad */}
                <div className="space-y-2">
                  <Label>Modalidad</Label>
                  <Select
                    value={filters.modality || 'all'}
                    onValueChange={(value) => 
                      handleFilterChange('modality', value === 'all' ? undefined : value)
                    }
                    disabled={loadingCatalogs}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las modalidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las modalidades</SelectItem>
                      {modalities.map((modality) => (
                        <SelectItem key={modality.id} value={modality.name}>
                          {modality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ubicación */}
                <div className="space-y-2">
                  <Label>Ubicación</Label>
                  <Select
                    value={filters.location || 'all'}
                    onValueChange={(value) => 
                      handleFilterChange('location', value === 'all' ? undefined : value)
                    }
                    disabled={loadingCatalogs}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las ubicaciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las ubicaciones</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duración */}
                <div className="space-y-2">
                  <Label>Duración</Label>
                  <Select
                    value={filters.duration || 'all'}
                    onValueChange={(value) => 
                      handleFilterChange('duration', value === 'all' ? undefined : value)
                    }
                    disabled={loadingCatalogs}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las duraciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las duraciones</SelectItem>
                      {durations.map((duration) => (
                        <SelectItem key={duration.id} value={duration.name}>
                          {duration.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha desde */}
                <div className="space-y-2">
                  <Label>Fecha publicación desde</Label>
                  <Input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                  />
                </div>

                {/* Fecha hasta */}
                <div className="space-y-2">
                  <Label>Fecha publicación hasta</Label>
                  <Input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                  />
                </div>
              </div>

              {/* Tecnologías (select múltiple simplificado por ahora) */}
              {technologies.length > 0 && (
                <div className="space-y-2">
                  <Label>Tecnologías</Label>
                  <Select
                    value={filters.technologies?.[0]?.toString() || 'all'}
                    onValueChange={(value) => 
                      handleFilterChange('technologies', value === 'all' ? undefined : [parseInt(value)])
                    }
                    disabled={loadingCatalogs}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las tecnologías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las tecnologías</SelectItem>
                      {technologies.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Botón para limpiar filtros */}
              {activeFiltersCount > 0 && (
                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Limpiar todos los filtros
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Badges de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Estado: {OFFER_STATUS_CONFIG[filters.status].label}
              <button
                onClick={() => removeFilter('status')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.modality && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Modalidad: {filters.modality}
              <button
                onClick={() => removeFilter('modality')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Ubicación: {filters.location}
              <button
                onClick={() => removeFilter('location')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.duration && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Duración: {filters.duration}
              <button
                onClick={() => removeFilter('duration')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.date_from && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Desde: {filters.date_from}
              <button
                onClick={() => removeFilter('date_from')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.date_to && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Hasta: {filters.date_to}
              <button
                onClick={() => removeFilter('date_to')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AllOffersFilterPanel;
