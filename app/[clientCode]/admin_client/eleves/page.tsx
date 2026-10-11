/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DoorOpen, Download, GraduationCap, Link as LinkIcon, Loader2, Plus, School, Search, X, Zap } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';
import { LucideIconByName } from '@/components/LucideIconByName';

type OverviewEleveDO = {
    id: string;
    eleve_label: string;
    ecole_id: string;
    ecole_label: string;
    annee_scolaire_id: string;
    annee_scolaire_label: string;
    salle_classe_id: string;
    salle_classe_label: string;
    // Not displayed: only used to fetch the photo if the API provides it
    matricule?: string | null;
};

type DynamicAction = {
    id: string;
    display_name: string;
    icon_name: string;
    end_route: string;
    description: string | null;
};

type DynamicStudentLink = {
    id: string;
    display_name: string;
    icon_name: string;
    end_route: string;
    description: string | null;
};

// Sub-component to handle fetching and displaying the student's photo
function EleveAvatar({ clientCode, eleve }: { clientCode: string; eleve: OverviewEleveDO }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhoto = async () => {
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
      const token = getCookie(cookieName);

      if (!token || !eleve.ecole_id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/eleves/getelevephoto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ matricule: eleve.matricule ?? null, eleveId: eleve.id, ecoleId: eleve.ecole_id }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.photo) setPhotoUrl(data.photo);
        }
      } catch (err) {
        console.error(`Erreur lors de la récupération de la photo de l'élève ${eleve.id}`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [clientCode, eleve.id, eleve.ecole_id, eleve.matricule]);

  if (loading || !photoUrl) {
    return (
      <div className="flex items-center justify-center w-10 h-10 bg-teal-primary/10 rounded-full text-teal-primary shrink-0">
        <GraduationCap className="w-5 h-5" />
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={`Photo de ${eleve.eleve_label}`}
      className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200 shadow-sm"
      onError={() => setPhotoUrl(null)}
    />
  );
}

// Lowercase and strip accents so "Éloïse" matches "eloise"
const normalizeText = (value: string | null | undefined) =>
  (value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export default function ElevesPage({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = use(params);
  const router = useRouter();

  const [eleves, setEleves] = useState<OverviewEleveDO[]>([]);
  const [pageActions, setPageActions] = useState<DynamicAction[]>([]);
  const [studentLinks, setStudentLinks] = useState<DynamicStudentLink[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [search, setSearch] = useState('');

  // Every search word must match the name, école, salle de classe or année scolaire
  const searchTerms = normalizeText(search).split(/\s+/).filter(Boolean);
  const filteredEleves = eleves.filter((eleve) => {
    const haystack = normalizeText(
      [eleve.eleve_label, eleve.ecole_label, eleve.salle_classe_label, eleve.annee_scolaire_label].join(' ')
    );
    return searchTerms.every((term) => haystack.includes(term));
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);

        if (!token) {
            if (cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
          router.push(`/${clientCode}/login`);
          return;
        }

        const [elevesRes, actionsRes, linksRes] = await Promise.all([
            fetch(`${API_BASE_URL}/${clientCode}/admin_client/eleves`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              }
            }),
            fetch(`${API_BASE_URL}/${clientCode}/admin_client/eleves/actions`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              }
            }),
            fetch(`${API_BASE_URL}/${clientCode}/admin_client/eleves/links`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              }
            })
        ]);

        if (elevesRes.status === 400 || actionsRes.status === 400 || linksRes.status === 400) {
            if (cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
            router.push(`/${clientCode}/login`);
            return;
        }

        if (!elevesRes.ok) throw new Error('Erreur lors de la récupération de la liste des élèves');

        const elevesData = await elevesRes.json();
        const actionsData = actionsRes.ok ? await actionsRes.json() : [];
        const linksData = linksRes.ok ? await linksRes.json() : [];

        setEleves(Array.isArray(elevesData) ? elevesData : elevesData.clientEleves || []);
        setPageActions(Array.isArray(actionsData) ? actionsData : actionsData.actions || []);
        setStudentLinks(Array.isArray(linksData) ? linksData : linksData.links || []);

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [clientCode, router]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
      const token = getCookie(cookieName);

      if (!token) {
        router.push(`/${clientCode}/login`);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/eleves/exportpdf`, {
        method: 'GET',
        headers: {
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

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eleves_statistiques_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Impossible de télécharger le PDF pour le moment. Veuillez vérifier la connexion au serveur.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 text-teal-primary animate-spin mb-4" />
        <p className="text-gray-500">Chargement des élèves...</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-secondary">Liste des Élèves</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les dossiers des élèves.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {pageActions.map((action) => (
            <Link
              key={action.id}
              href={`/${clientCode}/admin_client/eleves${action.end_route}`}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-gray-200 text-charcoal-secondary rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <LucideIconByName name={action.icon_name} fallback={Zap} className="w-5 h-5 shrink-0" />
              <span className="font-medium">{action.display_name}</span>
            </Link>
          ))}

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || eleves.length === 0}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-gray-200 text-charcoal-secondary rounded-lg hover:bg-gray-50 hover:text-teal-primary hover:border-teal-primary/30 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
            ) : (
              <Download className="w-5 h-5 shrink-0" />
            )}
            <span className="font-medium hidden sm:inline">
              {isDownloading ? 'Génération...' : 'Télécharger PDF'}
            </span>
          </button>
        </div>
      </div>

      {eleves.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <GraduationCap className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Aucun élève n&apos;est actuellement dans la base de données du client. Commencez par en ajouter un.
          </p>
          <Link
            href={`/${clientCode}/admin_client/eleves/addeleve`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="font-medium">Ajouter un élève</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un élève (nom, école, salle de classe...)"
              className="w-full pl-9 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-sm text-charcoal-secondary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-primary/30 focus:border-teal-primary transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal-secondary"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchTerms.length > 0 && (
            <p className="text-xs text-gray-500">
              {filteredEleves.length} élève{filteredEleves.length > 1 ? 's' : ''} sur {eleves.length}
            </p>
          )}

          {filteredEleves.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <Search className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-gray-500 text-center max-w-sm">
                Aucun élève ne correspond à « {search.trim()} ».
              </p>
            </div>
          )}

          {filteredEleves.map((eleve) => (
            <div
              key={eleve.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-4"
            >
              {/* Eleve Info with Avatar */}
              <div className="flex items-center space-x-3 min-w-0">
                <EleveAvatar clientCode={clientCode} eleve={eleve} />
                <div className="flex flex-col min-w-0">
                  <h3 className="font-semibold text-charcoal-secondary truncate" title={eleve.eleve_label}>
                    {eleve.eleve_label}
                  </h3>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    {eleve.ecole_label && (
                      <span
                        className="inline-flex items-center max-w-full px-2 py-0.5 rounded-md bg-coral-accent/10 border border-coral-accent/30 text-coral-accent text-xs font-semibold uppercase tracking-wide"
                        title={eleve.ecole_label}
                      >
                        <School className="w-3.5 h-3.5 mr-1 shrink-0" />
                        <span className="truncate">{eleve.ecole_label}</span>
                      </span>
                    )}
                    {eleve.salle_classe_label ? (
                      <span
                        className="inline-flex items-center max-w-full px-2 py-0.5 rounded-md bg-teal-primary/10 border border-teal-primary/30 text-teal-primary text-xs font-semibold"
                        title={eleve.salle_classe_label}
                      >
                        <DoorOpen className="w-3.5 h-3.5 mr-1 shrink-0" />
                        <span className="truncate">{eleve.salle_classe_label}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Aucune salle de classe</span>
                    )}
                    {eleve.annee_scolaire_label && (
                      <span className="text-xs text-gray-500">{eleve.annee_scolaire_label}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Action Links per Eleve */}
              <div className="flex items-center flex-wrap gap-2 shrink-0">
                {studentLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={`/${clientCode}/admin_client/eleves/${eleve.id}${link.end_route}`}
                    className="group flex items-center space-x-1.5 px-3 py-2 bg-teal-primary/5 border border-teal-primary/30 rounded-lg text-teal-primary hover:bg-teal-primary hover:text-white hover:border-teal-primary transition-colors"
                    title={link.description || ' '}
                  >
                    <LucideIconByName name={link.icon_name} fallback={LinkIcon} className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline text-sm font-medium">{link.display_name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
