/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

// Destructure the static icons needed for the base layout
const { Loader2, Users, Plus, Download, Link: LinkIcon } = LucideIcons;

type DisplayEleveDO = {
    id: string;
    first_name: string;
    last_name: string;
    matricule: string | null;
    birth_date: Date | null;
    gender: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    create_date: Date;
    created_by: string;
    change_date: Date | null;
    changed_by: string | null;
};

// Types for the dynamic API endpoints
type DynamicAction = {
    id: string;
    display_name: string;
    icon_name: string;
    end_route: string;
    description: string | null;
};

type DynamicEleveLink = {
    id: string;
    display_name: string;
    icon_name: string;
    end_route: string;
    description: string | null;
};

// Sub-component to handle fetching and displaying the student's photo
function EleveAvatar({ clientCode, matricule, eleveName }: { clientCode: string; matricule: string | null; eleveName: string }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!matricule) {
        setLoading(false);
        return;
      }

      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
      const token = getCookie(cookieName);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/eleves/getelevephoto`, {
          method: 'POST', // Assuming POST since data is sent in the body
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ matricule })
        });

        if (res.ok) {
          const data = await res.json();
          // Adjust this property ('url', 'photo', 'photo_url') based on your actual API response structure
          if (data.photo) setPhotoUrl(data.photo);
        }
      } catch (err) {
        console.error(`Erreur lors de la récupération de la photo pour le matricule ${matricule}`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [clientCode, matricule]);

  if (loading || !photoUrl) {
    return (
      <div className="flex items-center justify-center w-10 h-10 bg-teal-primary/10 rounded-full text-teal-primary shrink-0">
        <Users className="w-5 h-5" />
      </div>
    );
  }

  return (
    <img 
      src={photoUrl} 
      alt={`Photo de ${eleveName}`} 
      className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200 shadow-sm"
    />
  );
}

export default function ElevesPage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string }>;
}) {
  const { clientCode, ecoleId } = use(params);
  const router = useRouter();
  
  const [eleves, setEleves] = useState<DisplayEleveDO[]>([]);
  const [ecoleName, setEcoleName] = useState<string>('');
  const [pageActions, setPageActions] = useState<DynamicAction[]>([]);
  const [eleveLinks, setEleveLinks] = useState<DynamicEleveLink[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);

        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch eleves, page actions, and eleve links concurrently
        const [elevesRes, actionsRes, linksRes] = await Promise.all([
            fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/eleves`, { 
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

        // Redirect to login if token is expired/invalid (401 Unauthorized)
        if (elevesRes.status === 400 || actionsRes.status === 400 || linksRes.status === 400) {
          if (!token && cookieName)
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          router.push('/login');
          return;
        }

        if (!elevesRes.ok) throw new Error('Erreur lors de la récupération de la liste des élèves');
        
        const elevesData = await elevesRes.json();
        const actionsData = actionsRes.ok ? await actionsRes.json() : [];
        const linksData = linksRes.ok ? await linksRes.json() : [];

        // Extract school name if present in the response
        if (elevesData && elevesData.ecole) {
            setEcoleName(elevesData.ecole.short_name || elevesData.ecole.full_name || '');
        }

        setEleves(Array.isArray(elevesData) ? elevesData : elevesData.eleves || []);
        setPageActions(Array.isArray(actionsData) ? actionsData : actionsData.actions || []);
        setEleveLinks(Array.isArray(linksData) ? linksData : linksData.links || []);

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [clientCode, ecoleId, router]);

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
          <h2 className="text-2xl font-bold text-charcoal-secondary">
            Liste des Élèves {ecoleName && `(${ecoleName})`}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les élèves de cette école.
          </p>
        </div>
        
        <div className="flex items-center flex-wrap gap-3">
          {/* Dynamic Page Actions */}
          {pageActions.map((action) => {
            const ActionIcon = LucideIcons[action.icon_name as keyof typeof LucideIcons] as React.ElementType;
            
            return (
              <Link
                key={action.id}
                href={`/${clientCode}/admin_client/ecoles/${ecoleId}/eleves${action.end_route}`}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-gray-200 text-charcoal-secondary rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                {ActionIcon && <ActionIcon className="w-5 h-5 shrink-0" />}
                <span className="font-medium">{action.display_name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {eleves.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <Users className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Aucun élève n&apos;est actuellement associé à cette école. Commencez par en ajouter un.
          </p>
          <Link
            href={`/${clientCode}/admin_client/ecoles/${ecoleId}/eleves/addeleve`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="font-medium">Créer un élève</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {eleves.map((eleve) => {
            return (
              <div 
                key={eleve.id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-4"
              >
                {/* Eleve Info with Avatar */}
                <div className="flex items-center space-x-4 truncate">
                  <EleveAvatar 
                    clientCode={clientCode} 
                    matricule={eleve.matricule} 
                    eleveName={`${eleve.first_name} ${eleve.last_name}`} 
                  />
                  <h3 className="font-semibold text-charcoal-secondary truncate" title={`${eleve.first_name} ${eleve.last_name}`}>
                    {eleve.first_name} {eleve.last_name} {eleve.matricule ? `(${eleve.matricule})` : ''}
                  </h3>
                </div>
                
                {/* Dynamic Action Links per Eleve */}
                <div className="flex items-center flex-wrap gap-2 shrink-0">
                  {eleveLinks.map((link) => {
                    const LinkActionIcon = LucideIcons[link.icon_name as keyof typeof LucideIcons] as React.ElementType;
                    
                    return (
                      <Link
                        key={link.id}
                        href={`/${clientCode}/admin_client/ecoles/${ecoleId}/eleves/${eleve.id}${link.end_route}`}
                        className="group flex items-center space-x-1.5 px-3 py-2 bg-teal-primary/5 border border-teal-primary/30 rounded-lg text-teal-primary hover:bg-teal-primary hover:text-white hover:border-teal-primary transition-colors"
                        title={link.description || ' '}
                      >
                        {LinkActionIcon ? (
                          <LinkActionIcon className="w-4 h-4 shrink-0" />
                        ) : (
                          <LinkIcon className="w-4 h-4 shrink-0" />
                        )}
                        <span className="hidden xl:inline text-sm font-medium">{link.display_name}</span>
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