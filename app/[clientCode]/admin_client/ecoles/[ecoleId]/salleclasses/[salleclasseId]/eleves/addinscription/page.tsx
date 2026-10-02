/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, GraduationCap, Search, Calendar, AlignLeft, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

// Shape of the client-wide eleves list (GET /admin_client/eleves -> clientEleves)
type AdminClientEleveDisplay = {
    id           : string;
    matricule    : string;
    first_name   : string;
    last_name    : string;
    ecole_id     : string;
    ecole_label  : string;
    classe_id    : string;
    classe_label : string;
};

export default function AddInscriptionPage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string; salleclasseId: string }>;
}) {
  const { clientCode, ecoleId, salleclasseId } = use(params);
  const router = useRouter();

  const elevesRoute = `/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/${salleclasseId}/eleves`;

  const [eleves, setEleves] = useState<AdminClientEleveDisplay[]>([]);
  const [search, setSearch] = useState('');
  const [eleveId, setEleveId] = useState('');
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);
  const [registrationNotes, setRegistrationNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/eleves`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 400) {
          if (cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
          router.push(`/${clientCode}/login`);
          return;
        }

        if (!res.ok) throw new Error('Erreur lors de la récupération de la liste des élèves');

        const data = await res.json();
        setEleves(Array.isArray(data) ? data : data.clientEleves || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchEleves();
  }, [clientCode, router]);

  const filteredEleves = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return eleves;
    return eleves.filter((eleve) =>
      `${eleve.last_name} ${eleve.first_name} ${eleve.matricule}`.toLowerCase().includes(term)
    );
  }, [eleves, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eleveId) {
      setError('Veuillez sélectionner un élève.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
      const token = getCookie(cookieName);

      if (!token) {
        router.push(`/${clientCode}/login`);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/${salleclasseId}/eleves/addinscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          salleclasseId,
          eleveId,
          registrationDate,
          registrationNotes: registrationNotes || null,
        }),
      });

      if (res.status === 401) {
        if (cookieName) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
        router.push(`/${clientCode}/login`);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Erreur lors de la création de l\'inscription');
      }

      router.push(elevesRoute);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la création de l\'inscription');
      setIsSubmitting(false);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href={elevesRoute}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors shrink-0"
            title="Retour aux élèves de la classe"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-charcoal-secondary">Ajouter une inscription</h2>
            <p className="text-sm text-gray-500 mt-1">
              Inscrivez un élève existant dans cette classe.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !eleveId}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Enregistrer
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
        {/* ================= ELEVE ================= */}
        <section>
          <h3 className="text-lg font-semibold text-charcoal-secondary border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-gray-400" />
            Élève <span className="text-red-500">*</span>
          </h3>

          <div className="relative mb-3">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou matricule..."
              className="w-full pl-9 p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none"
            />
          </div>

          {filteredEleves.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              {eleves.length === 0 ? 'Aucun élève disponible.' : 'Aucun élève ne correspond à la recherche.'}
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
              {filteredEleves.map((eleve) => {
                const selected = eleve.id === eleveId;
                return (
                  <button
                    key={eleve.id}
                    type="button"
                    onClick={() => setEleveId(eleve.id)}
                    className={`w-full flex items-center justify-between gap-3 p-3 text-left transition-colors ${
                      selected ? 'bg-teal-primary/10' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${selected ? 'text-teal-primary' : 'text-charcoal-secondary'}`}>
                        {eleve.last_name} {eleve.first_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        <span className="font-mono">{eleve.matricule}</span>
                        {eleve.classe_label && <> • {eleve.ecole_label} • {eleve.classe_label}</>}
                      </p>
                    </div>
                    {selected && <CheckCircle2 className="w-5 h-5 text-teal-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ================= INSCRIPTION ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="registrationDate" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4" />
              Date d&apos;inscription <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="registrationDate"
              required
              value={registrationDate}
              onChange={(e) => setRegistrationDate(e.target.value)}
              className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="registrationNotes" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <AlignLeft className="w-4 h-4" />
              Notes
            </label>
            <textarea
              id="registrationNotes"
              value={registrationNotes}
              onChange={(e) => setRegistrationNotes(e.target.value)}
              rows={3}
              placeholder="Ajouter des notes sur cette inscription..."
              className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none resize-y"
            />
          </div>
        </section>
      </div>
    </form>
  );
}
