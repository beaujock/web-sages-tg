/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, ClipboardList, DoorOpen, Download, Link as LinkIcon, Loader2, Plus, StickyNote, Zap } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';
import { LucideIconByName } from '@/components/LucideIconByName';

type DisplayInscriptionDO = {
    id                          : string;
    salle_classe_id             : string;
    salle_classe_label          : string;
    eleve_id                    : string;
    eleve_label                 : string;
    registration_date           : Date;
    registration_status         : string;
    registration_status_label   : string;
    status_notes                : string|null;
    notes                       : string|null;
    create_date                 : Date;
    created_by                  : string;
    change_date                 : Date|null;
    changed_by                  : string|null;
};

// Types for the dynamic API endpoints; icon_name is a kebab-case Lucide name (e.g. "door-open", "notebook-pen")
type DynamicAction = {
    id: string;
    display_name: string;
    icon_name: string | null;
    end_route: string;
    description: string | null;
};

type DynamicInscriptionLink = DynamicAction;

// Badge colors per registration_status code; unknown codes fall back to neutral gray
const STATUS_BADGE_CLASSES: Record<string, string> = {
  A: 'bg-green-100 text-green-800',   // Actif
  I: 'bg-gray-100 text-gray-700',     // Inactif
  R: 'bg-red-100 text-red-800',       // Renvoyé
  S: 'bg-amber-100 text-amber-800',   // Suspendu
};

const STATUS_FALLBACK_LABELS: Record<string, string> = {
  A: 'Actif',
  I: 'Inactif',
  R: 'Renvoyé',
  S: 'Suspendu',
};

// Dates arrive from the API as ISO strings, so normalize before formatting
const formatDate = (value: Date | string | null) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
};

export default function InscriptionsPage({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = use(params);
  const router = useRouter();

  const [inscriptions, setInscriptions] = useState<DisplayInscriptionDO[]>([]);
  const [pageActions, setPageActions] = useState<DynamicAction[]>([]);
  const [inscriptionLinks, setInscriptionLinks] = useState<DynamicInscriptionLink[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);

        if (!token) {
          router.push(`/${clientCode}/login`);
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };

        const [inscriptionsRes, actionsRes, linksRes] = await Promise.all([
          fetch(`${API_BASE_URL}/${clientCode}/admin_client/inscriptions`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/${clientCode}/admin_client/inscriptions/actions`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/${clientCode}/admin_client/inscriptions/links`, { method: 'GET', headers }),
        ]);

        // Redirect to login if token is expired/invalid
        const isUnauthorized = (res: Response) => res.status === 401 || res.status === 400;
        if (isUnauthorized(inscriptionsRes) || isUnauthorized(actionsRes) || isUnauthorized(linksRes)) {
          if (cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
          router.push(`/${clientCode}/login`);
          return;
        }

        if (!inscriptionsRes.ok) throw new Error('Erreur lors de la récupération de la liste des inscriptions');

        const inscriptionsData = await inscriptionsRes.json();
        const actionsData = actionsRes.ok ? await actionsRes.json() : [];
        const linksData = linksRes.ok ? await linksRes.json() : [];

        setInscriptions(Array.isArray(inscriptionsData) ? inscriptionsData : inscriptionsData.inscriptions || []);
        setPageActions(Array.isArray(actionsData) ? actionsData : actionsData.actions || []);
        setInscriptionLinks(Array.isArray(linksData) ? linksData : linksData.links || []);

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

      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/inscriptions/exportpdf`, {
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
      a.download = `inscriptions_statistiques_${new Date().toISOString().split('T')[0]}.pdf`;
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
        <p className="text-gray-500">Chargement des inscriptions...</p>
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
          <h2 className="text-2xl font-bold text-charcoal-secondary">Liste des Inscriptions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les inscriptions des élèves dans vos établissements.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Dynamic Page Actions */}
          {pageActions.map((action) => (
            <Link
              key={action.id}
              href={`/${clientCode}/admin_client/inscriptions${action.end_route}`}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-gray-200 text-charcoal-secondary rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              title={action.description || undefined}
            >
              <LucideIconByName name={action.icon_name} fallback={Zap} className="w-5 h-5 shrink-0" />
              <span className="font-medium">{action.display_name}</span>
            </Link>
          ))}

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || inscriptions.length === 0}
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

      {inscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <ClipboardList className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Aucune inscription n&apos;est actuellement enregistrée. Commencez par en ajouter une.
          </p>
          <Link
            href={`/${clientCode}/admin_client/inscriptions/addinscription`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="font-medium">Nouvelle inscription</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {inscriptions.map((inscription) => {
            const registrationDate = formatDate(inscription.registration_date);
            const statusCode = inscription.registration_status?.trim().toUpperCase() ?? '';
            const statusLabel = inscription.registration_status_label || STATUS_FALLBACK_LABELS[statusCode];

            return (
              <div
                key={inscription.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-4"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 bg-teal-primary/10 rounded-lg text-teal-primary shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="font-semibold text-charcoal-secondary truncate" title={inscription.eleve_label}>
                        {inscription.eleve_label || 'Élève sans nom'}
                      </h3>
                      {statusLabel && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE_CLASSES[statusCode] ?? 'bg-gray-100 text-gray-800'}`}
                          title={inscription.status_notes || undefined}
                        >
                          {statusLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500 mt-0.5">
                      <span className="inline-flex items-center gap-1" title="Salle de classe">
                        <DoorOpen className="w-3.5 h-3.5 shrink-0" />
                        {inscription.salle_classe_label}
                      </span>
                      {registrationDate && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1" title="Date d'inscription">
                            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                            {registrationDate}
                          </span>
                        </>
                      )}
                    </div>
                    {inscription.notes && (
                      <p className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1 truncate" title={inscription.notes}>
                        <StickyNote className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{inscription.notes}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Dynamic Action Links per Inscription */}
                <div className="flex items-center flex-wrap gap-2 shrink-0">
                  {inscriptionLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={`/${clientCode}/admin_client/inscriptions/${inscription.id}${link.end_route}`}
                      className="group flex items-center space-x-1.5 px-3 py-2 bg-teal-primary/5 border border-teal-primary/30 rounded-lg text-teal-primary hover:bg-teal-primary hover:text-white hover:border-teal-primary transition-colors"
                      title={link.description || link.display_name}
                    >
                      <LucideIconByName name={link.icon_name} fallback={LinkIcon} className="w-4 h-4 shrink-0" />
                      <span className="hidden xl:inline text-sm font-medium">{link.display_name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
