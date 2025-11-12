import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { catalogService } from '@/services/catalogService';
import { organizationService } from '@/services/organizationService';
import { offerService } from '@/services/offerService';
import { useAuth } from '@/hooks/use-auth';
import { Offer } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CloseOfferDialog } from '@/components/organization/CloseOfferDialog';

interface OrganizationOfferFormProps {
  offerId?: number;
  readOnly?: boolean;
  onClose?: () => void;
  onDeleted?: () => void;
  onOfferClosed?: () => void; // Callback cuando se cierra una oferta
}

export default function OrganizationOfferForm(props?: OrganizationOfferFormProps) {
  const navigate = useNavigate();
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [durations, setDurations] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [modalities, setModalities] = useState<any[]>([]);
  const [form, setForm] = useState<Partial<Offer>>({ status: 'draft' });
  const [saving, setSaving] = useState(false);
  const [createdOfferId, setCreatedOfferId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [closeOfferDialogOpen, setCloseOfferDialogOpen] = useState(false);
  const [isClosingOffer, setIsClosingOffer] = useState(false);
  const params = useParams();
  const routeOfferId = params.offerId ? Number(params.offerId) : null;
  const propOfferId = props?.offerId;
  const editingOfferId = propOfferId ?? routeOfferId;
  const isReadOnly = Boolean(props?.readOnly);

  useEffect(() => {
    (async () => {
      try {
        const [techs, pos, durs, locs, mods] = await Promise.all([
          catalogService.list<any>('technologies'),
          catalogService.list<any>('positions'),
          catalogService.list<any>('durations'),
          catalogService.list<any>('locations'),
          catalogService.list<any>('modalities'),
        ]);
        setTechnologies(techs || []);
        setPositions(pos || []);
        setDurations(durs || []);
        setLocations(locs || []);
        setModalities(mods || []);
      } catch (err) {
        console.error('Error loading catalogs', err);
      }
    })();
  }, []);

  // If the route contains an offerId, load it (we assume it's a draft) and prefill the form
  useEffect(() => {
    if (!editingOfferId) return;
    (async () => {
      try {
        const loaded = await offerService.get(editingOfferId);
        if (loaded) {
          setForm(loaded as Partial<Offer>);
          setCreatedOfferId(loaded.id || editingOfferId);
        }
      } catch (err) {
        console.error('Error loading offer', err);
        toast({ title: 'Error', description: 'No se pudo cargar la oferta.', variant: 'destructive' });
      }
    })();
  }, [editingOfferId]);

  const { user } = useAuth();
  const orgID = Number(user?.id) || 1; // toma orgID del usuario autenticado (mock devuelve '2' para empresa@org.com)

  const handleChange = (key: keyof Offer, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Create draft and store createdOfferId so we can send later
  const handleCreateDraft = async () => {
    // Validate orgID
    if (!orgID || Number.isNaN(orgID) || orgID <= 0) {
      toast({
        title: 'Organization ID inválido',
        description: `El id de organización (${orgID}) no es válido. Asegúrate de estar autenticado con una organización cuyo id exista en la base de datos.`,
        variant: 'destructive',
      });
      return null;
    }

    setSaving(true);
      try {
  // Ensure payload includes organization_id in snake_case as backend expects
  const salaryValue = (form.salary == null || String(form.salary).trim() === '') ? 0 : Number(form.salary);
  const payload = { ...(form || {}), organization_id: orgID, salary: salaryValue } as Partial<Offer>;
        console.debug('Creating/updating offer payload:', { orgID, offer: payload, editingOfferId });
        let created;
        if (editingOfferId) {
          created = await offerService.update(editingOfferId, payload, orgID);
        } else {
          created = await offerService.create(payload, orgID);
        }
        setCreatedOfferId(created.id || null);
        toast({ title: 'Borrador guardado', description: 'La oferta fue guardada como borrador.' });
    // Redirect to list after save (both create and update)
    navigate('/organization/offers');
        return created;
      } catch (err: any) {
      console.error('Error saving offer', err);
      const msg = err?.message || String(err);
      // If FK error due to missing organization user, attempt to auto-register (dev flow)
      if (msg.includes('1452') || msg.toLowerCase().includes('foreign key') || msg.toLowerCase().includes('organization_id')) {
        const userEmail = user?.email;
        if (userEmail) {
          try {
            toast({ title: 'Usuario no encontrado en DB', description: `Intentando crear organización ${userEmail} en la base de datos...`, variant: 'default' });
            const devPassword = 'DevPass123!';
            await organizationService.register({ name: user?.name || 'Dev Org', email: userEmail, password: devPassword } as any);
            const retryPayload = { ...(form || {}), organization_id: Number(user?.id || orgID) } as Partial<Offer>;
            const retry = await offerService.create(retryPayload, Number(user?.id || orgID));
            setCreatedOfferId(retry.id || null);
            toast({ title: 'Borrador guardado', description: 'La oferta fue guardada como borrador.' });
            navigate('/organization/offers');
            return retry;
          } catch (regErr: any) {
            console.error('Auto-register failed', regErr);
            toast({ title: 'Registro automático fallido', description: regErr?.message || String(regErr), variant: 'destructive' });
          }
        }
      }
      alert(msg || String(err));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!createdOfferId) {
      toast({ title: 'Guardar primero', description: 'Guarda como borrador antes de enviar a aprobación.', variant: 'destructive' });
      return null;
    }
    setSaving(true);
    try {
      const sent = await offerService.sendToApproval(createdOfferId, orgID);
      toast({ title: 'Enviado', description: 'La oferta fue enviada a aprobación.' });
      navigate('/organization/offers');
      return sent;
    } catch (err: any) {
      console.error('Error sending offer', err);
      const msg = err?.message || String(err);
      toast({ title: 'Error al enviar', description: msg, variant: 'destructive' });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!createdOfferId && !editingOfferId) return;
    const idToDelete = createdOfferId || editingOfferId!;
    
    setSaving(true);
    try {
      await offerService.delete(idToDelete, orgID);
      toast({ title: 'Eliminada', description: 'La oferta fue eliminada.' });
      setDeleteDialogOpen(false); // Cerrar el diálogo
      // If parent provided an onClose or onDeleted handler, use it so we don't force navigation from a modal
      if (props?.onDeleted) props.onDeleted();
      if (props?.onClose) props.onClose();
      else navigate('/organization/offers');
    } catch (err: any) {
      console.error('Error deleting offer', err);
      toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseOffer = async (reason?: string) => {
    if (!createdOfferId && !editingOfferId) return;
    const idToClose = createdOfferId || editingOfferId!;
    
    setIsClosingOffer(true);
    try {
      await offerService.close(idToClose, orgID, reason);
      toast({ title: 'Oferta Cerrada', description: 'La oferta fue cerrada exitosamente.' });
      setCloseOfferDialogOpen(false); // Cerrar el diálogo
      // Llamar callback si existe
      if (props?.onOfferClosed) props?.onOfferClosed();
      if (props?.onClose) props.onClose();
      else navigate('/organization/offers');
    } catch (err: any) {
      console.error('Error closing offer', err);
      toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setIsClosingOffer(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">{isReadOnly ? 'Detalles de la Oferta' : (editingOfferId ? 'Editar Oferta' : 'Crear Oferta')}</h1>

        <div className="space-y-6">
          {/* Sección: Información básica */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-primary">Información básica</CardTitle>
              <CardDescription>Datos principales de la oferta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Puesto</Label>
                <select disabled={isReadOnly} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" value={form.position_id || ''} onChange={e => handleChange('position_id', Number(e.target.value))}>
                  <option value="">-- seleccionar --</option>
                  {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <Label>Título</Label>
                <Input disabled={isReadOnly} value={form.title || ''} onChange={e => handleChange('title', e.target.value)} />
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea disabled={isReadOnly} value={form.description || ''} onChange={e => handleChange('description', e.target.value)} rows={5} />
              </div>

              <div>
                <Label>Requisitos</Label>
                <Textarea disabled={isReadOnly} value={form.requirements || ''} onChange={e => handleChange('requirements', e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Sección: Contrato y modalidad */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-primary">Detalles de la oferta</CardTitle>
              <CardDescription>Modalidad, duración, ubicación y remuneración</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                  <Label>Modalidad</Label>
                  <select disabled={isReadOnly} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" value={form.modality_id || ''} onChange={e => {
                    const id = Number(e.target.value);
                    handleChange('modality_id', id);
                    const mod = modalities.find(m => m.id === id);
                    if (mod && mod.name) {
                      const n = String(mod.name).toLowerCase();
                      let normalized = '';
                      if (n.includes('pres') || n.includes('presencial')) normalized = 'presential';
                      else if (n.includes('hibr') || n.includes('híbr') || n.includes('híbr') || n.includes('hibrido')) normalized = 'hybrid';
                      else if (n.includes('virt') || n.includes('remot') || n.includes('remote') || n.includes('virtual')) normalized = 'remote';
                      if (normalized) handleChange('modality', normalized);
                      else handleChange('modality', String(mod.name));
                    }
                  }}>
                    <option value="">-- seleccionar --</option>
                    {modalities.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                  <div>
                  <Label>Duración</Label>
                  <select disabled={isReadOnly} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" value={form.duration_id || ''} onChange={e => {
                    const id = Number(e.target.value);
                    handleChange('duration_id', id);
                    const sel = durations.find(d => d.id === id);
                    if (sel && sel.name) handleChange('duration', String(sel.name));
                  }}>
                    <option value="">-- seleccionar --</option>
                    {durations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label>Ubicación</Label>
                <select disabled={isReadOnly} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" value={form.location_id || ''} onChange={e => {
                  const id = Number(e.target.value);
                  handleChange('location_id', id);
                  const sel = locations.find(l => l.id === id);
                  if (sel && sel.name) handleChange('location', String(sel.name));
                }}>
                  <option value="">-- seleccionar --</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div>
                <Label>Incentivo económico (opcional)</Label>
                <Input disabled={isReadOnly} type="number" value={form.salary ?? ''} onChange={e => handleChange('salary', e.target.value === '' ? undefined : Number(e.target.value))} />
              </div>
            </CardContent>
          </Card>

          {/* Sección: Aptitudes y logística */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-primary">Tecnologías y logística</CardTitle>
              <CardDescription>Selecciona tecnologías, cupos y fechas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2">Tecnologías / Aptitudes</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto p-2 border rounded">
                  {technologies.map(t => {
                    const checked = (form.technologies || []).includes(t.id);
                    return (
                      <label key={t.id} className="flex items-center space-x-2 p-1 rounded hover:bg-background">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            const current = Array.isArray(form.technologies) ? [...form.technologies] : [];
                            if (e.target.checked) {
                              current.push(t.id);
                            } else {
                              const idx = current.indexOf(t.id);
                              if (idx >= 0) current.splice(idx, 1);
                            }
                            handleChange('technologies', current);
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Cupos</Label>
                  <Input type="number" value={form.quota || ''} onChange={e => handleChange('quota', Number(e.target.value))} />
                </div>
                <div>
                  <Label>Fecha inicio publicación</Label>
                  <Input type="date" value={form.published_start_date || ''} onChange={e => handleChange('published_start_date', e.target.value)} />
                </div>
                <div>
                  <Label>Fecha límite postulación</Label>
                  <Input type="date" value={form.application_deadline || ''} onChange={e => handleChange('application_deadline', e.target.value)} />
                </div>
              </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Carga horaria semanal</Label>
                  <Input disabled={isReadOnly} type="number" value={form.weekly_hours || ''} onChange={e => handleChange('weekly_hours', Number(e.target.value))} />
                </div>
                <div>
                  <Label>Turno</Label>
                  <select disabled={isReadOnly} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" value={form.shift || ''} onChange={e => handleChange('shift', e.target.value)}>
                    <option value="">-- seleccionar --</option>
                    <option value="morning">Mañana</option>
                    <option value="afternoon">Tarde</option>
                    <option value="mixed">Mixto</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex space-x-4 mt-4">
            {!isReadOnly && (
              <div className="flex-1">
                <Button variant="default" className="w-full" disabled={saving} onClick={() => handleCreateDraft()}>Guardar como borrador</Button>
              </div>
            )}

            {!isReadOnly && (editingOfferId || createdOfferId) && (
              <div className="flex-1">
                <Button variant="secondary" className="w-full" disabled={saving || !createdOfferId} onClick={() => handleSend()}>Enviar a aprobación</Button>
              </div>
            )}

            {/* When in read-only (details) mode, show close offer and delete actions */}
            {isReadOnly ? (
              <>
                <div className="flex-1">
                  <Button variant="outline" className="w-full" onClick={() => props?.onClose ? props.onClose() : navigate('/organization/offers')}>Cerrar</Button>
                </div>
                {form.status !== 'closed' && (
                  <div className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
                      onClick={() => setCloseOfferDialogOpen(true)}
                    >
                      Cerrar Oferta
                    </Button>
                  </div>
                )}
                <div className="flex-1">
                  <Button variant="destructive" className="w-full" disabled={saving} onClick={() => setDeleteDialogOpen(true)}>Eliminar</Button>
                </div>
              </>
            ) : (
              editingOfferId && (form.status === 'draft') && (
                <div className="flex-1">
                  <Button variant="destructive" className="w-full" disabled={saving} onClick={() => setDeleteDialogOpen(true)}>Eliminar</Button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar oferta */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la oferta y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para cerrar oferta */}
      <CloseOfferDialog
        open={closeOfferDialogOpen}
        onOpenChange={setCloseOfferDialogOpen}
        onConfirm={handleCloseOffer}
        isLoading={isClosingOffer}
        offerTitle={form.title || 'esta oferta'}
      />
    </div>
  );
}
