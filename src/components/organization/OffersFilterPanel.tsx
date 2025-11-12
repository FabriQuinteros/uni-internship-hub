/**
 * Panel de filtros para ofertas de la organización
 * Permite filtrar por estado, tecnología, turno, modalidad, ubicación, duración y fechas
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { OrganizationOffersFilters } from '@/services/offerService';
import { useCatalogStore } from '@/store/unifiedCatalogStore';
import { Location } from '@/types/catalog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface OffersFilterPanelProps {
  filters: OrganizationOffersFilters;
  onFiltersChange: (filters: OrganizationOffersFilters) => void;
  onClearFilters: () => void;
}

export const OffersFilterPanel: React.FC<OffersFilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const catalogs = useCatalogStore(state => state.catalogs);

  // Cargar catálogos al montar
  useEffect(() => {
    const loadAllCatalogs = useCatalogStore.getState().loadAllCatalogs;
    loadAllCatalogs();
  }, []);

  const handleFilterChange = (key: keyof OrganizationOffersFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const clearFilter = (key: keyof OrganizationOffersFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  // Contar filtros activos
  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key as keyof OrganizationOffersFilters] !== undefined
  ).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Card className="shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Filtros</h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtros'}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar filtros
                </Button>
              )}
              
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Mostrar
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Filtros activos (chips) */}
          {hasActiveFilters && !isOpen && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.status && (
                <Badge variant="secondary" className="gap-1">
                  Estado: {getStatusLabel(filters.status)}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => clearFilter('status')}
                  />
                </Badge>
              )}
              {filters.technology && (
                <Badge variant="secondary" className="gap-1">
                  Tecnología: {catalogs.technologies.find(t => t.id === filters.technology)?.name || filters.technology}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => clearFilter('technology')}
                  />
                </Badge>
              )}
              {filters.shift && (
                <Badge variant="secondary" className="gap-1">
                  Turno: {getShiftLabel(filters.shift)}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => clearFilter('shift')}
                  />
                </Badge>
              )}
              {filters.modality && (
                <Badge variant="secondary" className="gap-1">
                  Modalidad: {catalogs.modalities.find(m => m.id === filters.modality)?.name || filters.modality}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => clearFilter('modality')}
                  />
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="gap-1">
                  Ubicación: {catalogs.locations.find(l => l.id === filters.location)?.name || filters.location}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => clearFilter('location')}
                  />
                </Badge>
              )}
              {filters.duration && (
                <Badge variant="secondary" className="gap-1">
                  Duración: {catalogs.durations.find(d => d.id === filters.duration)?.name || filters.duration}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => clearFilter('duration')}
                  />
                </Badge>
              )}
              {(filters.date_from || filters.date_to) && (
                <Badge variant="secondary" className="gap-1">
                  Fechas: {filters.date_from || '...'} - {filters.date_to || '...'}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => {
                      clearFilter('date_from');
                      clearFilter('date_to');
                    }}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="pending_approval">Pendiente de Aprobación</SelectItem>
                    <SelectItem value="approved">Aprobada</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                    <SelectItem value="closed">Cerrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Turno */}
              <div className="space-y-2">
                <Label htmlFor="shift">Turno</Label>
                <Select
                  value={filters.shift || 'all'}
                  onValueChange={(value) => handleFilterChange('shift', value === 'all' ? '' : value)}
                >
                  <SelectTrigger id="shift">
                    <SelectValue placeholder="Todos los turnos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los turnos</SelectItem>
                    <SelectItem value="morning">Mañana</SelectItem>
                    <SelectItem value="afternoon">Tarde</SelectItem>
                    <SelectItem value="night">Noche</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tecnología */}
              <div className="space-y-2">
                <Label htmlFor="technology">Tecnología</Label>
                <Select
                  value={filters.technology?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('technology', value === 'all' ? undefined : Number(value))}
                >
                  <SelectTrigger id="technology">
                    <SelectValue placeholder="Todas las tecnologías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las tecnologías</SelectItem>
                    {catalogs.technologies.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id.toString()}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Modalidad */}
              <div className="space-y-2">
                <Label htmlFor="modality">Modalidad</Label>
                <Select
                  value={filters.modality?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('modality', value === 'all' ? undefined : Number(value))}
                >
                  <SelectTrigger id="modality">
                    <SelectValue placeholder="Todas las modalidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las modalidades</SelectItem>
                    {catalogs.modalities.map((mod) => (
                      <SelectItem key={mod.id} value={mod.id.toString()}>
                        {mod.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Select
                  value={filters.location?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('location', value === 'all' ? undefined : Number(value))}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Todas las ubicaciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ubicaciones</SelectItem>
                    {(catalogs.locations as Location[]).map((loc) => (
                      <SelectItem key={loc.id} value={loc.id.toString()}>
                        {loc.name}, {loc.province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duración */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duración</Label>
                <Select
                  value={filters.duration?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('duration', value === 'all' ? undefined : Number(value))}
                >
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Todas las duraciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las duraciones</SelectItem>
                    {catalogs.durations.map((dur) => (
                      <SelectItem key={dur.id} value={dur.id.toString()}>
                        {dur.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha desde */}
              <div className="space-y-2">
                <Label htmlFor="date_from">Fecha desde</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </div>

              {/* Fecha hasta */}
              <div className="space-y-2">
                <Label htmlFor="date_to">Fecha hasta</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Helpers para labels
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Borrador',
    pending_approval: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    closed: 'Cerrada'
  };
  return labels[status] || status;
}

function getShiftLabel(shift: string): string {
  const labels: Record<string, string> = {
    morning: 'Mañana',
    afternoon: 'Tarde',
    night: 'Noche',
    flexible: 'Flexible'
  };
  return labels[shift] || shift;
}
