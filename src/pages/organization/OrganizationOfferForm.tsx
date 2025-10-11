import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { catalogService } from '@/services/catalogService';
import { organizationService } from '@/services/organizationService';
import { offerService } from '@/services/offerService';
import { useAuth } from '@/hooks/use-auth';
import { Offer } from '@/types/api';

export default function OrganizationOfferForm() {
  const navigate = useNavigate();
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [durations, setDurations] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [modalities, setModalities] = useState<any[]>([]);
  const [form, setForm] = useState<Partial<Offer>>({ status: 'draft' });
  const [saving, setSaving] = useState(false);
  const [createdOfferId, setCreatedOfferId] = useState<number | null>(null);
  const params = useParams();
  const editingOfferId = params.offerId ? Number(params.offerId) : null;

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
        console.debug('Creating/updating offer payload:', { orgID, offer: form, editingOfferId });
        let created;
        if (editingOfferId) {
          created = await offerService.update(editingOfferId, form, orgID);
        } else {
          created = await offerService.create(form, orgID);
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
            const retry = await offerService.create(form, Number(user?.id || orgID));
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
    const confirmed = confirm('¿Estás seguro que deseas eliminar esta oferta? Esta acción no se puede deshacer.');
    if (!confirmed) return;
    setSaving(true);
    try {
      await offerService.delete(idToDelete, orgID);
      toast({ title: 'Eliminada', description: 'La oferta fue eliminada.' });
      navigate('/organization/offers');
    } catch (err: any) {
      console.error('Error deleting offer', err);
      toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Crear Oferta</h1>
      {/* Contenedor principal con borde y fondo similar al dashboard */}
      <div className="space-y-4 max-w-2xl p-6 border rounded-lg bg-card/50">
        <div>
          <label className="block text-sm font-medium">Puesto</label>
          <select className="mt-1 block w-full" value={form.position_id || ''} onChange={e => handleChange('position_id', Number(e.target.value))}>
            <option value="">-- seleccionar --</option>
            {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Título</label>
          <input className="mt-1 block w-full" value={form.title || ''} onChange={e => handleChange('title', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea className="mt-1 block w-full" value={form.description || ''} onChange={e => handleChange('description', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Requisitos</label>
          <textarea className="mt-1 block w-full" value={form.requirements || ''} onChange={e => handleChange('requirements', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Modalidad</label>
            <select
              className="mt-1 block w-full"
              value={form.modality_id || ''}
              onChange={e => {
                const id = Number(e.target.value);
                handleChange('modality_id', id);
                // map the selected modality name to the backend enum
                const mod = modalities.find(m => m.id === id);
                if (mod && mod.name) {
                  const n = String(mod.name).toLowerCase();
                  let normalized = '';
                  if (n.includes('pres') || n.includes('presencial')) normalized = 'presential';
                  else if (n.includes('hibr') || n.includes('híbr') || n.includes('híbrid') || n.includes('híbrido') || n.includes('hibrido')) normalized = 'hybrid';
                  else if (n.includes('virt') || n.includes('remot') || n.includes('remote') || n.includes('virtual')) normalized = 'remote';
                  // only set modality string if we computed a known normalized value
                  if (normalized) handleChange('modality', normalized);
                }
              }}
            >
              <option value="">-- seleccionar --</option>
              {modalities.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Duración</label>
            <select className="mt-1 block w-full" value={form.duration_id || ''} onChange={e => handleChange('duration_id', Number(e.target.value))}>
              <option value="">-- seleccionar --</option>
              {durations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Ubicación</label>
          <select className="mt-1 block w-full" value={form.location_id || ''} onChange={e => handleChange('location_id', Number(e.target.value))}>
            <option value="">-- seleccionar --</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Remuneración (USD)</label>
          <input type="number" className="mt-1 block w-full" value={form.salary || ''} onChange={e => handleChange('salary', Number(e.target.value))} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tecnologías / Aptitudes</label>
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
            <label className="block text-sm font-medium">Cupos</label>
            <input type="number" className="mt-1 block w-full" value={form.quota || ''} onChange={e => handleChange('quota', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha inicio publicación</label>
            <input type="date" className="mt-1 block w-full" value={form.published_start_date || ''} onChange={e => handleChange('published_start_date', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha límite postulación</label>
            <input type="date" className="mt-1 block w-full" value={form.application_deadline || ''} onChange={e => handleChange('application_deadline', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Carga horaria semanal</label>
            <input type="number" className="mt-1 block w-full" value={form.weekly_hours || ''} onChange={e => handleChange('weekly_hours', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Turno</label>
            <select className="mt-1 block w-full" value={form.shift || ''} onChange={e => handleChange('shift', e.target.value)}>
              <option value="">-- seleccionar --</option>
              <option value="morning">Mañana</option>
              <option value="afternoon">Tarde</option>
              <option value="mixed">Mixto</option>
            </select>
          </div>
        </div>

        {/* Botones en contenedores con borde para hacerlos más visibles */}
        <div className="flex space-x-4 mt-4">
          <div className="p-2 border rounded w-full">
            <button className="w-full btn btn-primary" disabled={saving} onClick={() => handleCreateDraft()}>Guardar como borrador</button>
          </div>
          {/* Mostrar el botón de enviar sólo cuando estamos editando un borrador (o ya tenemos createdOfferId) */}
          {(editingOfferId || createdOfferId) && (
            <div className="p-2 border rounded w-full">
              <button className="w-full btn btn-secondary" disabled={saving || !createdOfferId} onClick={() => handleSend()}>Enviar a aprobación</button>
            </div>
          )}
          {/* Mostrar botón Eliminar sólo si estamos editando un borrador */}
          {editingOfferId && (form.status === 'draft') && (
            <div className="p-2 border rounded w-full">
              <button className="w-full btn btn-destructive" disabled={saving} onClick={() => handleDelete()}>Eliminar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
