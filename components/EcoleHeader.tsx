'use client';

import { useEffect, useState } from 'react';
import { Calendar, School } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

type EcoleHeaderInfo = {
  full_name: string;
  short_name: string | null;
};

type AnneeScolaireDO = {
  id: string;
  label: string;
};

export function EcoleHeader({ clientCode, ecoleId }: { clientCode: string; ecoleId: string }) {
  const [ecole, setEcole] = useState<EcoleHeaderInfo | null>(null);
  const [anneeScolaire, setAnneeScolaire] = useState<AnneeScolaireDO | null>(null);
  const [logoURL, setLogoURL] = useState<string | null>(null);

  useEffect(() => {
    const fetchEcoleHeader = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/detail`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) return;

        const data = await res.json();
        setEcole(data.ecole ?? null);
        setAnneeScolaire(data.anneescolaire ?? null);
        setLogoURL(data.logoURL || null);
      } catch (err) {
        console.error('Failed to load ecole header:', err);
      }
    };

    fetchEcoleHeader();
  }, [clientCode, ecoleId]);

  return (
    <div className="grid grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-4 mb-6 pb-4 border-b border-gray-100">
      <div className="w-14 h-14 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
        {logoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoURL}
            alt={ecole ? `Logo ${ecole.short_name || ecole.full_name}` : 'Logo'}
            className="w-full h-full object-contain"
            onError={() => setLogoURL(null)}
          />
        ) : (
          <School className="w-7 h-7 text-gray-300" />
        )}
      </div>

      <h1 className="text-center text-lg md:text-xl font-bold text-charcoal-secondary truncate" title={ecole?.full_name}>
        {ecole?.full_name}
      </h1>

      <div className="justify-self-end flex items-center gap-1.5 text-sm font-medium text-teal-primary whitespace-nowrap">
        {anneeScolaire?.label && (
          <>
            <Calendar className="w-4 h-4" />
            <span>{anneeScolaire.label}</span>
          </>
        )}
      </div>
    </div>
  );
}
