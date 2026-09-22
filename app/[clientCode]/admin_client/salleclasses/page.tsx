/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth'; //[cite: 1]

// Destructure the static icons needed for the base layout
const { Loader2, Presentation, Plus, Download, Link: LinkIcon, School } = LucideIcons;

type AdminClientSalleClasseDisplay = {
    id: string;
    ecole_id: string;
    ecole_label: string;
    annee_scolaire_id: string;
    annee_scolaire_label: string;
    classe_id: string;
    classe_label: string;
    code: string;
    description: string | null;
    notes: string | null;
    create_date: Date;
    created_by: string;
    change_date: Date | null;
    changed_by: string | null;
};

// Types for the dynamic API endpoints[cite: 1]
type DynamicAction = {
    id: string;
    display_name: string;
    icon_name: string;
    end_route: string;
    description: string | null;
};

type DynamicClassLink = {
    id: string;
    display_name: string;
    icon_name: string;
    end_route: string;
    description: string | null;
};

export default function SalleClassesPage({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = use(params); //[cite: 1]
  const router = useRouter(); //[cite: 1]
  
  const [salleClasses, setSalleClasses] = useState<AdminClientSalleClasseDisplay[]>([]);
  const [pageActions, setPageActions] = useState<DynamicAction[]>([]);
  const [classLinks, setClassLinks] = useState<DynamicClassLink[]>([]);
  
  const [loading, setLoading] = useState(true); //[cite: 1]
  const [error, setError] = useState(''); //[cite: 1]
  const [isDownloading, setIsDownloading] = useState(false); //[cite: 1]

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string; //[cite: 1]
        const token = getCookie(cookieName); //[cite: 1]

        if (!token) {
            if (cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
          router.push(`/${clientCode}/login`);
          return;
        }

        // Fetch classes, page actions, and links concurrently[cite: 1]
        const [salleClassesRes, actionsRes, linksRes] = await Promise.all([
            fetch(`${API_BASE_URL}/${clientCode}/admin_client/salleclasses`, { 
              method: 'GET', 
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              } 
            }),
            fetch(`${API_BASE_URL}/${clientCode}/admin_client/salleclasses/actions`, { 
              method: 'GET', 
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              } 
            }),
            fetch(`${API_BASE_URL}/${clientCode}/admin_client/salleclasses/links`, { 
              method: 'GET', 
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              } 
            })
        ]);

        // Redirect to login if token is expired/invalid[cite: 1]
        if (salleClassesRes.status === 400 || actionsRes.status === 400 || linksRes.status === 400) {
            const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
            if (cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
            router.push(`/${clientCode}/login`);
            return;
        }

        if (!salleClassesRes.ok) throw new Error('Erreur lors de la récupération de la liste des classes');
        
        const classesData = await salleClassesRes.json();
        const actionsData = actionsRes.ok ? await actionsRes.json() : [];
        const linksData = linksRes.ok ? await linksRes.json() : [];

        // Map to clientSalleClasses as requested
        setSalleClasses(Array.isArray(classesData) ? classesData : classesData.clientSalleClasses || []);
        setPageActions(Array.isArray(actionsData) ? actionsData : actionsData.actions || []); //[cite: 1]
        setClassLinks(Array.isArray(linksData) ? linksData : linksData.links || []); //[cite: 1]

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue'); //[cite: 1]
      } finally {
        setLoading(false); //[cite: 1]
      }
    };

    fetchAllData();
  }, [clientCode, router]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true); //[cite: 1]
      //const token = sessionStorage.getItem('token'); //[cite: 1]
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
      const token = getCookie(cookieName);

      if (!token) {
        router.push(`/${clientCode}/login`);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/salleclasses/exportpdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, //[cite: 1]
        },
      });

      if (res.status === 401) {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        if (cookieName) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
        router.push(`/${clientCode}/login`);
        return;
      }

      if (!res.ok) {
        const errorText = await res.text(); //[cite: 1]
        throw new Error(`Erreur ${res.status}: ${errorText}`); //[cite: 1]
      }

      const blob = await res.blob(); //[cite: 1]
      const url = window.URL.createObjectURL(blob); //[cite: 1]
      const a = document.createElement('a'); //[cite: 1]
      a.href = url; //[cite: 1]
      a.download = `classes_statistiques_${new Date().toISOString().split('T')[0]}.pdf`; //[cite: 1]
      document.body.appendChild(a); //[cite: 1]
      a.click(); //[cite: 1]
      a.remove(); //[cite: 1]
      window.URL.revokeObjectURL(url); //[cite: 1]
    } catch (err) {
      console.error(err);
      alert("Impossible de télécharger le PDF pour le moment. Veuillez vérifier la connexion au serveur."); //[cite: 1]
    } finally {
      setIsDownloading(false); //[cite: 1]
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-secondary">Liste des Classes</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos salles de classe.
          </p>
        </div>
        
        <div className="flex items-center flex-wrap gap-3">
          {/* Dynamic Page Actions */}
          {pageActions.map((action) => {
            const ActionIcon = LucideIcons[action.icon_name as keyof typeof LucideIcons] as React.ElementType; //[cite: 1]
            
            return (
              <Link
                key={action.id} //[cite: 1]
                href={`/${clientCode}/admin_client/salleclasses${action.end_route}`} //[cite: 1]
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-gray-200 text-charcoal-secondary rounded-lg hover:bg-gray-50 transition-colors shadow-sm" //[cite: 1]
              >
                {ActionIcon && <ActionIcon className="w-5 h-5 shrink-0" />}
                <span className="font-medium">{action.display_name}</span>
              </Link>
            );
          })}

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF} //[cite: 1]
            disabled={isDownloading || salleClasses.length === 0} //[cite: 1]
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-gray-200 text-charcoal-secondary rounded-lg hover:bg-gray-50 hover:text-teal-primary hover:border-teal-primary/30 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" //[cite: 1]
          >
            {isDownloading ? ( //[cite: 1]
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

      {salleClasses.length === 0 ? ( //[cite: 1]
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <Presentation className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Aucune classe n&apos;est actuellement associée à ce client. Commencez par en ajouter une.
          </p>
          <Link
            href={`/${clientCode}/admin_client/salleclasses/addclasse`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm" //[cite: 1]
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="font-medium">Créer une classe</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {salleClasses.map((salleClasse) => { //[cite: 1]
            return (
              <div 
                key={salleClasse.id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-4" //[cite: 1]
              >
                {/* Classe Info */}
                <div className="flex items-center space-x-3 truncate">
                  <div className="p-2 bg-teal-primary/10 rounded-lg text-teal-primary shrink-0">
                    <Presentation className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-charcoal-secondary truncate" title={salleClasse.classe_label}>
                      {salleClasse.code} - {salleClasse.classe_label}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 space-x-2 mt-0.5">
                      <span className="flex items-center"><School className="w-3 h-3 mr-1" /> {salleClasse.ecole_label}</span>
                      <span>•</span>
                      <span>{salleClasse.annee_scolaire_label}</span>
                    </div>
                  </div>
                </div>
                
                {/* Dynamic Action Links per Class */}
                <div className="flex items-center flex-wrap gap-2 shrink-0">
                  {classLinks.map((link) => { //[cite: 1]
                    const LinkActionIcon = LucideIcons[link.icon_name as keyof typeof LucideIcons] as React.ElementType; //[cite: 1]
                    
                    return (
                      <Link
                        key={link.id} //[cite: 1]
                        href={`/${clientCode}/admin_client/salleclasses/${salleClasse.id}${link.end_route}`} //[cite: 1]
                        className="group flex items-center space-x-1.5 px-3 py-2 bg-teal-primary/5 border border-teal-primary/30 rounded-lg text-teal-primary hover:bg-teal-primary hover:text-white hover:border-teal-primary transition-colors" //[cite: 1]
                        title={link.description || ' '} //[cite: 1]
                      >
                        {LinkActionIcon ? ( //[cite: 1]
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