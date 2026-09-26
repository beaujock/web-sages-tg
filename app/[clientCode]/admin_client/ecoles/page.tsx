/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

// Destructure the static icons needed for the base layout
const { Loader2, School, Plus, Download, Link: LinkIcon } = LucideIcons;

type DisplayClientEcoleDO = {
    id: string;
    client_label: string;
    short_name: string;
};

// Types for the new dynamic API endpoints
type DynamicAction = {
    id: string;
    display_name: string;
    icon_name : string;
    end_route : string;
    description : string|null;
};

type DynamicSchoolLink = {
    id: string;
    display_name: string;
    icon_name : string;
    end_route : string;
    description : string|null;
};

export default function EcolesPage({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = use(params);
  const router = useRouter();
  
  const [ecoles, setEcoles] = useState<DisplayClientEcoleDO[]>([]);
  const [pageActions, setPageActions] = useState<DynamicAction[]>([]);
  const [schoolLinks, setSchoolLinks] = useState<DynamicSchoolLink[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);

        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch schools, page actions, and school links concurrently with Bearer token for each
        const [ecolesRes, actionsRes, linksRes] = await Promise.all([
            fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles`, { 
              method: 'GET', 
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              } 
            }),
            fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/actions`, { 
              method: 'GET', 
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              } 
            }),
            fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/links`, { 
              method: 'GET', 
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              } 
            })
        ]);

        console.log("actions", actionsRes);
        console.log("links", linksRes);

        // Redirect to login if token is expired/invalid (401 Unauthorized)
        if (ecolesRes.status === 400 || actionsRes.status === 400 || linksRes.status === 400) {
          const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string; 
          const token = getCookie(cookieName); 
          if (!token && cookieName)
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          router.push('/login');
          return;
        }

        if (!ecolesRes.ok) throw new Error('Erreur lors de la récupération de la liste des écoles');
        
        const ecolesData = await ecolesRes.json();
        const actionsData = actionsRes.ok ? await actionsRes.json() : [];
        const linksData = linksRes.ok ? await linksRes.json() : [];

        setEcoles(Array.isArray(ecolesData) ? ecolesData : ecolesData.ecoles || []);
        setPageActions(Array.isArray(actionsData) ? actionsData : actionsData.actions || []);
        setSchoolLinks(Array.isArray(linksData) ? linksData : linksData.links || []);

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
        if (cookieName) document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/exportpdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        if (cookieName) document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        router.push('/login');
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
      a.download = `ecoles_statistiques_${new Date().toISOString().split('T')[0]}.pdf`;
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
        <p className="text-gray-500">Chargement des écoles...</p>
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
          <h2 className="text-2xl font-bold text-charcoal-secondary">Liste de vos Écoles</h2>
        </div>
        
        <div className="flex items-center flex-wrap gap-3">
          {/* Dynamic Page Actions */}
          {pageActions.map((action) => {
            const ActionIcon = LucideIcons[action.icon_name as keyof typeof LucideIcons] as React.ElementType;
            
            return (
              <Link
                key={action.id}
                href={`/${clientCode}/admin_client/ecoles${action.end_route}`}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-gray-200 text-charcoal-secondary rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                {ActionIcon && <ActionIcon className="w-5 h-5 shrink-0" />}
                <span className="font-medium">{action.display_name}</span>
              </Link>
            );
          })}

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || ecoles.length === 0}
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

      {ecoles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <School className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Aucune école n&apos;est actuellement associée à ce client. Commencez par en ajouter une.
          </p>
          <Link
            href={`/${clientCode}/admin_client/ecoles/addecole`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="font-medium">Créer une école</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {ecoles.map((ecole) => {
            return (
              <div 
                key={ecole.id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-4"
              >
                {/* Left Side: Ecole Info (Link) + Static Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 truncate">
                  
                  {/* Clickable School Name -> Overview Page */}
                  <Link 
                    href={`/${clientCode}/admin_client/ecoles/${ecole.id}`}
                    className="flex items-center space-x-3 truncate group"
                  >
                    <div className="p-2 bg-teal-primary/10 rounded-lg text-teal-primary shrink-0 group-hover:bg-teal-primary/20 transition-colors">
                      <School className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-charcoal-secondary group-hover:text-teal-primary transition-colors truncate" title={ecole.short_name}>
                      {ecole.short_name || 'École sans nom'}
                    </h3>
                  </Link>

                  {/* Static Detail and Update Buttons */}
                  <div className="flex items-center gap-2 shrink-0 sm:ml-2">
                    <Link
                      href={`/${clientCode}/admin_client/ecoles/${ecole.id}/detail`}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                    >
                      Détails
                    </Link>
                    <Link
                      href={`/${clientCode}/admin_client/ecoles/${ecole.id}/update`}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                    >
                      Modifier
                    </Link>
                  </div>
                </div>
                
                {/* Right Side: Dynamic Action Links per School */}
                <div className="flex items-center flex-wrap gap-2 shrink-0">
                  {schoolLinks.map((link) => {
                    const LinkActionIcon = LucideIcons[link.icon_name as keyof typeof LucideIcons] as React.ElementType;
                    
                    return (
                      <Link
                        key={link.id}
                        href={`/${clientCode}/admin_client/ecoles/${ecole.id}${link.end_route}`}
                        className="group flex items-center space-x-1.5 px-3 py-2 bg-teal-primary/5 border border-teal-primary/30 rounded-lg text-teal-primary hover:bg-teal-primary hover:text-white hover:border-teal-primary transition-colors"
                        title={link.description || ' '}
                      >
                        {LinkActionIcon ? (
                          <LinkActionIcon className="w-4 h-4 shrink-0" />
                        ) : (
                          <LinkIcon className="w-4 h-4 shrink-0" />
                        )}
                        <span className="text-sm font-medium">{link.display_name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}