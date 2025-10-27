/**
 * Tarjeta de oferta para visualización en lista (estudiantes)
 * Muestra información resumida y permite abrir el detalle completo
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  CheckCircle,
  Building2
} from 'lucide-react';
import { StudentOfferWithApplication, formatDeadline, getShiftLabel, getShiftIcon } from '@/types/student-offers';
import { useCatalogStore } from '@/store/unifiedCatalogStore';

interface OfferCardProps {
  offer: StudentOfferWithApplication;
  onViewDetails: (id: number) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onViewDetails }) => {
  // Obtener catálogos del store unificado con useMemo para cachear
  const catalogs = useCatalogStore(state => state.catalogs);
  
  const technologies = useMemo(() => catalogs.technologies || [], [catalogs.technologies]);

  // Obtener nombres de tecnologías
  const getTechnologies = () => {
    if (!offer.technologies || offer.technologies.length === 0) return [];
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
  const remainingTechs = (offer.technologies?.length || 0) - 3;

  return (
    <Card className="shadow-card hover:shadow-floating transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
              {offer.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="text-sm">{offer.organization_name}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {offer.has_applied && (
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Postulado
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

      <CardContent className="space-y-4">
        {/* Descripción */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {offer.description}
        </p>

        {/* Grid de información principal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Posición */}
          {offer.position_name && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{offer.position_name}</span>
            </div>
          )}

          {/* Ubicación */}
          {offer.location_name && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{offer.location_name}</span>
            </div>
          )}

          {/* Horario */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{offer.weekly_hours}h/sem</span>
          </div>

          {/* Duración */}
          {offer.duration_name && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{offer.duration_name}</span>
            </div>
          )}

          {/* Salario */}
          {offer.salary && offer.salary > 0 && (
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span>${offer.salary.toLocaleString('es-AR')}</span>
            </div>
          )}

          {/* Vacantes */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{offer.quota} {offer.quota === 1 ? 'vacante' : 'vacantes'}</span>
          </div>

          {/* Modalidad */}
          {offer.modality_name && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-xs">
                {offer.modality_name}
              </Badge>
            </div>
          )}

          {/* Turno */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{getShiftIcon(offer.shift)} {getShiftLabel(offer.shift)}</span>
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

        {/* Footer con fecha y botón */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-sm">
            <span className="text-muted-foreground">Cierre: </span>
            <span className={`font-medium ${isClosingSoon() ? 'text-destructive' : ''}`}>
              {formatDeadline(offer.application_deadline)}
            </span>
          </div>

          <Button 
            onClick={() => onViewDetails(offer.id)}
            variant={offer.has_applied ? "outline" : "default"}
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            {offer.has_applied ? 'Ver Estado' : 'Ver Detalles'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
