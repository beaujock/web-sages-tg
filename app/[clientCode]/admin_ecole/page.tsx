/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, DoorOpen, GraduationCap, Loader2, School } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

type OverviewEcoleDO = {
    id                      : string;
    short_name              : string;
    code                    : string;
    annee_scolaire_id       : string;
    annee_scolaire_label    : string;
    number_salles_classes   : number;
    number_eleves           : number;
    // Optional until the API returns them; the header falls back to short_name and a School icon
    full_name?              : string | null;
    logo?                   : string | null;
};

// École logo for the header; falls back to the School icon if missing or broken
function EcoleLogo({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl bg-teal-primary/10 text-teal-primary shrink-0">
        <School className="w-8 h-8 md:w-10 md:h-10" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-xl bg-white border border-gray-100 p-1 shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

export default function AdminEcoleDashboard({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = use(params);
  const router = useRouter();

  const [overview, setOverview] = useState<OverviewEcoleDO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);

        if (!token) {
          router.push(`/${clientCode}/login`);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_ecole`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          if (cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
          router.push(`/${clientCode}/login`);
          return;
        }

        // The API answers 400 with a readable message (e.g. no école, no current school year)
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || 'Erreur lors de la récupération des données du tableau de bord');
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
      title: 'Classes',
      count: overview.number_salles_classes,
      icon: DoorOpen,
      link: `/${clientCode}/admin_ecole/salleclasses`,
      linkText: 'Voir les classes',
    },
    {
      title: 'Élèves',
      count: overview.number_eleves,
      icon: GraduationCap,
      link: `/${clientCode}/admin_ecole/eleves`,
      linkText: 'Voir les élèves',
    },
  ];

  const ecoleName = overview.full_name || overview.short_name || 'École sans nom';

  return (
    <div className="space-y-6">
      {/* École Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 rounded-xl border border-gray-100 bg-linear-to-r from-teal-primary/5 to-transparent">
        <div className="flex items-center gap-4 min-w-0">
          <EcoleLogo src={overview.logo} alt={`Logo de ${ecoleName}`} />
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-charcoal-secondary leading-tight" title={ecoleName}>
              {ecoleName}
            </h1>
            {overview.full_name && overview.short_name && overview.short_name !== overview.full_name && (
              <span className="mt-1 text-sm font-semibold uppercase tracking-wide text-coral-accent truncate">
                {overview.short_name}
              </span>
            )}
          </div>
        </div>

        {overview.annee_scolaire_label && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-primary rounded-lg font-medium self-start md:self-auto shrink-0">
            <CalendarDays className="w-5 h-5 shrink-0" />
            <span>Année scolaire : {overview.annee_scolaire_label}</span>
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold text-charcoal-secondary">Vue d&apos;ensemble</h2>

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
