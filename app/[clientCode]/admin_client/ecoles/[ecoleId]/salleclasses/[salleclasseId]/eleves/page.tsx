/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, GraduationCap, CalendarDays, Cake, Phone, Mail, School, Plus } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

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

type DisplaySalleClasseDO = {
    id                       : string;
    ecole_id                 : string;
    ecole_label              : string;
    annee_scolaire_id        : string;
    annee_scolaire_label     : string;
    classe_id                : string;
    classe_label             : string;
    code                     : string;
    description              : string | null;
    notes                    : string | null;
    create_date              : Date;
    created_by               : string;
    change_date              : Date | null;
    changed_by               : string | null;
};

type DisplayEleveDO = {
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

// Dates arrive from the API as ISO strings, so normalize before formatting
const formatDate = (value: Date | string | null) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
};

const fullName = (eleve: DisplayEleveDO) =>
  [eleve.last_name, eleve.first_name, eleve.other_names].filter(Boolean).join(' ');

export default function SalleClasseElevesPage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string; salleclasseId: string }>;
}) {
  const { clientCode, ecoleId, salleclasseId } = use(params);
  const router = useRouter();

  const [anneeScolaire, setAnneeScolaire] = useState<DisplayAnneeScolaireDO | null>(null);
  const [salleClasse, setSalleClasse] = useState<DisplaySalleClasseDO | null>(null);
  const [eleves, setEleves] = useState<DisplayEleveDO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEleves = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);

        if (!token) {
          router.push(`/${clientCode}/login`);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/${salleclasseId}/eleves`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        // Redirect to login if token is expired/invalid
        if (res.status === 401 || res.status === 400) {
          if (cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
          router.push(`/${clientCode}/login`);
          return;
        }

        if (!res.ok) throw new Error('Erreur lors de la récupération des élèves de la classe');

        const data = await res.json();
        setAnneeScolaire(data.anneescolaire ?? null);
        setSalleClasse(data.salleClasse ?? null);
        setEleves(data.eleves ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchEleves();
  }, [clientCode, ecoleId, salleclasseId, router]);

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
      {/* ================= HEADER ================= */}
      <div className="flex items-center space-x-4">
        <Link
          href={`/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses`}
          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors shrink-0"
          title="Retour à la liste des classes"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-charcoal-secondary">
            Élèves {salleClasse?.code ? `(${salleClasse.code})` : ''}
          </h2>
          {salleClasse && (
            <p className="text-sm text-gray-500 mt-1 inline-flex items-center gap-1.5">
              <School className="w-4 h-4 shrink-0" />
              {[salleClasse.ecole_label, salleClasse.classe_label].filter(Boolean).join(' • ')}
            </p>
          )}
          {anneeScolaire?.label && (
            <div className="flex">
              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-teal-50 text-teal-primary rounded-lg text-sm font-medium">
                <CalendarDays className="w-4 h-4 shrink-0" />
                <span>Année scolaire : {anneeScolaire.label}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {eleves.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <GraduationCap className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Aucun élève n&apos;est actuellement inscrit dans cette classe. Commencez par en inscrire un.
          </p>
          <Link
            href={`/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/${salleclasseId}/eleves/addinscription`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="font-medium">Ajouter une inscription</span>
          </Link>
        </div>
      ) : (
        /* ================= ELEVES LIST ================= */
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-charcoal-secondary">{eleves.length}</span> élève{eleves.length > 1 ? 's' : ''}
          </p>
          {eleves.map((eleve) => (
            <div
              key={eleve.id}
              className="flex items-center space-x-3 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white"
            >
              <div className="p-2 bg-teal-primary/10 rounded-lg text-teal-primary shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-charcoal-secondary truncate" title={fullName(eleve)}>
                  {fullName(eleve)}
                  {eleve.preferred_name && (
                    <span className="font-normal text-gray-500"> ({eleve.preferred_name})</span>
                  )}
                </h3>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                  <span className="font-mono">Matricule : {eleve.matricule}</span>
                  {eleve.gender_label && <span>{eleve.gender_label}</span>}
                  {eleve.date_of_birth && (
                    <span className="inline-flex items-center gap-1">
                      <Cake className="w-3.5 h-3.5 shrink-0" />
                      {formatDate(eleve.date_of_birth)}
                    </span>
                  )}
                  {eleve.phone_number && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {eleve.phone_number}
                    </span>
                  )}
                  {eleve.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      {eleve.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
