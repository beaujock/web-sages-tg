/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { School, DoorOpen, ClipboardList, Layers, CalendarDays, ArrowRight, Loader2 } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

type OverviewDO = {
    id                          : string;
    annee_scolaire_id           : string;
    annee_scolaire_label        : string;
    number_ecoles               : number;
    number_salle_classes        : number;
    number_eleve_inscriptions   : number;
    number_modules              : number;
};

export default function AdminClientDashboard({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = use(params);
  const router = useRouter();

  const [overview, setOverview] = useState<OverviewDO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);

        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 400) {
          if (cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
          router.push('/login');
          return;
        }

        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des données du tableau de bord');
        }

        const data = await res.json();
        setOverview(data.overview);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [clientCode, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-teal-primary animate-spin mb-4" />
        <p className="text-gray-500">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
        {error || "Les données du tableau de bord n'ont pas pu être chargées."}
      </div>
    );
  }

  const widgets = [
    {
      title: 'Écoles',
      count: overview.number_ecoles,
      icon: School,
      link: `/${clientCode}/admin_client/ecoles`,
      linkText: 'Voir les écoles',
    },
    {
      title: 'Classes',
      count: overview.number_salle_classes,
      icon: DoorOpen,
      link: `/${clientCode}/admin_client/salleclasses`,
      linkText: 'Voir les salles',
    },
    {
      title: 'Inscriptions',
      count: overview.number_eleve_inscriptions,
      icon: ClipboardList,
      link: `/${clientCode}/admin_client/inscriptions`,
      linkText: 'Voir les inscriptions',
    },
    {
      title: 'Modules',
      count: overview.number_modules,
      icon: Layers,
      link: `/${clientCode}/admin_client/modules`,
      linkText: 'Voir vos modules',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-secondary">Vue d&apos;ensemble</h2>
          <p className="text-sm text-gray-500 mt-1">Environnement client.</p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-primary rounded-lg font-medium">
          <CalendarDays className="w-5 h-5" />
          <span>Année scolaire : {overview.annee_scolaire_label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.map(({ title, count, icon: Icon, link, linkText }) => (
          <div
            key={title}
            className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 flex flex-col justify-between transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
              <div className="p-3 rounded-full bg-teal-50">
                <Icon className="w-6 h-6 text-teal-primary" strokeWidth={2} />
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">{count}</span>
            </div>

            {link && (
              <Link
                href={link}
                className="inline-flex items-center text-sm font-medium text-teal-primary hover:text-[#005f73] transition-colors group"
              >
                {linkText}
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
