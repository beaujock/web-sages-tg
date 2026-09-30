/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, BookOpen, Info, Calendar, GraduationCap } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

type OverviewSalleClasseDO = {
    id                       : string;
    code                     : string;
    annee_scolaire_id        : string;
    annee_scolaire_label     : string;
    number_eleves            : number;
};

export default function SalleClasseDetailPage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string; salleclasseId: string }>;
}) {
  const { clientCode, ecoleId, salleclasseId } = use(params);
  const router = useRouter();

  const [salleClasse, setSalleClasse] = useState<OverviewSalleClasseDO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSalleClasse = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);

        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/${salleclasseId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        if (res.status === 401) {
          if (cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
          router.push('/login');
          return;
        }

        if (!res.ok) throw new Error('Erreur lors de la récupération des détails de la classe');

        const data = await res.json();
        setSalleClasse(data.salleClasse ?? data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchSalleClasse();
  }, [clientCode, ecoleId, salleclasseId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-teal-primary animate-spin mb-4" />
        <p className="text-gray-500">Chargement des détails...</p>
      </div>
    );
  }

  if (error || !salleClasse) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
        {error || "La classe n'a pas pu être trouvée."}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex items-center space-x-4">
        <Link
          href={`/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses`}
          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          title="Retour à la liste des classes"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-charcoal-secondary flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-primary" />
            {salleClasse.code}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {salleClasse.annee_scolaire_label}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          {/* General Information */}
          <section>
            <h3 className="text-lg font-semibold text-charcoal-secondary border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-400" />
              Informations Générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Code</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 font-mono">
                  {salleClasse.code}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Année scolaire
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 min-h-11.5">
                  {salleClasse.annee_scolaire_label || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  Élèves
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 min-h-11.5 font-semibold">
                  {salleClasse.number_eleves}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
