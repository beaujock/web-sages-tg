/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
// 1. Added Download to lucide-react imports
import { Loader2, School, Eye, Edit, Plus, BookOpen, GraduationCap, Users, Download } from 'lucide-react';
import { API_BASE_URL } from '@/lib/auth';

type AdminClientEcoleDisplay = {
    id                      : string,
    full_name               : string,
    short_name              : string|null,
    establishment_date      : Date|null;
    code                    : string,
    primary_contact_name    : string|null,
    secondary_contact_name  : string|null,
    contact_infos           : string|null,
    phone_number            : string|null,
    email                   : string|null,
    website                 : string|null,
    notes                   : string|null,
    create_date             : Date,
    created_by              : string,
    change_date             : Date|null,
    changed_by              : string|null
};

type AdminClientEcoleOverview = {
    ecole               : AdminClientEcoleDisplay;
    numberSalleClasses  : number;
    numberEnseignants   : number;
    numberEleves        : number;
};

export default function EcolesPage({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = use(params);
  
  const [ecolesOverviews, setEcolesOverviews] = useState<AdminClientEcoleOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 2. Added state to handle the PDF download loading UI
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchEcoles = async () => {
      try {
        const token = sessionStorage.getItem('token');

        if (!token) {
          throw new Error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        }

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Erreur lors de la récupération de la liste des écoles');
        }

        const jsonData = await res.json();
        setEcolesOverviews(Array.isArray(jsonData) ? jsonData : jsonData.clientEcolesOverviews || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchEcoles();
  }, [clientCode]);

  // 3. Added the PDF download handler function
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const token = sessionStorage.getItem('token');

      // Replace '/export/pdf' with your actual API endpoint that generates the PDF
      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/exportpdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        // Read the error message sent by the backend
        const errorText = await res.text();
        console.error("Status de l'erreur:", res.status);
        console.error("Message du serveur:", errorText);
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }

      // Convert the response to a blob and trigger a browser download
      const blob = await res.blob();
      console.log("Blob = ", blob);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Set a dynamic file name with the current date
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
          <h2 className="text-2xl font-bold text-charcoal-secondary">Liste des Écoles</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos écoles et consultez leurs statistiques.
          </p>
        </div>
        
        {/* 4. Action buttons container */}
        <div className="flex items-center gap-3">
          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || ecolesOverviews.length === 0}
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

          {/* Create School Button */}
          <Link
            href={`/${clientCode}/admin_client/ecoles/new`}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="font-medium">Nouvelle école</span>
          </Link>
        </div>
      </div>

      {ecolesOverviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <School className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Aucune école n&apos;est actuellement associée à ce client. Commencez par en ajouter une.
          </p>
          <Link
            href={`/${clientCode}/admin_client/ecoles/new`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="font-medium">Créer une école</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {ecolesOverviews.map((overview) => {
            const ecole = overview.ecole; 
            
            return (
              <div 
                key={ecole.id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-4"
              >
                {/* Ecole Info */}
                <div className="flex items-center space-x-3 truncate">
                  <div className="p-2 bg-teal-primary/10 rounded-lg text-teal-primary shrink-0">
                    <School className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-charcoal-secondary truncate" title={ecole.full_name}>
                    {ecole.short_name || ecole.full_name || 'École sans nom'}
                  </h3>
                </div>
                
                {/* Action Links */}
                <div className="flex items-center flex-wrap gap-2 shrink-0">
                  <Link
                    href={`/${clientCode}/admin_client/ecoles/${ecole.id}/salleclasses`}
                    className="group flex items-center space-x-1.5 px-3 py-2 bg-teal-primary/5 border border-teal-primary/30 rounded-lg text-teal-primary hover:bg-teal-primary hover:text-white hover:border-teal-primary transition-colors"
                    title="Classes"
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline text-sm font-medium">Classes</span>
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 ml-1 text-xs font-bold bg-teal-primary/10 text-teal-primary rounded-full group-hover:bg-white group-hover:text-teal-primary transition-colors">
                      {overview.numberSalleClasses}
                    </span>
                  </Link>

                  <Link
                    href={`/${clientCode}/admin_client/ecoles/${ecole.id}/enseignants`}
                    className="group flex items-center space-x-1.5 px-3 py-2 bg-coral-accent/5 border border-coral-accent/30 rounded-lg text-coral-accent hover:bg-coral-accent hover:text-white hover:border-coral-accent transition-colors"
                    title="Enseignants"
                  >
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline text-sm font-medium">Enseignants</span>
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 ml-1 text-xs font-bold bg-coral-accent/10 text-coral-accent rounded-full group-hover:bg-white group-hover:text-coral-accent transition-colors">
                      {overview.numberEnseignants}
                    </span>
                  </Link>

                  <Link
                    href={`/${clientCode}/admin_client/ecoles/${ecole.id}/eleves`}
                    className="group flex items-center space-x-1.5 px-3 py-2 bg-charcoal-secondary/5 border border-charcoal-secondary/30 rounded-lg text-charcoal-secondary hover:bg-charcoal-secondary hover:text-white hover:border-charcoal-secondary transition-colors"
                    title="Élèves"
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline text-sm font-medium">Élèves</span>
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 ml-1 text-xs font-bold bg-charcoal-secondary/10 text-charcoal-secondary rounded-full group-hover:bg-white group-hover:text-charcoal-secondary transition-colors">
                      {overview.numberEleves}
                    </span>
                  </Link>

                  <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>

                  <Link
                    href={`/${clientCode}/admin_client/ecoles/${ecole.id}`}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-teal-primary hover:border-teal-primary/50 transition-colors"
                    title="Détails"
                  >
                    <Eye className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline text-sm font-medium">Détails</span>
                  </Link>

                  <Link
                    href={`/${clientCode}/admin_client/ecoles/${ecole.id}/edit`}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-charcoal-secondary hover:border-charcoal-secondary/50 transition-colors"
                    title="Mettre à jour"
                  >
                    <Edit className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline text-sm font-medium">Mettre à jour</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}