/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth'; //[cite: 2]

// Swapped Presentation for GraduationCap for students
const { Loader2, GraduationCap, Plus, Download, Link: LinkIcon, School, Presentation } = LucideIcons;

// NOTE: Update these fields to match your actual API response for an Eleve
type AdminClientEleveDisplay = {
    id: string;
    matricule: string;
    first_name: string;
    last_name: string;
    ecole_id: string;
    ecole_label: string;
    classe_id: string;
    classe_label: string;
    create_date: Date;
    created_by: string;
    change_date: Date | null;
    changed_by: string | null;
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

export default function ElevesPage({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = use(params); 
  const router = useRouter(); 
  
  const [eleves, setEleves] = useState<AdminClientEleveDisplay[]>([]);
  const [pageActions, setPageActions] = useState<DynamicAction[]>([]);
  const [studentLinks, setStudentLinks] = useState<DynamicStudentLink[]>([]);
  
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const [isDownloading, setIsDownloading] = useState(false); 

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
            const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string; //[cite: 2]
            if (cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`; //[cite: 2]
            }
            router.push(`/${clientCode}/login`); //[cite: 2]
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
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
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
          {pageActions.map((action) => {
            const ActionIcon = LucideIcons[action.icon_name as keyof typeof LucideIcons] as React.ElementType; 
            
            return (
              <Link
                key={action.id} 
                href={`/${clientCode}/admin_client/eleves${action.end_route}`}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-gray-200 text-charcoal-secondary rounded-lg hover:bg-gray-50 transition-colors shadow-sm" //[cite: 2]
              >
                {ActionIcon && <ActionIcon className="w-5 h-5 shrink-0" />}
                <span className="font-medium">{action.display_name}</span>
              </Link>
            );
          })}

          <button
            onClick={handleDownloadPDF} 
            disabled={isDownloading || eleves.length === 0} 
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-gray-200 text-charcoal-secondary rounded-lg hover:bg-gray-50 hover:text-teal-primary hover:border-teal-primary/30 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" //[cite: 2]
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
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm" //[cite: 2]
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="font-medium">Ajouter un élève</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {eleves.map((eleve) => {
            return (
              <div 
                key={eleve.id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-4" //[cite: 2]
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="p-2 bg-teal-primary/10 rounded-lg text-teal-primary shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-charcoal-secondary truncate" title={`${eleve.first_name} ${eleve.last_name}`}>
                      {eleve.first_name} {eleve.last_name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 space-x-2 mt-0.5">
                      <span className="flex items-center"><School className="w-3 h-3 mr-1" /> {eleve.ecole_label}</span>
                      <span>•</span>
                      <span className="flex items-center"><Presentation className="w-3 h-3 mr-1" /> {eleve.classe_label}</span>
                      <span>•</span>
                      <span>Matricule: {eleve.matricule}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center flex-wrap gap-2 shrink-0">
                  {studentLinks.map((link) => { 
                    const LinkActionIcon = LucideIcons[link.icon_name as keyof typeof LucideIcons] as React.ElementType; 
                    
                    return (
                      <Link
                        key={link.id} 
                        href={`/${clientCode}/admin_client/eleves/${eleve.id}${link.end_route}`} 
                        className="group flex items-center space-x-1.5 px-3 py-2 bg-teal-primary/5 border border-teal-primary/30 rounded-lg text-teal-primary hover:bg-teal-primary hover:text-white hover:border-teal-primary transition-colors" //[cite: 2]
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