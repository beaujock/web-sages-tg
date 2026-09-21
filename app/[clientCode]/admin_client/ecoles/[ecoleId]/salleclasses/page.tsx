/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { Loader2, BookOpen, Plus } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

type ClassroomDisplay = {
    id                       : string,
    ecole_id                 : string,
    ecole_label              : string,
    annee_scolaire_id        : string,
    annee_scolaire_label     : string,
    classe_id                : string,
    classe_label             : string,
    code                     : string,
    description              : string|null,
    notes                    : string|null,
    create_date              : Date,
    created_by               : string,
    change_date              : Date|null,
    changed_by               : string|null
};

type InfoMenuItemLinkActionDO = {
    id           : string;
    display_name : string;
    icon_name    : string | null;
    end_route    : string;
    order        : number;
    description  : string | null;
};

const renderIcon = (iconName?: string | null, className: string = "w-4 h-4 shrink-0") => {
  if (!iconName) return <LucideIcons.Settings className={className} />;
  
  // Dynamically access the Lucide component based on the exact string returned from the API
  const IconComponent = (LucideIcons as any)[iconName];
  
  if (!IconComponent) {
    return <LucideIcons.MoreHorizontal className={className} />;
  }
  
  return <IconComponent className={className} />;
};

export default function ClassesPage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string }>;
}) {
  const { clientCode, ecoleId } = use(params);
  
  const [classes, setClasses] = useState<ClassroomDisplay[]>([]);
  const [pageActions, setPageActions] = useState<InfoMenuItemLinkActionDO[]>([]);
  const [classLinks, setClassLinks] = useState<InfoMenuItemLinkActionDO[]>([]);
  const [schoolName, setSchoolName] = useState<string>("l'école");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        //const token = sessionStorage.getItem('token');
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

        const jsonData = await resClasses.json();
        const actionsData = resActions.ok ? await resActions.json() : [];
        const linksData = resLinks.ok ? await resLinks.json() : [];
        
        if (resClasses.status === 400 || !resClasses.ok) {
          throw new Error(Array.isArray(jsonData) ? jsonData : jsonData.message || []);
        }

        setClasses(Array.isArray(jsonData) ? jsonData : jsonData.salleClasses || []);
        
        const parsedActions: InfoMenuItemLinkActionDO[] = Array.isArray(actionsData) ? actionsData : actionsData.actions || [];
        setPageActions(parsedActions.sort((a, b) => a.order - b.order));
        
        const parsedLinks: InfoMenuItemLinkActionDO[] = Array.isArray(linksData) ? linksData : linksData.links || [];
        setClassLinks(parsedLinks.sort((a, b) => a.order - b.order));

        console.log("Actions : ", parsedActions);
        console.log("Links : ", parsedLinks);
        
        if (!Array.isArray(jsonData) && jsonData.ecole) {
          setSchoolName(jsonData.ecole.short_name || jsonData.ecole.full_name || "l'école");
        } else if (Array.isArray(jsonData) && jsonData.length > 0) {
          setSchoolName(jsonData[0].ecole_label || "l'école");
        }

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientCode, ecoleId]);

  const buildUrl = (template: string, classId?: string) => {
    let url = template
      .replace('[codeClient]', clientCode)
      .replace('[ecoleId]', ecoleId);
      
    if (classId) {
      url = url.replace('[classId]', classId).replace('[id]', classId);
    }
    
    if (!url.startsWith('/')) {
        url = `/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/${classId ? `${classId}/${url}` : url}`;
    }
    
    return url;
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
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-secondary">
            Classes ({schoolName})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Accès aux classes, leurs élèves, emplois du temps, évaluations et enseignants
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          {pageActions.length > 0 ? (
            pageActions.map(action => (
              <Link
                key={action.id}
                
                href={`/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses${action.end_route}`}
                title={action.description || action.display_name}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm shrink-0"
              >
                {renderIcon(action.icon_name, "w-5 h-5 shrink-0")}
                <span className="font-medium">{action.display_name}</span>
              </Link>
            ))
          ) : (
            <Link
              href={`/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/addsalleclasse`}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm shrink-0"
            >
              <Plus className="w-5 h-5 shrink-0" />
              <span className="font-medium">Nouvelle classe</span>
            </Link>
          )}
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <BookOpen className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Aucune classe n&apos;est actuellement associée à cette école. Commencez par en ajouter une.
          </p>
          {pageActions.length > 0 && (
             <Link
             href={buildUrl(pageActions[0].end_route)}
             title={pageActions[0].description || pageActions[0].display_name}
             className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm"
           >
             {renderIcon(pageActions[0].icon_name, "w-5 h-5 shrink-0")}
             <span className="font-medium">{pageActions[0].display_name}</span>
           </Link>
          )}
        </div>
      ) : (
        /* ================= CLASSES LIST ================= */
        <div className="flex flex-col space-y-3">
          {classes.map((cls) => (
            <div 
              key={cls.id} 
              className="flex flex-col xl:flex-row xl:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-4"
            >
              {/* Class Info */}
              <div className="flex items-center space-x-3 truncate">
                <div className="p-2 bg-teal-primary/10 rounded-lg text-teal-primary shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-secondary truncate" title={cls.code}>
                    {cls.code || 'Classe sans nom'}
                  </h3>
                </div>
              </div>
              
              {/* Dynamic Action Links */}
              <div className="flex items-center flex-wrap gap-2 shrink-0">
                {classLinks.length > 0 ? (
                  classLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={`/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/${cls.id}${link.end_route}`}
                      title={link.description || link.display_name}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {renderIcon(link.icon_name)}
                      <span className="hidden md:inline text-sm font-medium">{link.display_name}</span>
                    </Link>
                  ))
                ) : (
                  //<span className="text-sm text-gray-400 italic">Aucun lien disponible</span>
                  <></>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}