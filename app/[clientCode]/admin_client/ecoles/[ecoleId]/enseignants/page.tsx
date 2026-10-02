/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Loader2, UserRound, CalendarDays, Hash, Mail, Phone, Search, Link as LinkIcon, Zap } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';
import { LucideIconByName } from '@/components/LucideIconByName';

type DisplayAnneeScolaireDO = {
    id             : string;
    start_date     : Date;
    end_date       : Date;
    label          : string;
    notes          : string | null;
    create_date    : Date;
    created_by     : string;
    change_date    : Date | null;
    changed_by     : string | null;
};

type DisplayEnseignantDO = {
    id              : string;
    matricule       : string;
    last_name       : string;
    first_name      : string;
    other_names     : string | null;
    preferred_name  : string | null;
    date_of_birth   : Date | null;
    gender          : string;
    gender_label    : string;
    phone_number    : string | null;
    email           : string | null;
    notes           : string | null;
    create_date     : Date;
    created_by      : string;
    change_date     : Date | null;
    changed_by      : string | null;
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

export default function EnseignantsPage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string }>;
}) {
  const { clientCode, ecoleId } = use(params);

  const [anneeScolaire, setAnneeScolaire] = useState<DisplayAnneeScolaireDO | null>(null);
  const [enseignants, setEnseignants] = useState<DisplayEnseignantDO[]>([]);
  const [pageActions, setPageActions] = useState<InfoMenuItemLinkActionDO[]>([]);
  const [enseignantLinks, setEnseignantLinks] = useState<InfoMenuItemLinkActionDO[]>([]);
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

        const [resEnseignants, resActions, resLinks] = await Promise.all([
          fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/enseignants`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/enseignants/actions`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/enseignants/links`, { method: 'GET', headers })
        ]);

        const data = await resEnseignants.json();
        if (!resEnseignants.ok) {
          throw new Error(data.message || 'Erreur lors de la récupération des enseignants');
        }

        setAnneeScolaire(data.anneescolaire ?? null);
        setEnseignants(data.enseignants ?? []);

        const actionsData = resActions.ok ? await resActions.json() : [];
        const linksData = resLinks.ok ? await resLinks.json() : [];

        const parsedActions: InfoMenuItemLinkActionDO[] = Array.isArray(actionsData) ? actionsData : actionsData.actions || [];
        setPageActions(parsedActions.sort((a, b) => a.order - b.order));

        const parsedLinks: InfoMenuItemLinkActionDO[] = Array.isArray(linksData) ? linksData : linksData.links || [];
        setEnseignantLinks(parsedLinks.sort((a, b) => a.order - b.order));
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientCode, ecoleId]);

  const enseignantsRoute = `/${clientCode}/admin_client/ecoles/${ecoleId}/enseignants`;

  // Every search word must match one of the teacher's names
  const searchTerms = normalizeText(search).split(/\s+/).filter(Boolean);
  const filteredEnseignants = enseignants.filter((enseignant) => {
    const names = normalizeText(
      [enseignant.first_name, enseignant.last_name, enseignant.other_names, enseignant.preferred_name].filter(Boolean).join(' ')
    );
    return searchTerms.every((term) => names.includes(term));
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 text-teal-primary animate-spin mb-4" />
        <p className="text-gray-500">Chargement des enseignants...</p>
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
        <div>
          <h2 className="text-2xl font-bold text-charcoal-secondary">Enseignants</h2>
          {anneeScolaire?.label && (
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-teal-50 text-teal-primary rounded-lg text-sm font-medium">
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>Année scolaire : {anneeScolaire.label}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {pageActions.map(action => (
            <Link
              key={action.id}
              href={`${enseignantsRoute}${action.end_route}`}
              title={action.description || action.display_name}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm shrink-0"
            >
              <LucideIconByName name={action.icon_name} fallback={Zap} className="w-5 h-5 shrink-0" />
              <span className="font-medium">{action.display_name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {enseignants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <UserRound className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Aucun enseignant n&apos;est actuellement associé à cette école.
          </p>
          {pageActions.length > 0 && (
            <Link
              href={`${enseignantsRoute}${pageActions[0].end_route}`}
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
              placeholder="Rechercher un enseignant par nom ou prénom..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-charcoal-secondary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-primary/30 focus:border-teal-primary"
            />
          </div>

          {filteredEnseignants.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Aucun enseignant ne correspond à « {search.trim()} ».
            </p>
          ) : (
            /* ================= ENSEIGNANTS LIST ================= */
            <div className="flex flex-col space-y-3">
              {filteredEnseignants.map((enseignant) => {
                const fullName = `${enseignant.last_name} ${enseignant.first_name}`;

                return (
                  <div
                    key={enseignant.id}
                    className="flex flex-col xl:flex-row xl:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-4"
                  >
                    {/* Enseignant Info */}
                    <div className="flex items-center space-x-3 truncate">
                      <div className="p-2 bg-teal-primary/10 rounded-lg text-teal-primary shrink-0">
                        <UserRound className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <h3 className="font-semibold text-charcoal-secondary truncate" title={fullName}>
                          {fullName}
                          {enseignant.preferred_name && (
                            <span className="ml-1.5 font-normal text-gray-500">({enseignant.preferred_name})</span>
                          )}
                        </h3>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1" title="Matricule">
                            <Hash className="w-4 h-4 shrink-0 text-teal-primary" />
                            {enseignant.matricule}
                          </span>
                          {enseignant.gender_label && <span>{enseignant.gender_label}</span>}
                          {enseignant.phone_number && (
                            <span className="inline-flex items-center gap-1" title="Téléphone">
                              <Phone className="w-4 h-4 shrink-0 text-teal-primary" />
                              {enseignant.phone_number}
                            </span>
                          )}
                          {enseignant.email && (
                            <span className="inline-flex items-center gap-1 truncate" title="Email">
                              <Mail className="w-4 h-4 shrink-0 text-teal-primary" />
                              <span className="truncate">{enseignant.email}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Action Links */}
                    <div className="flex items-center flex-wrap gap-2 shrink-0">
                      {enseignantLinks.map((link) => (
                        <Link
                          key={link.id}
                          href={`${enseignantsRoute}/${enseignant.id}${link.end_route}`}
                          title={link.description || link.display_name}
                          className="flex items-center space-x-1.5 px-3 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm"
                        >
                          <LucideIconByName name={link.icon_name} fallback={LinkIcon} className="w-4 h-4 shrink-0" />
                          <span className="hidden md:inline text-sm font-medium">{link.display_name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
