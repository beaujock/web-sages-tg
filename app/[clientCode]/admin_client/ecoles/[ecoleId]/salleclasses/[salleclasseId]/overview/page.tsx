/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, BookOpen, Users, GraduationCap } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

type OverviewSalleClasseDO = {
    id                      : string;
    code                    : string;
    number_enseignants      : number;
    number_eleves           : number;
};

export default function SalleClasseOverviewPage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string; salleclasseId: string }>;
}) {
  const { clientCode, ecoleId, salleclasseId } = use(params);
  const router = useRouter();

  const [overview, setOverview] = useState<OverviewSalleClasseDO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSalleClasseOverview = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);

        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/${salleclasseId}/overview`, {
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

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur lors de la récupération de l\'aperçu de la classe');

        setOverview(data.overview);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchSalleClasseOverview();
  }, [clientCode, ecoleId, salleclasseId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-teal-primary animate-spin mb-4" />
        <p className="text-gray-500">Chargement de l&apos;aperçu...</p>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
        {error || "La classe n'a pas pu être trouvée."}
      </div>
    );
  }

  const stats = [
    {
      label: 'Enseignants',
      value: overview.number_enseignants,
      icon: Users,
    },
    {
      label: 'Élèves',
      value: overview.number_eleves,
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href={`/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses`}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Retour à la liste des classes"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold text-charcoal-secondary flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-primary" />
            {overview.code}
          </h2>
        </div>

        <Link
          href={`/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/${salleclasseId}`}
          className="inline-flex items-center justify-center px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm font-medium"
        >
          Voir les détails
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-50 rounded-lg">
                <Icon className="w-6 h-6 text-teal-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-charcoal-secondary">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
