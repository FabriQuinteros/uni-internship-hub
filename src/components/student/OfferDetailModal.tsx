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
import { StudentOfferDetail, formatDeadline, getShiftLabel } from '@/types/student-offers';
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

  // Flag para saber si es información parcial
  const isPartialData = (offer as any)?._isPartialData || false;
  const notAvailableLabel = isPartialData ? 'No disponible' : 'No especificado';

  // Obtener nombres de catálogos
  const getModalityName = () => {
    if (!offer) return '';
    const modality = modalities.find(m => m.id === offer.modality_id);
    return modality?.name || offer.modality_name || (offer as any).modality || notAvailableLabel;
  };

  const getLocationName = () => {
    if (!offer) return '';
    const location = locations.find(l => l.id === offer.location_id);
    return location?.name || offer.location_name || (offer as any).location || notAvailableLabel;
  };

  const getPositionName = () => {
    if (!offer) return '';
    const position = positions.find(p => p.id === offer.position_id);
    return position?.name || offer.position_name || (offer as any).position || notAvailableLabel;
  };

  const getDurationName = () => {
    if (!offer) return '';
    const duration = durations.find(d => d.id === offer.duration_id);
    return duration?.name || offer.duration_name || notAvailableLabel;
  };

  const getTechnologies = () => {
    if (!offer) return [];
    // Si no tiene el campo technologies (datos parciales), retornar array vacío
    if (!offer.technologies || !Array.isArray(offer.technologies)) return [];
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
          <>
            <DialogHeader>
              <DialogTitle>
                <Skeleton className="h-8 w-3/4" />
              </DialogTitle>
              <DialogDescription>
                <Skeleton className="h-4 w-1/2" />
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </>
        ) : offer ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-2xl">{offer.title}</DialogTitle>
                  {/* Solo mostrar nombre de empresa si está disponible (cuando postulación es accepted) */}
                  {offer.organization_name ? (
                    <DialogDescription className="text-base mt-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {offer.organization_name}
                    </DialogDescription>
                  ) : (
                    <DialogDescription className="text-base mt-2">
                      Información de la oferta de pasantía
                    </DialogDescription>
                  )}
                  {/* Mostrar rubro de la empresa si está disponible */}
                  {offer.industry && (
                    <Badge 
                      variant="secondary" 
                      className="mt-2 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                    >
                      {offer.industry}
                    </Badge>
                  )}
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
                {/* Alerta cuando es información parcial (oferta cerrada/no disponible) */}
                {isPartialData ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 text-base mb-2">Oferta no disponible</h4>
                      <p className="text-sm text-amber-700 mb-3">
                        Esta oferta ya no está activa o ha sido cerrada. No es posible ver la información.
                      </p>
                      {/* Mostrar solo información básica disponible */}
                      <div className="mt-4 space-y-2 text-sm">
                        {(offer as any).position && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-amber-600" />
                            <span className="text-amber-900"><strong>Posición:</strong> {(offer as any).position}</span>
                          </div>
                        )}
                        {(offer as any).modality && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-amber-600" />
                            <span className="text-amber-900"><strong>Modalidad:</strong> {(offer as any).modality}</span>
                          </div>
                        )}
                        {(offer as any).location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-amber-600" />
                            <span className="text-amber-900"><strong>Ubicación:</strong> {(offer as any).location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Contenido completo cuando la oferta está disponible */}

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
                      {offer.weekly_hours}h/sem • {getShiftLabel(offer.shift)}
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
                </>
                )}
              </div>
            </ScrollArea>

            {/* Botón de postulación - solo mostrar si NO es información parcial */}
            {!isPartialData && (
              <div className="pt-4 border-t">
                {offer.has_applied ? (
                  <>
                    <Button 
                      className="w-full"
                      size="lg"
                      variant="outline"
                      disabled
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Ya te postulaste a esta oferta
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Puedes ver el estado de tu postulación en "Mis Postulaciones"
                    </p>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
