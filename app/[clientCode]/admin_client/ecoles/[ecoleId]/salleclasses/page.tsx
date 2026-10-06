/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Loader2, BookOpen, Plus, GraduationCap, Link as LinkIcon, Search, Zap } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';
import { LucideIconByName } from '@/components/LucideIconByName';

type OverviewSalleClasseDO = {
    id                       : string;
    code                     : string;
    number_eleves            : number;
};

type InfoMenuItemLinkActionDO = {
    id           : string;
    display_name : string;
    icon_name    : string | null;
    end_route    : string;
    order        : number;
    description  : string | null;
};

// Lowercase and strip accents so the search is case- and accent-insensitive
const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export default function ClassesPage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string }>;
}) {
  const { clientCode, ecoleId } = use(params);

  const [salleClasses, setSalleClasses] = useState<OverviewSalleClasseDO[]>([]);
  const [pageActions, setPageActions] = useState<InfoMenuItemLinkActionDO[]>([]);
  const [classLinks, setClassLinks] = useState<InfoMenuItemLinkActionDO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);

        if (!token) {
          throw new Error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };

        const [resClasses, resActions, resLinks] = await Promise.all([
          fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/actions`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/links`, { method: 'GET', headers })
        ]);

        const data = await resClasses.json();
        if (!resClasses.ok) {
          throw new Error(data.message || 'Erreur lors de la récupération des classes');
        }

        setSalleClasses(data.salleclasses ?? []);

        const actionsData = resActions.ok ? await resActions.json() : [];
        const linksData = resLinks.ok ? await resLinks.json() : [];

        const parsedActions: InfoMenuItemLinkActionDO[] = Array.isArray(actionsData) ? actionsData : actionsData.actions || [];
        setPageActions(parsedActions.sort((a, b) => a.order - b.order));

        const parsedLinks: InfoMenuItemLinkActionDO[] = Array.isArray(linksData) ? linksData : linksData.links || [];
        setClassLinks(parsedLinks.sort((a, b) => a.order - b.order));
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientCode, ecoleId]);

  const salleClassesRoute = `/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses`;

  const searchTerm = normalizeText(search);
  const filteredSalleClasses = salleClasses.filter((salleClasse) =>
    normalizeText(salleClasse.code ?? '').includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 text-teal-primary animate-spin mb-4" />
        <p className="text-gray-500">Chargement des classes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-charcoal-secondary">Liste des classes</h2>

        <div className="flex gap-2 shrink-0">
          {pageActions.length > 0 ? (
            pageActions.map(action => (
              <Link
                key={action.id}
                href={`${salleClassesRoute}${action.end_route}`}
                title={action.description || action.display_name}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm shrink-0"
              >
                <LucideIconByName name={action.icon_name} fallback={Zap} className="w-5 h-5 shrink-0" />
                <span className="font-medium">{action.display_name}</span>
              </Link>
            ))
          ) : (
            <Link
              href={`${salleClassesRoute}/addsalleclasse`}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm shrink-0"
            >
              <Plus className="w-5 h-5 shrink-0" />
              <span className="font-medium">Nouvelle classe</span>
            </Link>
          )}
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {salleClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <BookOpen className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Aucune classe n&apos;est actuellement associée à cette école. Commencez par en ajouter une.
          </p>
          {pageActions.length > 0 && (
            <Link
              href={`${salleClassesRoute}${pageActions[0].end_route}`}
              title={pageActions[0].description || pageActions[0].display_name}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm"
            >
              <LucideIconByName name={pageActions[0].icon_name} fallback={Zap} className="w-5 h-5 shrink-0" />
              <span className="font-medium">{pageActions[0].display_name}</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* ================= SEARCH BAR ================= */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une classe par code..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-charcoal-secondary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-primary/30 focus:border-teal-primary"
            />
          </div>

          {filteredSalleClasses.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Aucune classe ne correspond à « {search.trim()} ».
            </p>
          ) : (
        /* ================= CLASSES LIST ================= */
        <div className="flex flex-col space-y-3">
          {filteredSalleClasses.map((salleClasse) => (
            <div
              key={salleClasse.id}
              className="flex flex-col xl:flex-row xl:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-4"
            >
              {/* Class Info */}
              <div className="flex items-center space-x-3 truncate">
                <div className="p-2 bg-teal-primary/10 rounded-lg text-teal-primary shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2 truncate">
                    <h3 className="font-semibold text-charcoal-secondary truncate" title={salleClasse.code}>
                      <Link
                        href={`${salleClassesRoute}/${salleClasse.id}`}
                        className="hover:text-teal-primary hover:underline"
                      >
                        {salleClasse.code || 'Classe sans nom'}
                      </Link>
                    </h3>
                  </div>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1" title="Élèves">
                      <GraduationCap className="w-4 h-4 shrink-0 text-teal-primary" />
                      <span className="font-semibold text-charcoal-secondary">{salleClasse.number_eleves}</span>
                      <span className="hidden sm:inline">élèves</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Action Links */}
              <div className="flex items-center flex-wrap gap-2 shrink-0">
                {classLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={`${salleClassesRoute}/${salleClasse.id}${link.end_route}`}
                    title={link.description || link.display_name}
                    className="group flex items-center space-x-1.5 px-3 py-2 bg-teal-primary/5 border border-teal-primary/30 rounded-lg text-teal-primary hover:bg-teal-primary hover:text-white hover:border-teal-primary transition-colors"
                  >
                    <LucideIconByName name={link.icon_name} fallback={LinkIcon} className="w-4 h-4 shrink-0" />
                    <span className="hidden md:inline text-sm font-medium">{link.display_name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
          )}
        </>
      )}
    </div>
  );
}
