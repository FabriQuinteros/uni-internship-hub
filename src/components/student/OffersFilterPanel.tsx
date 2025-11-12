/**
 * Panel de filtros para búsqueda de ofertas (estudiantes)
 * Permite filtrar por tecnologías, modalidad, ubicación, posición y búsqueda por texto
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, RefreshCw } from 'lucide-react';
import { StudentOffersFilters } from '@/types/student-offers';
import { useCatalogStore } from '@/store/unifiedCatalogStore';

interface OffersFilterPanelProps {
  filters: StudentOffersFilters;
  onFiltersChange: (filters: StudentOffersFilters) => void;
  onSearch: (searchTerm: string) => void;
  onClear: () => void;
  loading?: boolean;
}

export const OffersFilterPanel: React.FC<OffersFilterPanelProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  
  // Obtener catálogos del store - usando useMemo para cachear y evitar loops
  const catalogs = useCatalogStore(state => state.catalogs);
  
  const technologies = useMemo(() => 
    catalogs.technologies?.filter(item => item.is_active !== false) || [], 
    [catalogs.technologies]
  );
  
  const modalities = useMemo(() => 
    catalogs.modalities?.filter(item => item.is_active !== false) || [], 
    [catalogs.modalities]
  );
  
  const locations = useMemo(() => 
    catalogs.locations?.filter(item => item.is_active !== false) || [], 
    [catalogs.locations]
  );
  
  const positions = useMemo(() => 
    catalogs.positions?.filter(item => item.is_active !== false) || [], 
    [catalogs.positions]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (key: keyof StudentOffersFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value
    });
  };

  const handleClearAll = () => {
    setSearchTerm('');
    onClear();
  };

  const activeFiltersCount = [
    filters.technology_id,
    filters.modality_id,
    filters.location_id,
    filters.position_id,
    filters.search
  ].filter(Boolean).length;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtros de Búsqueda
            </CardTitle>
            <CardDescription>
              Encuentra la oferta perfecta para ti
            </CardDescription>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} activo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda por texto */}
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <Label htmlFor="search">Buscar ofertas</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Buscar por título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    onSearch('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro por tecnología */}
          <div className="space-y-2">
            <Label htmlFor="technology">Tecnología</Label>
            <Select
              value={filters.technology_id ? String(filters.technology_id) : 'all'}
              onValueChange={(value) => handleFilterChange('technology_id', value === 'all' ? undefined : Number(value))}
              disabled={loading}
            >
              <SelectTrigger id="technology">
                <SelectValue placeholder="Todas las tecnologías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tecnologías</SelectItem>
                {technologies.map((tech) => (
                  <SelectItem key={tech.id} value={String(tech.id)}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por modalidad */}
          <div className="space-y-2">
            <Label htmlFor="modality">Modalidad</Label>
            <Select
              value={filters.modality_id ? String(filters.modality_id) : 'all'}
              onValueChange={(value) => handleFilterChange('modality_id', value === 'all' ? undefined : Number(value))}
              disabled={loading}
            >
              <SelectTrigger id="modality">
                <SelectValue placeholder="Todas las modalidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las modalidades</SelectItem>
                {modalities.map((mod) => (
                  <SelectItem key={mod.id} value={String(mod.id)}>
                    {mod.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por ubicación */}
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Select
              value={filters.location_id ? String(filters.location_id) : 'all'}
              onValueChange={(value) => handleFilterChange('location_id', value === 'all' ? undefined : Number(value))}
              disabled={loading}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Todas las ubicaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ubicaciones</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={String(loc.id)}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por posición */}
          <div className="space-y-2">
            <Label htmlFor="position">Posición</Label>
            <Select
              value={filters.position_id ? String(filters.position_id) : 'all'}
              onValueChange={(value) => handleFilterChange('position_id', value === 'all' ? undefined : Number(value))}
              disabled={loading}
            >
              <SelectTrigger id="position">
                <SelectValue placeholder="Todas las posiciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las posiciones</SelectItem>
                {positions.map((pos) => (
                  <SelectItem key={pos.id} value={String(pos.id)}>
                    {pos.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botones de acción */}
        {activeFiltersCount > 0 && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={loading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
            <Button
              variant="secondary"
              onClick={() => onFiltersChange(filters)}
              disabled={loading}
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
