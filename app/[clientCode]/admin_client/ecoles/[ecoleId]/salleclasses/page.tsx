/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { 
  Loader2, 
  BookOpen, 
  Plus, 
  CalendarDays, 
  ClipboardCheck, 
  GraduationCap, 
  Eye, 
  Edit 
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/auth';

// Define a reasonable type for a classroom. 
// Adjust these fields based on your actual database schema.
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

export default function ClassesPage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string }>;
}) {
  const { clientCode, ecoleId } = use(params);
  
  const [classes, setClasses] = useState<ClassroomDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = sessionStorage.getItem('token');

        if (!token) {
          throw new Error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        }

        // Adjust the endpoint to match your API for fetching classes of a specific school
        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Erreur lors de la récupération de la liste des classes');
        }

        const jsonData = await res.json();
        setClasses(Array.isArray(jsonData) ? jsonData : jsonData.salleClasses || []);
        console.log("Classes = ", jsonData.salleClasses);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [clientCode, ecoleId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
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
          <h2 className="text-2xl font-bold text-charcoal-secondary">Liste des Classes</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les classes de cette école, leurs emplois du temps et évaluations.
          </p>
        </div>
        
        {/* Button to add a classroom */}
        <Link
          href={`/${clientCode}/admin_client/ecoles/${ecoleId}/classes/new`}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-5 h-5 shrink-0" />
          <span className="font-medium">Nouvelle classe</span>
        </Link>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <BookOpen className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Aucune classe n&apos;est actuellement associée à cette école. Commencez par en ajouter une.
          </p>
          <Link
            href={`/${clientCode}/admin_client/ecoles/${ecoleId}/classes/new`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="font-medium">Créer une classe</span>
          </Link>
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
              
              {/* Action Links */}
              <div className="flex items-center flex-wrap gap-2 shrink-0">
                
                {/* Link to Timetable (Teal Primary) */}
                <Link
                  href={`/${clientCode}/admin_client/ecoles/${ecoleId}/classes/${cls.id}/emploi-du-temps`}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-teal-primary/5 border border-teal-primary/30 rounded-lg text-teal-primary hover:bg-teal-primary hover:text-white hover:border-teal-primary transition-colors"
                  title="Emploi du temps"
                >
                  <CalendarDays className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline text-sm font-medium">Emploi du temps</span>
                </Link>

                {/* Link to Evaluations (Coral Accent) */}
                <Link
                  href={`/${clientCode}/admin_client/ecoles/${ecoleId}/classes/${cls.id}/evaluations`}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-coral-accent/5 border border-coral-accent/30 rounded-lg text-coral-accent hover:bg-coral-accent hover:text-white hover:border-coral-accent transition-colors"
                  title="Évaluations"
                >
                  <ClipboardCheck className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline text-sm font-medium">Évaluations</span>
                </Link>

                {/* Link to Teachers (Charcoal Secondary) */}
                <Link
                  href={`/${clientCode}/admin_client/ecoles/${ecoleId}/classes/${cls.id}/enseignants`}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-charcoal-secondary/5 border border-charcoal-secondary/30 rounded-lg text-charcoal-secondary hover:bg-charcoal-secondary hover:text-white hover:border-charcoal-secondary transition-colors"
                  title="Enseignants"
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline text-sm font-medium">Enseignants</span>
                </Link>

                <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>

                {/* Details & Edit Links */}
                <Link
                  href={`/${clientCode}/admin_client/ecoles/${ecoleId}/classes/${cls.id}`}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-teal-primary hover:border-teal-primary/50 transition-colors"
                  title="Détails"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline text-sm font-medium">Détails</span>
                </Link>

                <Link
                  href={`/${clientCode}/admin_client/ecoles/${ecoleId}/classes/${cls.id}/edit`}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-charcoal-secondary hover:border-charcoal-secondary/50 transition-colors"
                  title="Mettre à jour"
                >
                  <Edit className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline text-sm font-medium">Mettre à jour</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}