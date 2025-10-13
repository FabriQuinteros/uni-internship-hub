import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HeroButton } from '@/components/ui/button-variants';
import { organizationService } from '@/services/organizationService';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function OrganizationProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  const auth = useAuth();

  useEffect(() => {
    (async () => {
      try {
        // Try to extract userId from auth state (string) and convert to number
        const id = auth.user?.id ? Number(auth.user.id) : undefined;
        const data = await organizationService.getProfile(id);
        setProfile(data);
      } catch (err: any) {
        toast({ title: 'Error al obtener perfil', description: err.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [auth.user]);

  if (loading) return <div>Cargando perfil...</div>;
  if (!profile) return <div>No se encontró el perfil de la organización.</div>;

  const onChange = (field: string, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  const onSave = async () => {
    setSaving(true);
    try {
      // map frontend fields to backend expected payload
      const id = auth.user?.id ? Number(auth.user.id) : undefined;
      const payload = {
        businessName: profile.businessName || profile.businessName || '',
        industry: profile.industry || '',
        website: profile.website || '',
        description: profile.description || '',
        address: profile.address || '',
        mainContact: profile.mainContact || '',
        logoUrl: profile.logoUrl || '',
      };

      await organizationService.update(id, payload as any);
      toast({ title: 'Perfil actualizado', description: 'Los cambios fueron guardados.' });
    } catch (err: any) {
      toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Perfil de la organización</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input value={profile.email || ''} onChange={(e: any) => onChange('email', e.target.value)} />
        </div>
        <div>
          <Label>Nombre de la empresa</Label>
          <Input value={profile.businessName || ''} onChange={(e: any) => onChange('businessName', e.target.value)} />
        </div>
        <div>
          <Label>Industria</Label>
          <Input value={profile.industry || ''} onChange={(e: any) => onChange('industry', e.target.value)} />
        </div>
        <div>
          <Label>Sitio web</Label>
          <Input value={profile.website || ''} onChange={(e: any) => onChange('website', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Descripción</Label>
          <Textarea value={profile.description || ''} onChange={(e: any) => onChange('description', e.target.value)} />
        </div>
        <div>
          <Label>Dirección</Label>
          <Input value={profile.address || ''} onChange={(e: any) => onChange('address', e.target.value)} />
        </div>
        <div>
          <Label>Contacto principal</Label>
          <Input value={profile.mainContact || ''} onChange={(e: any) => onChange('mainContact', e.target.value)} />
        </div>
        <div>
          <Label>Teléfono de contacto</Label>
          <Input value={profile.phone || ''} onChange={(e: any) => onChange('phone', e.target.value)} />
        </div>
      </div>

      <div className="mt-6">
        <HeroButton variant="primary" onClick={onSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </HeroButton>
      </div>
    </div>
  );
}
