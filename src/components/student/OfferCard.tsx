/**
 * Tarjeta de oferta para visualización en grid (estudiantes)
 * Muestra información resumida y permite abrir el detalle completo
 */

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Briefcase,
  Users,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { StudentOffer, formatDeadline, getShiftLabel } from '@/types/student-offers';
import { useCatalogStore } from '@/store/unifiedCatalogStore';

interface OfferCardProps {
  offer: StudentOffer;
  onViewDetails: (id: number) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onViewDetails }) => {
  // Obtener catálogos del store unificado con useMemo para cachear
  const catalogs = useCatalogStore(state => state.catalogs);
  
  const technologies = useMemo(() => catalogs.technologies || [], [catalogs.technologies]);
  const modalities = useMemo(() => catalogs.modalities || [], [catalogs.modalities]);
  const locations = useMemo(() => catalogs.locations || [], [catalogs.locations]);
  const positions = useMemo(() => catalogs.positions || [], [catalogs.positions]);
  const durations = useMemo(() => catalogs.durations || [], [catalogs.durations]);

  // Obtener nombres de catálogos
  const getModalityName = () => {
    const modality = modalities.find(m => m.id === offer.modality_id);
    return modality?.name || offer.modality_name || 'No especificado';
  };

  const getLocationName = () => {
    const location = locations.find(l => l.id === offer.location_id);
    return location?.name || offer.location_name || 'No especificado';
  };

  const getPositionName = () => {
    const position = positions.find(p => p.id === offer.position_id);
    return position?.name || offer.position_name || 'No especificado';
  };

  const getDurationName = () => {
    const duration = durations.find(d => d.id === offer.duration_id);
    return duration?.name || offer.duration_name || 'No especificado';
  };

  const getTechnologies = () => {
    return offer.technologies
      .map(techId => technologies.find(t => t.id === techId))
      .filter(Boolean)
      .slice(0, 3); // Mostrar máximo 3 tecnologías
  };

  // Verificar si la oferta está por vencer (menos de 7 días)
  const isClosingSoon = () => {
    const deadline = new Date(offer.application_deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const techs = getTechnologies();
  const remainingTechs = offer.technologies.length - 3;

  return (
    <Card className="shadow-card hover:shadow-floating transition-all duration-300 flex flex-col h-full group">
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base md:text-lg line-clamp-2 group-hover:text-primary transition-colors break-words">
              {offer.title}
            </CardTitle>
            {/* Solo mostrar nombre de empresa si está disponible (cuando postulación es accepted) */}
            {offer.organization_name && (
              <CardDescription className="mt-1 text-xs md:text-sm break-words">
                {offer.organization_name}
              </CardDescription>
            )}
            {/* Mostrar rubro de la empresa si está disponible */}
            {offer.industry && (
              <Badge 
                variant="secondary" 
                className="mt-2 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 text-xs"
              >
                {offer.industry}
              </Badge>
            )}
          </div>
          <div className="flex flex-row sm:flex-col gap-2 shrink-0">
            {offer.has_applied && (
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ya postulado
              </Badge>
            )}
            {isClosingSoon() && !offer.has_applied && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Cierra pronto
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 md:gap-4 p-4 md:p-6 pt-0">
        {/* Descripción */}
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
          {offer.description}
        </p>

        {/* Información principal */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <Briefcase className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{getPositionName()}</span>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm flex-wrap">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MapPin className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{getLocationName()}</span>
            </div>
            <Badge variant="outline" className="shrink-0 text-xs">
              {getModalityName()}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm flex-wrap">
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground shrink-0" />
            <span>{offer.weekly_hours}h/semana</span>
            <span className="text-muted-foreground">• {getShiftLabel(offer.shift)}</span>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm">
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{getDurationName()}</span>
          </div>

          {offer.salary > 0 && (
            <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-primary">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
              <span>${offer.salary.toLocaleString('es-AR')}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs md:text-sm">
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground shrink-0" />
            <span>{offer.quota} {offer.quota === 1 ? 'vacante' : 'vacantes'}</span>
          </div>
        </div>

        {/* Tecnologías */}
        {techs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {techs.map((tech) => (
              <Badge 
                key={tech!.id} 
                variant="secondary" 
                className="text-xs bg-primary/5 text-primary border-primary/20"
              >
                {tech!.name}
              </Badge>
            ))}
            {remainingTechs > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingTechs} más
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 md:pt-4 border-t space-y-2 md:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs md:text-sm">
            <span className="text-muted-foreground">Cierre de postulaciones:</span>
            <span className={`font-medium ${isClosingSoon() ? 'text-destructive' : ''}`}>
              {formatDeadline(offer.application_deadline)}
            </span>
          </div>

          <Button 
            onClick={() => onViewDetails(offer.id)}
            className="w-full text-xs md:text-sm h-9 md:h-10"
            variant={offer.has_applied ? "outline" : "default"}
            disabled={offer.has_applied}
          >
            <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            {offer.has_applied ? 'Ya postulado' : 'Ver Detalles'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
