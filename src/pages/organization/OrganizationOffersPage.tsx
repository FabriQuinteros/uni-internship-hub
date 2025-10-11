import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { offerService } from '@/services/offerService';
import { Offer } from '@/types/api';
import { useAuth } from '@/hooks/use-auth';

export default function OrganizationOffersPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const orgID = Number(user?.id) || 1;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await offerService.list(orgID);
        setOffers(data || []);
      } catch (err) {
        console.error('Error loading offers', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Mis Ofertas</h1>
        <button className="btn btn-primary" onClick={() => navigate('/organization/offers/new')}>Crear Oferta</button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="space-y-3">
          {offers.length === 0 && <div>No hay ofertas aún.</div>}
          {offers.map(o => {
            // map status to soft background and text color
            const status = o.status || 'unknown';
            let bg = 'bg-white';
            let text = 'text-muted';
            if (status === 'draft') { bg = 'bg-yellow-50'; text = 'text-amber-800'; }
            else if (status === 'pending') { bg = 'bg-blue-50'; text = 'text-sky-800'; }
            else if (status === 'published' || status === 'active') { bg = 'bg-green-50'; text = 'text-emerald-800'; }
            else if (status === 'rejected' || status === 'declined') { bg = 'bg-red-50'; text = 'text-rose-800'; }
            return (
              <div key={o.id} className={`p-3 border rounded flex items-center justify-between ${bg}`}>
                <div>
                  <div className="font-medium">{o.title || 'Sin título'}</div>
                  <div className={`text-sm ${text}`}>Estado: {status}</div>
                </div>
                <div>
                  {o.status === 'draft' && (
                    <button className="btn btn-link" onClick={() => navigate(`/organization/offers/${o.id}/edit`)}>Editar</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
