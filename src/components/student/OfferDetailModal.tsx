/**
 * Modal con detalle completo de una oferta y botón de postulación
 */

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Briefcase,
  Users,
  Send,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { StudentOfferDetail, formatDeadline, getShiftLabel, getShiftIcon } from '@/types/student-offers';
import { useCatalogStore } from '@/store/unifiedCatalogStore';
import { Skeleton } from '@/components/ui/skeleton';

interface OfferDetailModalProps {
  offer: StudentOfferDetail | null;
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  onApply?: (offerId: number) => void;
}

export const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
  offer,
  open,
  onClose,
  loading = false,
  onApply
}) => {
  // Obtener catálogos del store unificado con useMemo para cachear
  const catalogs = useCatalogStore(state => state.catalogs);
  
  const technologies = useMemo(() => catalogs.technologies || [], [catalogs.technologies]);
  const modalities = useMemo(() => catalogs.modalities || [], [catalogs.modalities]);
  const locations = useMemo(() => catalogs.locations || [], [catalogs.locations]);
  const positions = useMemo(() => catalogs.positions || [], [catalogs.positions]);
  const durations = useMemo(() => catalogs.durations || [], [catalogs.durations]);

  if (!offer && !loading) return null;

  // Obtener nombres de catálogos
  const getModalityName = () => {
    if (!offer) return '';
    const modality = modalities.find(m => m.id === offer.modality_id);
    return modality?.name || offer.modality_name || 'No especificado';
  };

  const getLocationName = () => {
    if (!offer) return '';
    const location = locations.find(l => l.id === offer.location_id);
    return location?.name || offer.location_name || 'No especificado';
  };

  const getPositionName = () => {
    if (!offer) return '';
    const position = positions.find(p => p.id === offer.position_id);
    return position?.name || offer.position_name || 'No especificado';
  };

  const getDurationName = () => {
    if (!offer) return '';
    const duration = durations.find(d => d.id === offer.duration_id);
    return duration?.name || offer.duration_name || 'No especificado';
  };

  const getTechnologies = () => {
    if (!offer) return [];
    return offer.technologies
      .map(techId => technologies.find(t => t.id === techId))
      .filter(Boolean);
  };

  // Verificar si la oferta está por vencer (menos de 7 días)
  const isClosingSoon = () => {
    if (!offer) return false;
    const deadline = new Date(offer.application_deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const techs = getTechnologies();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : offer ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-2xl">{offer.title}</DialogTitle>
                  <DialogDescription className="text-base mt-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {offer.organization_name || 'Organización'}
                  </DialogDescription>
                </div>
                {isClosingSoon() && (
                  <Badge variant="destructive" className="shrink-0">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Cierra pronto
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Información rápida */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      Posición
                    </div>
                    <div className="text-sm font-medium">{getPositionName()}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      Ubicación
                    </div>
                    <div className="text-sm font-medium">{getLocationName()}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Duración
                    </div>
                    <div className="text-sm font-medium">{getDurationName()}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Horario
                    </div>
                    <div className="text-sm font-medium">
                      {offer.weekly_hours}h/sem • {getShiftIcon(offer.shift)} {getShiftLabel(offer.shift)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Vacantes
                    </div>
                    <div className="text-sm font-medium">
                      {offer.quota} {offer.quota === 1 ? 'posición' : 'posiciones'}
                    </div>
                  </div>

                  {offer.salary > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        Remuneración
                      </div>
                      <div className="text-sm font-medium text-primary">
                        ${offer.salary.toLocaleString('es-AR')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modalidad */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Modalidad de Trabajo
                  </h4>
                  <Badge variant="secondary" className="text-sm">
                    {getModalityName()}
                  </Badge>
                </div>

                <Separator />

                {/* Descripción */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Descripción de la Oferta
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {offer.description}
                  </p>
                </div>

                <Separator />

                {/* Requisitos */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Requisitos
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {offer.requirements}
                  </p>
                </div>

                {/* Tecnologías */}
                {techs.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">Tecnologías Requeridas</h4>
                      <div className="flex flex-wrap gap-2">
                        {techs.map((tech) => (
                          <Badge 
                            key={tech!.id} 
                            variant="secondary" 
                            className="bg-primary/5 text-primary border-primary/20"
                          >
                            {tech!.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Fechas importantes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="text-xs text-muted-foreground mb-1">Inicio de Publicación</div>
                    <div className="text-sm font-medium">
                      {new Date(offer.published_start_date).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border ${isClosingSoon() ? 'bg-destructive/5 border-destructive/20' : 'bg-card'}`}>
                    <div className="text-xs text-muted-foreground mb-1">Cierre de Postulaciones</div>
                    <div className={`text-sm font-medium ${isClosingSoon() ? 'text-destructive' : ''}`}>
                      {formatDeadline(offer.application_deadline)}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Botón de postulación */}
            <div className="pt-4 border-t">
              <Button 
                onClick={() => onApply && onApply(offer.id)}
                className="w-full"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                Postularme a esta Oferta
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Recibirás una confirmación por email una vez enviada tu postulación
              </p>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
